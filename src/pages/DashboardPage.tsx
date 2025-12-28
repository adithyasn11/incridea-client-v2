import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  fetchSettings,
  fetchVariables,
  updateSetting,
  upsertVariable,
  type SettingsResponse,
  type VariablesResponse,
  type Setting,
  type Variable,
} from '../api/admin'
import {
  EVENT_TYPES,
  addOrganizerToEvent,
  createBranchRepEvent,
  deleteBranchRepEvent,
  fetchBranchRepEvents,
  fetchBranchRepEventDetails,
  removeOrganizerFromEvent,
  searchBranchRepUsers,
  toggleBranchRepEventPublish,
  updateBranchRepEvent,
  type BranchRepEventsResponse,
  type BranchRepEventDetails,
  type EventType,
  type BranchRepUser,
} from '../api/branchRep'
import type { EventCategory, EventTier } from '../api/types'
import { hasRole, normalizeRoles } from '../utils/roles'
import apiClient from '../api/client'
import { showToast } from '../utils/toast'

const ADMIN_TABS = ['Settings', 'Variables'] as const
const BRANCHREP_TABS = ['Branch Events'] as const

type TabKey = (typeof ADMIN_TABS)[number] | (typeof BRANCHREP_TABS)[number]

function DashboardPage() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(() =>
    (typeof window !== 'undefined' ? localStorage.getItem('token') : null),
  )
  const [roles, setRoles] = useState<string[]>([])
  const [isBranchRep, setIsBranchRep] = useState(false)
  const isAdmin = hasRole(roles, 'ADMIN')
  const [activeTab, setActiveTab] = useState<TabKey>('Settings')
  const [variableDrafts, setVariableDrafts] = useState<Record<string, string>>({})
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [newVarKey, setNewVarKey] = useState('')
  const [newVarValue, setNewVarValue] = useState('')
  const [newEventName, setNewEventName] = useState('')
  const [newEventType, setNewEventType] = useState<EventType>(EVENT_TYPES[0])
  const [organizerSearchTerms, setOrganizerSearchTerms] = useState<Record<number, string>>({})
  const [organizerSearchResults, setOrganizerSearchResults] = useState<Record<number, BranchRepUser[]>>({})
  const [organizerSearchLoading, setOrganizerSearchLoading] = useState<Record<number, boolean>>({})
  const [pendingOrganizer, setPendingOrganizer] = useState<{ eventId: number; user: BranchRepUser } | null>(null)
  const [activeEventId, setActiveEventId] = useState<number | null>(null)
  const [eventDrafts, setEventDrafts] = useState<Record<
    number,
    Partial<{
      name: string
      description: string | null
      venue: string | null
      fees: number
      minTeamSize: number
      maxTeamSize: number
      maxTeams: number | null
      eventType: EventType
      category: EventCategory
      tier: EventTier
    }>
  >>({})

  useEffect(() => {
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    setToken(authToken)

    if (!authToken) {
      void navigate('/login')
      return
    }

    const fetchRoles = async () => {
      try {
        const { data } = await apiClient.get<{
          user?: { roles?: unknown; isBranchRep?: unknown; isOrganizer?: unknown }
        }>('/auth/me', {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        const fetchedRoles = data?.user ? normalizeRoles(data.user.roles) : []
        const branchRepFlag = Boolean(data?.user && (data.user as { isBranchRep?: unknown }).isBranchRep)
        setRoles(fetchedRoles)
        setIsBranchRep(branchRepFlag)

        const hasAnyAccess = hasRole(fetchedRoles, 'ADMIN') || branchRepFlag
        if (!hasAnyAccess) {
          showToast('Access required.', 'error')
          void navigate('/')
          return
        }

        const availableTabs: TabKey[] = [
          ...(hasRole(fetchedRoles, 'ADMIN') ? [...ADMIN_TABS] : []),
          ...(branchRepFlag ? [...BRANCHREP_TABS] : []),
        ]

        setActiveTab((prev) => (availableTabs.includes(prev) ? prev : availableTabs[0]))
      } catch {
        showToast('Session expired. Please log in again.', 'error')
        void navigate('/login')
      }
    }

    void fetchRoles()
  }, [navigate])

  const settingsQuery = useQuery<SettingsResponse, Error, SettingsResponse, ['admin-settings']>({
    queryKey: ['admin-settings'],
    queryFn: () => fetchSettings(token ?? ''),
    enabled: isAdmin && Boolean(token) && activeTab === 'Settings',
  })

  const variablesQuery = useQuery<VariablesResponse, Error, VariablesResponse, ['admin-variables']>({
    queryKey: ['admin-variables'],
    queryFn: () => fetchVariables(token ?? ''),
    enabled: isAdmin && Boolean(token) && activeTab === 'Variables',
  })

  const branchEventsQuery = useQuery<
    BranchRepEventsResponse,
    Error,
    BranchRepEventsResponse,
    ['branch-rep-events']
  >({
    queryKey: ['branch-rep-events'],
    queryFn: () => fetchBranchRepEvents(token ?? ''),
    enabled: isBranchRep && Boolean(token) && activeTab === 'Branch Events',
  })

  useEffect(() => {
    if (!token) {
      return
    }

    if (isAdmin) {
      if (activeTab === 'Settings') {
        void settingsQuery.refetch()
      }
      if (activeTab === 'Variables') {
        void variablesQuery.refetch()
      }
    }

    if (isBranchRep && activeTab === 'Branch Events') {
      void branchEventsQuery.refetch()
    }
  }, [isAdmin, isBranchRep, token, activeTab, settingsQuery, variablesQuery, branchEventsQuery])

  useEffect(() => {
    if (!variablesQuery.data?.variables) {
      return
    }
    const drafts: Record<string, string> = {}
    variablesQuery.data.variables.forEach((variable) => {
      drafts[variable.key] = variable.value
    })
    setVariableDrafts(drafts)
  }, [variablesQuery.data])

  const updateSettingMutation = useMutation({
    mutationFn: (payload: { key: string; value: boolean }) => {
      if (!token) {
        throw new Error('Unauthorized')
      }
      return updateSetting(payload.key, payload.value, token)
    },
    onSuccess: () => {
      void settingsQuery.refetch()
      showToast('Setting updated', 'success')
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to update setting', 'error')
    },
  })

  const upsertVariableMutation = useMutation({
    mutationFn: (payload: { key: string; value: string }) => {
      if (!token) {
        throw new Error('Unauthorized')
      }
      return upsertVariable(payload.key, payload.value, token)
    },
    onSuccess: () => {
      void variablesQuery.refetch()
      showToast('Variable saved', 'success')
      setNewVarKey('')
      setNewVarValue('')
      setEditingKey(null)
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to save variable', 'error')
    },
  })

  const createBranchEventMutation = useMutation({
    mutationFn: (payload: { name: string; eventType: EventType }) => {
      if (!token) {
        throw new Error('Unauthorized')
      }
      return createBranchRepEvent(payload, token)
    },
    onSuccess: () => {
      void branchEventsQuery.refetch()
      setNewEventName('')
      setNewEventType(EVENT_TYPES[0])
      showToast('Event created', 'success')
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to create event', 'error')
    },
  })

  const addOrganizerMutation = useMutation({
    mutationFn: (payload: { eventId: number; email: string }) => {
      if (!token) {
        throw new Error('Unauthorized')
      }
      return addOrganizerToEvent(payload.eventId, payload.email, token)
    },
    onSuccess: (_data, variables) => {
      setOrganizerSearchTerms((prev) => ({ ...prev, [variables.eventId]: '' }))
      setOrganizerSearchResults((prev) => ({ ...prev, [variables.eventId]: [] }))
      setPendingOrganizer(null)
      void branchEventsQuery.refetch()
      showToast('Organizer added', 'success')
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to add organizer', 'error')
    },
  })

  const removeOrganizerMutation = useMutation({
    mutationFn: (payload: { eventId: number; userId: number }) => {
      if (!token) {
        throw new Error('Unauthorized')
      }
      return removeOrganizerFromEvent(payload.eventId, payload.userId, token)
    },
    onSuccess: () => {
      void branchEventsQuery.refetch()
      showToast('Organizer removed', 'success')
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to remove organizer', 'error')
    },
  })

  const deleteBranchEventMutation = useMutation({
    mutationFn: (eventId: number) => {
      if (!token) {
        throw new Error('Unauthorized')
      }
      return deleteBranchRepEvent(eventId, token)
    },
    onSuccess: () => {
      void branchEventsQuery.refetch()
      void eventDetailsQuery.refetch()
      showToast('Event deleted', 'success')
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to delete event', 'error')
    },
  })

  const settings = useMemo<Setting[]>(() => settingsQuery.data?.settings ?? [], [settingsQuery.data])
  const variables = useMemo<Variable[]>(() => variablesQuery.data?.variables ?? [], [variablesQuery.data])

  const eventDetailsQuery = useQuery<
    BranchRepEventDetails,
    Error,
    BranchRepEventDetails,
    ['branch-rep-event', number | null]
  >({
    queryKey: ['branch-rep-event', activeEventId],
    queryFn: async () => {
      if (!token || !activeEventId) {
        throw new Error('No event selected')
      }
      const { event } = await fetchBranchRepEventDetails(activeEventId, token)
      return event
    },
    enabled: Boolean(token && activeEventId && isBranchRep && activeTab === 'Branch Events'),
    staleTime: 30_000,
  })

  useEffect(() => {
    const event = eventDetailsQuery.data
    if (!event) {
      return
    }
    setEventDrafts((prev) => ({
      ...prev,
      [event.id]: {
        name: event.name,
        description: event.description,
        venue: event.venue,
        fees: event.fees,
        minTeamSize: event.minTeamSize,
        maxTeamSize: event.maxTeamSize,
        maxTeams: event.maxTeams,
        eventType: event.eventType,
        category: event.category,
        tier: event.tier,
      },
    }))
  }, [eventDetailsQuery.data])

  const handleOrganizerSearch = async (eventId: number, term: string) => {
    setOrganizerSearchTerms((prev) => ({ ...prev, [eventId]: term }))

    if (!token) {
      return
    }

    if (term.trim().length < 2) {
      setOrganizerSearchResults((prev) => ({ ...prev, [eventId]: [] }))
      return
    }

    setOrganizerSearchLoading((prev) => ({ ...prev, [eventId]: true }))
    try {
      const { users } = await searchBranchRepUsers(term.trim(), token)
      setOrganizerSearchResults((prev) => ({ ...prev, [eventId]: users }))
    } catch (error) {
      console.error(error)
    } finally {
      setOrganizerSearchLoading((prev) => ({ ...prev, [eventId]: false }))
    }
  }

  const updateBranchEventMutation = useMutation({
    mutationFn: (payload: { eventId: number; data: Partial<BranchRepEventDetails> }) => {
      if (!token) {
        throw new Error('Unauthorized')
      }
      const { eventId, data } = payload
      return updateBranchRepEvent(eventId, data, token)
    },
    onSuccess: ({ event }) => {
      void branchEventsQuery.refetch()
      void eventDetailsQuery.refetch()
      setEventDrafts((prev) => ({ ...prev, [event.id]: event }))
      showToast('Event updated', 'success')
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to update event', 'error')
    },
  })

  const togglePublishMutation = useMutation({
    mutationFn: (payload: { eventId: number; publish: boolean }) => {
      if (!token) {
        throw new Error('Unauthorized')
      }
      return toggleBranchRepEventPublish(payload.eventId, payload.publish, token)
    },
    onSuccess: () => {
      void branchEventsQuery.refetch()
      void eventDetailsQuery.refetch()
      showToast('Publish state updated', 'success')
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to update publish state', 'error')
    },
  })

  const renderSettings = () => (
    <div className="space-y-4">
      {settingsQuery.isError ? (
        <p className="text-sm text-rose-300">
          {settingsQuery.error instanceof Error ? settingsQuery.error.message : 'Failed to load settings.'}
        </p>
      ) : null}
      {settings.length === 0 ? <p className="text-sm text-slate-300">No settings found.</p> : null}
      {settings.map((setting) => (
        <div key={setting.key} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-100">{setting.key}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wide text-slate-400">{setting.value ? 'On' : 'Off'}</span>
            <button
              type="button"
              aria-pressed={setting.value}
              onClick={() =>
                updateSettingMutation.mutate({ key: setting.key, value: !setting.value })
              }
              disabled={updateSettingMutation.isPending}
              className={`relative inline-flex h-7 w-12 items-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                setting.value ? 'border-sky-300/70 bg-sky-500/70' : 'border-slate-700 bg-slate-800'
              } ${updateSettingMutation.isPending ? 'cursor-not-allowed opacity-60' : 'hover:border-sky-300'}`}
            >
              <span className="sr-only">Toggle {setting.key}</span>
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow transition ${
                  setting.value ? 'translate-x-6 bg-white' : 'translate-x-1 bg-slate-300'
                }`}
              />
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  const renderVariables = () => (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-100">Add / Update Variable</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            className="input"
            placeholder="Key"
            value={newVarKey}
            onChange={(event) => setNewVarKey(event.target.value)}
          />
          <input
            className="input"
            placeholder="Value"
            value={newVarValue}
            onChange={(event) => setNewVarValue(event.target.value)}
          />
          <button
            className="button"
            type="button"
            onClick={() => newVarKey && upsertVariableMutation.mutate({ key: newVarKey, value: newVarValue })}
            disabled={upsertVariableMutation.isPending}
          >
            {upsertVariableMutation.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {variablesQuery.isError ? (
          <p className="text-sm text-rose-300">
            {variablesQuery.error instanceof Error ? variablesQuery.error.message : 'Failed to load variables.'}
          </p>
        ) : null}
        {variables.length === 0 ? <p className="text-sm text-slate-300">No variables yet.</p> : null}
        {variables.map((variable) => (
          <div
            key={variable.key}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-sm font-semibold text-slate-100">{variable.key}</p>

                {editingKey === variable.key ? (
                  <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      className="input"
                      value={variableDrafts[variable.key] ?? ''}
                      onChange={(event) =>
                        setVariableDrafts((prev) => ({ ...prev, [variable.key]: event.target.value }))
                      }
                    />
                    <div className="flex gap-2 sm:w-48">
                      <button
                        className="button sm:flex-1"
                        type="button"
                        onClick={() =>
                          upsertVariableMutation.mutate({
                            key: variable.key,
                            value: variableDrafts[variable.key] ?? '',
                          })
                        }
                        disabled={upsertVariableMutation.isPending}
                      >
                        {upsertVariableMutation.isPending ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 sm:flex-1"
                        onClick={() => {
                          setVariableDrafts((prev) => ({ ...prev, [variable.key]: variable.value }))
                          setEditingKey(null)
                        }}
                        disabled={upsertVariableMutation.isPending}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-300 break-all">{variable.value}</p>
                )}
              </div>

              {editingKey === variable.key ? null : (
                <button
                  className="button sm:w-24"
                  type="button"
                  onClick={() => setEditingKey(variable.key)}
                  disabled={upsertVariableMutation.isPending}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderBranchRepEvents = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-slate-300">Manage the events for your branch.</p>
        {branchEventsQuery.data?.branchName ? (
          <span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            {branchEventsQuery.data.branchName}
          </span>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-100">Add Event</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="input sm:flex-1"
            placeholder="Event name"
            value={newEventName}
            onChange={(event) => setNewEventName(event.target.value)}
          />
          <select
            className="input sm:w-56"
            value={newEventType}
            onChange={(event) => setNewEventType(event.target.value as EventType)}
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            className="button sm:w-36"
            type="button"
            onClick={() =>
              newEventName.trim() && createBranchEventMutation.mutate({ name: newEventName.trim(), eventType: newEventType })
            }
            disabled={createBranchEventMutation.isPending}
          >
            {createBranchEventMutation.isPending ? 'Creating…' : 'Add Event'}
          </button>
        </div>
      </div>

      {branchEventsQuery.isLoading ? (
        <p className="text-sm text-slate-400">Loading events…</p>
      ) : null}
      {branchEventsQuery.isError ? (
        <p className="text-sm text-rose-300">
          {branchEventsQuery.error instanceof Error
            ? branchEventsQuery.error.message
            : 'Failed to load branch events.'}
        </p>
      ) : null}

      {branchEventsQuery.data?.events.length === 0 ? (
        <p className="text-sm text-slate-300">No events yet. Add your first event above.</p>
      ) : null}

      <div className="space-y-3">
        {branchEventsQuery.data?.events.map((event) => (
          <div
            key={event.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-100">{event.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                  <span className="rounded-full border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200">
                    {event.eventType}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      event.published
                        ? 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
                        : 'border border-amber-400/60 bg-amber-400/10 text-amber-100'
                    }`}
                  >
                    {event.published ? 'Published' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`relative inline-flex h-8 w-16 items-center rounded-full border text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                    event.published
                      ? 'border-emerald-400/70 bg-emerald-500/60 text-slate-900'
                      : 'border-slate-700 bg-slate-800 text-slate-200'
                  } ${togglePublishMutation.isPending ? 'cursor-not-allowed opacity-60' : 'hover:border-emerald-300/70'}`}
                  onClick={() =>
                    togglePublishMutation.mutate({ eventId: event.id, publish: !event.published })
                  }
                  disabled={togglePublishMutation.isPending}
                  aria-pressed={event.published}
                  aria-label={event.published ? 'Unpublish event' : 'Publish event'}
                >
                  <span
                    className={`ml-1 inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
                      event.published ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                  <span className="absolute inset-0 flex items-center justify-center gap-1 px-2">
                    {togglePublishMutation.isPending ? 'Saving…' : event.published ? 'On' : 'Off'}
                  </span>
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => setActiveEventId((prev) => (prev === event.id ? null : event.id))}
                >
                  View Details
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-rose-400/60 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => deleteBranchEventMutation.mutate(event.id)}
                  disabled={event.published || deleteBranchEventMutation.isPending}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Organizers</p>
              {event.organizers.length === 0 ? (
                <p className="text-sm text-slate-300">No organizers yet.</p>
              ) : (
                <div className="divide-y divide-slate-800 rounded-lg border border-slate-800">
                  {event.organizers.map((organizer) => (
                    <div
                      key={organizer.userId}
                      className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{organizer.name || 'Organizer'}</p>
                        <p className="text-xs text-slate-400">{organizer.email}</p>
                        {organizer.phoneNumber ? (
                          <p className="text-xs text-slate-500">{organizer.phoneNumber}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() =>
                          removeOrganizerMutation.mutate({ eventId: event.id, userId: organizer.userId })
                        }
                        disabled={removeOrganizerMutation.isPending}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

                {activeEventId === event.id ? (
                  <div className="mt-3 space-y-3 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                    {eventDetailsQuery.isLoading ? (
                      <p className="text-sm text-slate-400">Loading details…</p>
                    ) : null}
                    {eventDetailsQuery.isError ? (
                      <p className="text-sm text-rose-300">
                        {eventDetailsQuery.error instanceof Error
                          ? eventDetailsQuery.error.message
                          : 'Failed to load event details.'}
                      </p>
                    ) : null}

                    {eventDetailsQuery.data && eventDetailsQuery.data.id === event.id ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-400">
                          <span className="rounded-full border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200">
                            {eventDetailsQuery.data.category}
                          </span>
                          <span className="rounded-full border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200">
                            {eventDetailsQuery.data.tier}
                          </span>
                        </div>

                        <div className="grid gap-3 lg:grid-cols-2">
                          <label className="flex flex-col gap-1 text-sm text-slate-200">
                            <span className="text-xs uppercase tracking-wide text-slate-400">Name</span>
                            {eventDetailsQuery.data.published ? (
                              <span className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100">
                                {eventDetailsQuery.data.name}
                              </span>
                            ) : (
                              <input
                                className="input"
                                value={eventDrafts[event.id]?.name ?? ''}
                                onChange={(ev) =>
                                  setEventDrafts((prev) => ({ ...prev, [event.id]: { ...prev[event.id], name: ev.target.value } }))
                                }
                              />
                            )}
                          </label>

                          <label className="flex flex-col gap-1 text-sm text-slate-200">
                            <span className="text-xs uppercase tracking-wide text-slate-400">Venue</span>
                            {eventDetailsQuery.data.published ? (
                              <span className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100">
                                {eventDetailsQuery.data.venue ?? '—'}
                              </span>
                            ) : (
                              <input
                                className="input"
                                value={eventDrafts[event.id]?.venue ?? ''}
                                onChange={(ev) =>
                                  setEventDrafts((prev) => ({ ...prev, [event.id]: { ...prev[event.id], venue: ev.target.value } }))
                                }
                              />
                            )}
                          </label>

                          <label className="flex flex-col gap-1 text-sm text-slate-200 lg:col-span-2">
                            <span className="text-xs uppercase tracking-wide text-slate-400">Description</span>
                            {eventDetailsQuery.data.published ? (
                              <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100">
                                {eventDetailsQuery.data.description ?? '—'}
                              </div>
                            ) : (
                              <textarea
                                className="input min-h-[100px]"
                                value={eventDrafts[event.id]?.description ?? ''}
                                onChange={(ev) =>
                                  setEventDrafts((prev) => ({
                                    ...prev,
                                    [event.id]: { ...prev[event.id], description: ev.target.value },
                                  }))
                                }
                              />
                            )}
                          </label>

                          <label className="flex flex-col gap-1 text-sm text-slate-200">
                            <span className="text-xs uppercase tracking-wide text-slate-400">Fees</span>
                            {eventDetailsQuery.data.published ? (
                              <span className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100">
                                ₹ {eventDetailsQuery.data.fees}
                              </span>
                            ) : (
                              <input
                                type="number"
                                className="input"
                                value={eventDrafts[event.id]?.fees ?? 0}
                                onChange={(ev) =>
                                  setEventDrafts((prev) => ({
                                    ...prev,
                                    [event.id]: { ...prev[event.id], fees: Number(ev.target.value) },
                                  }))
                                }
                              />
                            )}
                          </label>

                          <div className="grid grid-cols-2 gap-3">
                            <label className="flex flex-col gap-1 text-sm text-slate-200">
                              <span className="text-xs uppercase tracking-wide text-slate-400">Min Team</span>
                              {eventDetailsQuery.data.published ? (
                                <span className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100">
                                  {eventDetailsQuery.data.minTeamSize}
                                </span>
                              ) : (
                                <input
                                  type="number"
                                  className="input"
                                  value={eventDrafts[event.id]?.minTeamSize ?? 1}
                                  onChange={(ev) =>
                                    setEventDrafts((prev) => ({
                                      ...prev,
                                      [event.id]: { ...prev[event.id], minTeamSize: Number(ev.target.value) },
                                    }))
                                  }
                                />
                              )}
                            </label>
                            <label className="flex flex-col gap-1 text-sm text-slate-200">
                              <span className="text-xs uppercase tracking-wide text-slate-400">Max Team</span>
                              {eventDetailsQuery.data.published ? (
                                <span className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100">
                                  {eventDetailsQuery.data.maxTeamSize}
                                </span>
                              ) : (
                                <input
                                  type="number"
                                  className="input"
                                  value={eventDrafts[event.id]?.maxTeamSize ?? 1}
                                  onChange={(ev) =>
                                    setEventDrafts((prev) => ({
                                      ...prev,
                                      [event.id]: { ...prev[event.id], maxTeamSize: Number(ev.target.value) },
                                    }))
                                  }
                                />
                              )}
                            </label>
                          </div>

                          <label className="flex flex-col gap-1 text-sm text-slate-200">
                            <span className="text-xs uppercase tracking-wide text-slate-400">Max Teams</span>
                            {eventDetailsQuery.data.published ? (
                              <span className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100">
                                {eventDetailsQuery.data.maxTeams ?? '—'}
                              </span>
                            ) : (
                              <input
                                type="number"
                                className="input"
                                value={eventDrafts[event.id]?.maxTeams ?? ''}
                                onChange={(ev) =>
                                  setEventDrafts((prev) => ({
                                    ...prev,
                                    [event.id]: {
                                      ...prev[event.id],
                                      maxTeams: ev.target.value === '' ? null : Number(ev.target.value),
                                    },
                                  }))
                                }
                              />
                            )}
                          </label>

                          <label className="flex flex-col gap-1 text-sm text-slate-200">
                            <span className="text-xs uppercase tracking-wide text-slate-400">Event Type</span>
                            {eventDetailsQuery.data.published ? (
                              <span className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100">
                                {eventDetailsQuery.data.eventType}
                              </span>
                            ) : (
                              <select
                                className="input"
                                value={eventDrafts[event.id]?.eventType ?? eventDetailsQuery.data.eventType}
                                onChange={(ev) =>
                                  setEventDrafts((prev) => ({
                                    ...prev,
                                    [event.id]: { ...prev[event.id], eventType: ev.target.value as EventType },
                                  }))
                                }
                              >
                                {EVENT_TYPES.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            )}
                          </label>

                          <label className="flex flex-col gap-1 text-sm text-slate-200">
                            <span className="text-xs uppercase tracking-wide text-slate-400">Category</span>
                            <span className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100">
                              {eventDetailsQuery.data.category}
                            </span>
                          </label>

                          <label className="flex flex-col gap-1 text-sm text-slate-200">
                            <span className="text-xs uppercase tracking-wide text-slate-400">Tier</span>
                            <span className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100">
                              {eventDetailsQuery.data.tier}
                            </span>
                          </label>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {!eventDetailsQuery.data.published ? (
                            <button
                              type="button"
                              className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                              onClick={() => {
                                const draft = eventDrafts[event.id]
                                if (!draft) {
                                  return
                                }
                                updateBranchEventMutation.mutate({ eventId: event.id, data: draft })
                              }}
                              disabled={updateBranchEventMutation.isPending}
                            >
                              {updateBranchEventMutation.isPending ? 'Saving…' : 'Save Changes'}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

              <div className="relative flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3 sm:flex-row sm:items-center">
                <input
                  className="input sm:flex-1"
                  placeholder="Search user by email or name"
                  value={organizerSearchTerms[event.id] ?? ''}
                  onChange={(ev) => {
                    void handleOrganizerSearch(event.id, ev.target.value)
                  }}
                />
                {organizerSearchLoading[event.id] ? (
                  <p className="text-xs text-slate-400">Searching…</p>
                ) : null}

                {organizerSearchResults[event.id]?.length ? (
                  <div className="absolute left-0 right-0 top-full z-10 mt-2 space-y-1 rounded-lg border border-slate-800 bg-slate-900/95 p-2 shadow-xl">
                    {organizerSearchResults[event.id].map((user) => (
                      <button
                        type="button"
                        key={user.id}
                        className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-slate-800"
                        onClick={() => {
                          setPendingOrganizer({ eventId: event.id, user })
                          setOrganizerSearchResults((prev) => ({ ...prev, [event.id]: [] }))
                        }}
                        disabled={addOrganizerMutation.isPending}
                      >
                        <span className="font-semibold">{user.name || 'User'}</span>
                        <span className="block text-xs text-slate-400">{user.email}</span>
                        {user.phoneNumber ? (
                          <span className="block text-[11px] text-slate-500">{user.phoneNumber}</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}

                {pendingOrganizer && pendingOrganizer.eventId === event.id ? (
                  <div className="mt-2 flex flex-col gap-2 rounded-lg border border-emerald-700/60 bg-emerald-900/30 p-3 text-sm text-emerald-50">
                    <p className="font-semibold">Add {pendingOrganizer.user.name || pendingOrganizer.user.email} as organizer?</p>
                    <p className="text-xs text-emerald-200">{pendingOrganizer.user.email}</p>
                    {pendingOrganizer.user.phoneNumber ? (
                      <p className="text-xs text-emerald-200">{pendingOrganizer.user.phoneNumber}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="button sm:w-28"
                        onClick={() =>
                          addOrganizerMutation.mutate({ eventId: event.id, email: pendingOrganizer.user.email })
                        }
                        disabled={addOrganizerMutation.isPending}
                      >
                        {addOrganizerMutation.isPending ? 'Adding…' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                        onClick={() => setPendingOrganizer(null)}
                        disabled={addOrganizerMutation.isPending}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (!token) {
    return null
  }

  const hasAnyAccess = isAdmin || isBranchRep

  if (!hasAnyAccess) {
    return (
      <section className="space-y-4">
        <div className="card p-6">
          <h1 className="text-2xl font-semibold text-slate-50">Dashboard</h1>
          <p className="text-sm text-slate-400">You do not have access to dashboard tools.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <aside className="card h-full p-4">
        <div className="flex flex-col gap-5">
          {isAdmin ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</p>
              {ADMIN_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                    activeTab === tab ? 'bg-sky-500/20 text-sky-200' : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          ) : null}

          {isBranchRep ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Branch Rep</p>
              {BRANCHREP_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                    activeTab === tab ? 'bg-emerald-500/20 text-emerald-200' : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </aside>

      <div className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="muted">Dashboard</p>
            <h1 className="text-2xl font-semibold text-slate-50">{activeTab}</h1>
          </div>
        </div>

        {activeTab === 'Settings' && renderSettings()}
        {activeTab === 'Variables' && renderVariables()}
        {activeTab === 'Branch Events' && renderBranchRepEvents()}
      </div>
    </section>
  )
}

export default DashboardPage
