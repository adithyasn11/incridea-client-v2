import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  fetchAdminUsers,
  fetchSettings,
  fetchVariables,
  fetchWebLogs,
  updateSetting,
  updateUserRoles,
  upsertVariable,
  type AdminUser,
  type AdminUsersResponse,
  type Setting,
  type SettingsResponse,
  type Variable,
  type VariablesResponse,
  type WebLogsResponse,
} from '../api/admin'
import {
  EVENT_TYPES,
  addOrganizerToEvent,
  createBranchRepEvent,
  deleteBranchRepEvent,
  fetchBranchRepEventDetails,
  fetchBranchRepEvents,
  removeOrganizerFromEvent,
  searchBranchRepUsers,
  toggleBranchRepEventPublish,
  updateBranchRepEvent,
  type BranchRepEvent,
  type BranchRepEventDetails,
  type BranchRepEventsResponse,
  type BranchRepUser,
  type CreateBranchRepEventPayload,
  type EventType,
} from '../api/branchRep'
import type { EventCategory, EventTier } from '../api/types'
import apiClient from '../api/client'
import { hasRole, normalizeRoles } from '../utils/roles'
import { showToast } from '../utils/toast'
import BranchEventsTab from './dashboard/BranchEventsTab'
import LogsTab from './dashboard/LogsTab'
import SettingsTab from './dashboard/SettingsTab'
import UsersTab from './dashboard/UsersTab'
import VariablesTab from './dashboard/VariablesTab'

const ADMIN_TABS = ['Settings', 'Variables', 'Users', 'Logs'] as const
const BRANCHREP_TABS = ['Branch Events'] as const
const EVENT_CATEGORIES: EventCategory[] = ['TECHNICAL', 'NON_TECHNICAL', 'CORE', 'SPECIAL']
const EVENT_TIERS: EventTier[] = ['DIAMOND', 'GOLD', 'SILVER', 'BRONZE']

type TabKey = (typeof ADMIN_TABS)[number] | (typeof BRANCHREP_TABS)[number]

const truthyStrings = new Set(['true', '1', 'yes', 'y', 'on'])

function isTruthyVariable(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  if (typeof value === 'string') {
    return truthyStrings.has(value.trim().toLowerCase())
  }

  return false
}

function DashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [token, setToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  )
  const [roles, setRoles] = useState<string[]>([])
  const [isBranchRep, setIsBranchRep] = useState(false)
  const isAdmin = hasRole(roles, 'ADMIN')

  const [tabLoadState, setTabLoadState] = useState<Record<TabKey, boolean>>({
    Settings: true,
    Variables: false,
    Users: false,
    Logs: false,
    'Branch Events': false,
  })
  const [activeTab, setActiveTab] = useState<TabKey>('Settings')

  const [variableDrafts, setVariableDrafts] = useState<Record<string, string>>({})
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [newVarKey, setNewVarKey] = useState('')
  const [newVarValue, setNewVarValue] = useState('')

  const [userSearchDraft, setUserSearchDraft] = useState('')
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [userRolesDraft, setUserRolesDraft] = useState<Record<number, string[]>>({})
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [logsPage, setLogsPage] = useState(1)

  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [newEventName, setNewEventName] = useState('')
  const [newEventDescription, setNewEventDescription] = useState('')
  const [newEventVenue, setNewEventVenue] = useState('')
  const [newEventFees, setNewEventFees] = useState(0)
  const [newMinTeamSize, setNewMinTeamSize] = useState(1)
  const [newMaxTeamSize, setNewMaxTeamSize] = useState(1)
  const [newMaxTeams, setNewMaxTeams] = useState('')
  const [newEventType, setNewEventType] = useState<EventType>(EVENT_TYPES[0])
  const [newEventCategory, setNewEventCategory] = useState<EventCategory>('TECHNICAL')
  const [newEventTier, setNewEventTier] = useState<EventTier>('GOLD')

  const [organizerSearchTerms, setOrganizerSearchTerms] = useState<Record<number, string>>({})
  const [organizerSearchResults, setOrganizerSearchResults] = useState<Record<number, BranchRepUser[]>>({})
  const [organizerSearchLoading, setOrganizerSearchLoading] = useState<Record<number, boolean>>({})
  const [pendingOrganizer, setPendingOrganizer] = useState<{ eventId: number; user: BranchRepUser } | null>(null)
  const [activeEventId, setActiveEventId] = useState<number | null>(null)
  const [eventDrafts, setEventDrafts] = useState<Record<number, Partial<BranchRepEventDetails>>>({})

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    setTabLoadState((prev) => ({ ...prev, [tab]: true }))
  }

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
        setTabLoadState((prev) => ({ ...prev, [availableTabs[0]]: true }))
      } catch {
        showToast('Session expired. Please log in again.', 'error')
        void navigate('/login')
      }
    }

    void fetchRoles()
  }, [navigate])

  useEffect(() => {
    const handle = window.setTimeout(() => setUserSearchTerm(userSearchDraft.trim()), 250)
    return () => window.clearTimeout(handle)
  }, [userSearchDraft])

  const settingsQuery = useQuery<SettingsResponse, Error, SettingsResponse, ['admin-settings']>({
    queryKey: ['admin-settings'],
    queryFn: () => fetchSettings(token ?? ''),
    enabled: isAdmin && Boolean(token) && tabLoadState.Settings,
  })

  const variablesQuery = useQuery<VariablesResponse, Error, VariablesResponse, ['admin-variables']>({
    queryKey: ['admin-variables'],
    queryFn: () => fetchVariables(token ?? ''),
    enabled: isAdmin && Boolean(token) && tabLoadState.Variables,
  })

  const adminUsersQuery = useQuery<AdminUsersResponse, Error, AdminUsersResponse, ['admin-users', string]>({
    queryKey: ['admin-users', userSearchTerm],
    queryFn: () => fetchAdminUsers(userSearchTerm, token ?? ''),
    enabled: isAdmin && Boolean(token) && tabLoadState.Users,
  })

  const adminAccessUsersQuery = useQuery<AdminUsersResponse, Error, AdminUsersResponse, ['admin-access-users']>({
    queryKey: ['admin-access-users'],
    queryFn: () => fetchAdminUsers('', token ?? ''),
    enabled: isAdmin && Boolean(token) && tabLoadState.Users,
  })

  const webLogsQuery = useQuery<WebLogsResponse, Error, WebLogsResponse, ['web-logs', number]>({
    queryKey: ['web-logs', logsPage],
    queryFn: () => fetchWebLogs(token ?? '', logsPage, 50),
    enabled: isAdmin && Boolean(token) && tabLoadState.Logs,
  })

  const branchEventsQuery = useQuery<BranchRepEventsResponse, Error, BranchRepEventsResponse, ['branch-rep-events']>({
    queryKey: ['branch-rep-events'],
    queryFn: () => fetchBranchRepEvents(token ?? ''),
    enabled: isBranchRep && Boolean(token) && tabLoadState['Branch Events'],
  })

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

  const updateUserRolesMutation = useMutation<
    { user: { id: number; roles: string[] }; message: string },
    Error,
    { userId: number; roles: string[] }
  >({
    mutationFn: (payload) => {
      if (!token) {
        throw new Error('Unauthorized')
      }
      return updateUserRoles(payload.userId, payload.roles, token)
    },
    onSuccess: (data) => {
      showToast('Roles updated', 'success')
      setUserRolesDraft((prev) => ({ ...prev, [data.user.id]: data.user.roles }))
      setEditingUserId(null)
      setSelectedUser(null)
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      void adminAccessUsersQuery.refetch()
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to update roles', 'error')
    },
  })

  const createBranchEventMutation = useMutation({
    mutationFn: (payload: CreateBranchRepEventPayload) => {
      if (!token) {
        throw new Error('Unauthorized')
      }
      return createBranchRepEvent(payload, token)
    },
    onSuccess: () => {
      void branchEventsQuery.refetch()
      resetAddEventForm()
      setIsAddEventOpen(false)
      showToast('Event created', 'success')
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : 'Failed to create event', 'error')
    },
  })

  const addOrganizerMutation = useMutation<{ organizer: { userId: number } }, Error, { eventId: number; email: string }>({
    mutationFn: (payload) => {
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
    enabled: tabLoadState['Branch Events'] && Boolean(token && activeEventId && isBranchRep),
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

  const updateBranchEventMutation = useMutation<
    { event: BranchRepEventDetails },
    Error,
    { eventId: number; data: Partial<BranchRepEventDetails> }
  >({
    mutationFn: (payload) => {
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

  const setActiveEventDraft = (eventId: number, data: Partial<BranchRepEventDetails>) => {
    setEventDrafts((prev) => ({ ...prev, [eventId]: { ...prev[eventId], ...data } }))
  }

  const resetAddEventForm = () => {
    setNewEventName('')
    setNewEventDescription('')
    setNewEventVenue('')
    setNewEventFees(0)
    setNewMinTeamSize(1)
    setNewMaxTeamSize(1)
    setNewMaxTeams('')
    setNewEventType(EVENT_TYPES[0])
    setNewEventCategory('TECHNICAL')
    setNewEventTier('GOLD')
  }

  const handleCreateEvent = () => {
    const trimmedName = newEventName.trim()
    if (!trimmedName) {
      showToast('Event name is required', 'error')
      return
    }
    if (newEventFees < 0) {
      showToast('Fees cannot be negative', 'error')
      return
    }
    if (newMinTeamSize <= 0 || newMaxTeamSize <= 0) {
      showToast('Team size must be at least 1', 'error')
      return
    }
    if (newMaxTeamSize < newMinTeamSize) {
      showToast('Max team size cannot be less than min team size', 'error')
      return
    }
    const parsedMaxTeams = newMaxTeams.trim() === '' ? null : Number(newMaxTeams)
    if (parsedMaxTeams !== null && (!Number.isFinite(parsedMaxTeams) || parsedMaxTeams <= 0)) {
      showToast('Max teams must be a positive number', 'error')
      return
    }

    const payload: CreateBranchRepEventPayload = {
      name: trimmedName,
      description: newEventDescription.trim() || undefined,
      venue: newEventVenue.trim() || undefined,
      fees: newEventFees,
      minTeamSize: newMinTeamSize,
      maxTeamSize: newMaxTeamSize,
      maxTeams: parsedMaxTeams,
      eventType: newEventType,
      category: newEventCategory,
      tier: newEventTier,
    }

    createBranchEventMutation.mutate(payload)
  }

  const settings = useMemo<Setting[]>(() => settingsQuery.data?.settings ?? [], [settingsQuery.data])
  const variables = useMemo<Variable[]>(() => variablesQuery.data?.variables ?? [], [variablesQuery.data])
  const settingsLookup = useMemo<Record<string, boolean>>(
    () => settings.reduce((acc, setting) => ({ ...acc, [setting.key]: setting.value }), {} as Record<string, boolean>),
    [settings],
  )
  const variableLookup = useMemo<Record<string, string>>(
    () => variables.reduce((acc, variable) => ({ ...acc, [variable.key]: variable.value }), {} as Record<string, string>),
    [variables],
  )

  const adminUsers = adminUsersQuery.data?.users ?? []
  const adminUsersData = adminUsersQuery.data ?? { availableRoles: [] as string[] }
  const accessUsers = adminAccessUsersQuery.data?.users ?? []

  const branchName = branchEventsQuery.data?.branchName
  const branchEvents: BranchRepEvent[] = branchEventsQuery.data?.events ?? []

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
    <div className="w-full max-w-full space-y-3 px-2 lg:px-3">
      {isAddEventOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsAddEventOpen(false)}
            aria-label="Close add event modal"
          />
          <div className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">New Event</p>
                <h3 className="text-lg font-semibold text-slate-50">Add Event</h3>
              </div>
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                onClick={() => setIsAddEventOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Event Name</label>
                  <input
                    className="input"
                    placeholder="Enter event name"
                    value={newEventName}
                    onChange={(event) => setNewEventName(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Event Type</label>
                  <select
                    className="input"
                    value={newEventType}
                    onChange={(event) => setNewEventType(event.target.value as EventType)}
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-slate-400">Description</label>
                <textarea
                  className="input min-h-30"
                  placeholder="Add a short overview"
                  value={newEventDescription}
                  onChange={(event) => setNewEventDescription(event.target.value)}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Venue</label>
                  <input
                    className="input"
                    placeholder="Hall / Room / Location"
                    value={newEventVenue}
                    onChange={(event) => setNewEventVenue(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Fees</label>
                  <input
                    type="number"
                    className="input"
                    min={0}
                    value={newEventFees}
                    onChange={(event) => setNewEventFees(Number(event.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Min Team Size</label>
                  <input
                    type="number"
                    className="input"
                    min={1}
                    value={newMinTeamSize}
                    onChange={(event) => setNewMinTeamSize(Number(event.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Max Team Size</label>
                  <input
                    type="number"
                    className="input"
                    min={1}
                    value={newMaxTeamSize}
                    onChange={(event) => setNewMaxTeamSize(Number(event.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Max Teams (optional)</label>
                  <input
                    type="number"
                    className="input"
                    min={1}
                    value={newMaxTeams}
                    onChange={(event) => setNewMaxTeams(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Category</label>
                  <select
                    className="input"
                    value={newEventCategory}
                    onChange={(event) => setNewEventCategory(event.target.value as EventCategory)}
                  >
                    {EVENT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Tier</label>
                  <select
                    className="input"
                    value={newEventTier}
                    onChange={(event) => setNewEventTier(event.target.value as EventTier)}
                  >
                    {EVENT_TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="button"
                  onClick={handleCreateEvent}
                  disabled={createBranchEventMutation.isPending}
                >
                  {createBranchEventMutation.isPending ? 'Creating…' : 'Create Event'}
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  onClick={() => {
                    resetAddEventForm()
                    setIsAddEventOpen(false)
                  }}
                  disabled={createBranchEventMutation.isPending}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card space-y-3 p-5">
        <div className="flex items-center justify-center text-center">
          <div>
            <p className="muted">Dashboard</p>
            <h1 className="text-3xl font-semibold text-slate-50">
              {isAdmin ? 'Admin Dashboard' : isBranchRep ? 'Branch Rep Dashboard' : 'Dashboard'}
            </h1>
          </div>
        </div>

        {isAdmin ? (
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-100">Statuses</p>
              <ul className="space-y-1">
                {[{ label: 'Registrations', key: 'isRegistrationOpen' }, { label: 'Spot Registration', key: 'isSpotRegistration' }, { label: 'Committee Registration', key: 'isCommitteeRegOpen' }].map((item) => {
                  const rawValue = variableLookup[item.key] ?? settingsLookup[item.key]
                  const value = isTruthyVariable(rawValue)
                  return (
                    <li key={item.key} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2">
                      <span className="text-xs text-slate-200">{item.label}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                        value
                          ? 'border border-emerald-400/70 bg-emerald-500/10 text-emerald-100'
                          : 'border border-rose-400/70 bg-rose-500/10 text-rose-100'
                      }`}>
                        <span className={`h-2 w-2 rounded-full ${value ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {value ? 'Open' : 'Closed'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-100">Fees</p>
              <ul className="space-y-1">
                {[
                  {
                    label: 'Alumni Registration Fee',
                    key: 'alumniRegistrationFee',
                  },
                  {
                    label: 'External Students Fee',
                    key: 'externalRegistrationFee',
                  },
                  {
                    label: 'External Students OnSpot Fee',
                    key: 'externalRegistrationFeeOnSpot',
                  },
                  {
                    label: 'Internal Students Fee',
                    key: 'internalRegistrationFeeGen',
                  },
                  {
                    label: 'Internal Students Merch Inclusive',
                    key: 'internalRegistrationFeeInclusiveMerch',
                  },
                  {
                    label: 'Internal Students OnSpot',
                    key: 'internalRegistrationOnSpot',
                  },
                ].map((item) => (
                  <li key={item.key} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2">
                    <span className="text-xs text-slate-200">{item.label}</span>
                    <span className="text-xs font-semibold text-slate-100">{variableLookup[item.key] ?? (settingsLookup[item.key] ?? '—')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <section className="grid w-full gap-3 lg:grid-cols-[220px_1fr]">
        <aside className="card h-full p-3 sm:p-4">
          <div className="flex h-full flex-col gap-5">
            {isAdmin ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</p>
                {ADMIN_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleTabChange(tab)}
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
                    onClick={() => handleTabChange(tab)}
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
          {activeTab === 'Settings' ? (
            <SettingsTab settingsQuery={settingsQuery} settings={settings} updateSettingMutation={updateSettingMutation} />
          ) : null}

          {activeTab === 'Variables' ? (
            <VariablesTab
              variablesQuery={variablesQuery}
              variables={variables}
              editingKey={editingKey}
              setEditingKey={setEditingKey}
              variableDrafts={variableDrafts}
              setVariableDrafts={setVariableDrafts}
              newVarKey={newVarKey}
              setNewVarKey={setNewVarKey}
              newVarValue={newVarValue}
              setNewVarValue={setNewVarValue}
              upsertVariableMutation={upsertVariableMutation}
            />
          ) : null}

          {activeTab === 'Users' ? (
            <UsersTab
              adminUsersQuery={adminUsersQuery}
              adminAccessUsersQuery={adminAccessUsersQuery}
              availableRoles={adminUsersData.availableRoles ?? ['USER', 'PARTICIPANT', 'ADMIN', 'JUDGE', 'JURY']}
              users={adminUsers}
              accessUsers={accessUsers}
              userSearchDraft={userSearchDraft}
              setUserSearchDraft={setUserSearchDraft}
              setUserSearchTerm={setUserSearchTerm}
              userRolesDraft={userRolesDraft}
              setUserRolesDraft={setUserRolesDraft}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              editingUserId={editingUserId}
              setEditingUserId={setEditingUserId}
              updateUserRolesMutation={updateUserRolesMutation}
            />
          ) : null}

          {activeTab === 'Logs' ? (
            <LogsTab webLogsQuery={webLogsQuery} logsPage={logsPage} setLogsPage={setLogsPage} />
          ) : null}

          {activeTab === 'Branch Events' ? (
            <BranchEventsTab
              branchName={branchName ?? undefined}
              branchEvents={branchEvents}
              branchEventsLoading={branchEventsQuery.isLoading}
              branchEventsError={branchEventsQuery.isError ? (branchEventsQuery.error instanceof Error ? branchEventsQuery.error.message : 'Failed to load branch events.') : undefined}
              activeEventId={activeEventId}
              setActiveEventId={setActiveEventId}
              organizerSearchTerms={organizerSearchTerms}
              organizerSearchResults={organizerSearchResults}
              organizerSearchLoading={organizerSearchLoading}
              handleOrganizerSearch={handleOrganizerSearch}
              pendingOrganizer={pendingOrganizer}
              setPendingOrganizer={setPendingOrganizer}
              eventDetailsQuery={eventDetailsQuery}
              eventDrafts={eventDrafts}
              setActiveEventDraft={setActiveEventDraft}
              addOrganizerMutation={addOrganizerMutation}
              removeOrganizerMutation={removeOrganizerMutation}
              updateBranchEventMutation={updateBranchEventMutation}
              togglePublishMutation={togglePublishMutation}
              deleteBranchEventMutation={deleteBranchEventMutation}
              setIsAddEventOpen={setIsAddEventOpen}
            />
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
