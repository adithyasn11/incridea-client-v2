import type { Dispatch, SetStateAction } from 'react'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type {
  BranchRepEvent,
  BranchRepEventDetails,
  BranchRepUser,
} from '../../api/branchRep'

export interface BranchEventsTabProps {
  branchName?: string
  branchEvents: BranchRepEvent[]
  branchEventsLoading: boolean
  branchEventsError?: string
  activeEventId: number | null
  setActiveEventId: Dispatch<SetStateAction<number | null>>
  organizerSearchTerms: Record<number, string>
  organizerSearchResults: Record<number, BranchRepUser[]>
  organizerSearchLoading: Record<number, boolean>
  handleOrganizerSearch: (eventId: number, term: string) => Promise<void>
  pendingOrganizer: { eventId: number; user: BranchRepUser } | null
  setPendingOrganizer: Dispatch<SetStateAction<{ eventId: number; user: BranchRepUser } | null>>
  eventDetailsQuery: UseQueryResult<BranchRepEventDetails, Error>
  eventDrafts: Record<number, Partial<BranchRepEventDetails>>
  addOrganizerMutation: UseMutationResult<{ organizer: { userId: number } }, Error, { eventId: number; email: string }>
  removeOrganizerMutation: UseMutationResult<unknown, Error, { eventId: number; userId: number }>
  updateBranchEventMutation: UseMutationResult<{ event: BranchRepEventDetails }, Error, { eventId: number; data: Partial<BranchRepEventDetails> }>
  togglePublishMutation: UseMutationResult<unknown, Error, { eventId: number; publish: boolean }>
  deleteBranchEventMutation: UseMutationResult<unknown, Error, number>
  setActiveEventDraft: (eventId: number, data: Partial<BranchRepEventDetails>) => void
  setIsAddEventOpen: Dispatch<SetStateAction<boolean>>
}

function BranchEventsTab({
  branchName,
  branchEvents,
  branchEventsLoading,
  branchEventsError,
  activeEventId,
  setActiveEventId,
  organizerSearchTerms,
  organizerSearchResults,
  organizerSearchLoading,
  handleOrganizerSearch,
  pendingOrganizer,
  setPendingOrganizer,
  eventDetailsQuery,
  eventDrafts,
  addOrganizerMutation,
  removeOrganizerMutation,
  updateBranchEventMutation,
  togglePublishMutation,
  deleteBranchEventMutation,
  setActiveEventDraft,
  setIsAddEventOpen,
}: BranchEventsTabProps) {
  const renderOrganizerResults = (eventId: number) => (
    <div className="absolute left-0 right-0 top-full z-10 mt-2 space-y-1 rounded-lg border border-slate-800 bg-slate-900/95 p-2 shadow-xl">
      {organizerSearchResults[eventId].map((user) => (
        <button
          key={user.id}
          type="button"
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-800/60"
          onClick={() => setPendingOrganizer({ eventId, user })}
        >
          <div>
            <p className="font-semibold">{user.name ?? 'User'}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
          <span className="text-xs uppercase tracking-wide text-slate-400">Select</span>
        </button>
      ))}
    </div>
  )

  const renderPendingOrganizer = () => {
    if (!pendingOrganizer) {
      return null
    }
    const { user, eventId } = pendingOrganizer
    return (
      <div className="mt-2 flex flex-col gap-2 rounded-lg border border-emerald-700/60 bg-emerald-900/30 p-3 text-sm text-emerald-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{user.name ?? 'User'}</p>
            <p className="text-xs text-emerald-100">{user.email}</p>
            {user.phoneNumber ? <p className="text-xs text-emerald-200">{user.phoneNumber}</p> : null}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/10"
              onClick={() => addOrganizerMutation.mutate({ eventId, email: user.email })}
              disabled={addOrganizerMutation.isPending}
            >
              {addOrganizerMutation.isPending ? 'Adding…' : 'Confirm'}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-slate-800"
              onClick={() => setPendingOrganizer(null)}
              disabled={addOrganizerMutation.isPending}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-slate-300">Manage the events for your branch.</p>
        {branchName ? (
          <span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            {branchName}
          </span>
        ) : null}

        <div className="ml-auto">
          <button type="button" className="button" onClick={() => setIsAddEventOpen(true)}>
            Add Event
          </button>
        </div>
      </div>

      {branchEventsLoading ? <p className="text-sm text-slate-400">Loading events…</p> : null}
      {branchEventsError ? <p className="text-sm text-rose-300">{branchEventsError}</p> : null}

      {branchEvents.length === 0 ? <p className="text-sm text-slate-300">No events yet. Add your first event above.</p> : null}

      <div className="space-y-3">
        {branchEvents.map((event) => (
          <div key={event.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
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
                  className={`relative inline-flex h-8 w-16 items-center rounded-full border text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                    event.published
                      ? 'border-emerald-400/70 bg-emerald-500/60 text-slate-900'
                      : 'border-slate-700 bg-slate-800 text-slate-200'
                  } ${togglePublishMutation.isPending ? 'cursor-not-allowed opacity-60' : 'hover:border-emerald-300/70'}`}
                  onClick={() => togglePublishMutation.mutate({ eventId: event.id, publish: !event.published })}
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
                        onClick={() => removeOrganizerMutation.mutate({ eventId: event.id, userId: organizer.userId })}
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
                                setActiveEventDraft(event.id, { name: ev.target.value })
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
                                setActiveEventDraft(event.id, { venue: ev.target.value })
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
                              className="input min-h-25"
                              value={eventDrafts[event.id]?.description ?? ''}
                              onChange={(ev) =>
                                setActiveEventDraft(event.id, { description: ev.target.value })
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
                                setActiveEventDraft(event.id, { fees: Number(ev.target.value) })
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
                                  setActiveEventDraft(event.id, { minTeamSize: Number(ev.target.value) })
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
                                  setActiveEventDraft(event.id, { maxTeamSize: Number(ev.target.value) })
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
                                setActiveEventDraft(event.id, {
                                  maxTeams: ev.target.value === '' ? null : Number(ev.target.value),
                                })
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
                                setActiveEventDraft(event.id, { eventType: ev.target.value as BranchRepEventDetails['eventType'] })
                              }
                            >
                              <option value={eventDetailsQuery.data.eventType}>{eventDetailsQuery.data.eventType}</option>
                            </select>
                          )}
                        </label>

                        <label className="flex flex-col gap-1 text-sm text-slate-200">
                          <span className="text-xs uppercase tracking-wide text-slate-400">Category</span>
                          {eventDetailsQuery.data.published ? (
                            <span className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100">
                              {eventDetailsQuery.data.category}
                            </span>
                          ) : (
                            <select
                              className="input"
                              value={eventDrafts[event.id]?.category ?? eventDetailsQuery.data.category}
                              onChange={(ev) =>
                                setActiveEventDraft(event.id, { category: ev.target.value as BranchRepEventDetails['category'] })
                              }
                            >
                              <option value={eventDetailsQuery.data.category}>{eventDetailsQuery.data.category}</option>
                            </select>
                          )}
                        </label>

                        <label className="flex flex-col gap-1 text-sm text-slate-200">
                          <span className="text-xs uppercase tracking-wide text-slate-400">Tier</span>
                          {eventDetailsQuery.data.published ? (
                            <span className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100">
                              {eventDetailsQuery.data.tier}
                            </span>
                          ) : (
                            <select
                              className="input"
                              value={eventDrafts[event.id]?.tier ?? eventDetailsQuery.data.tier}
                              onChange={(ev) =>
                                setActiveEventDraft(event.id, { tier: ev.target.value as BranchRepEventDetails['tier'] })
                              }
                            >
                              <option value={eventDetailsQuery.data.tier}>{eventDetailsQuery.data.tier}</option>
                            </select>
                          )}
                        </label>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="button"
                          onClick={() => updateBranchEventMutation.mutate({ eventId: event.id, data: eventDrafts[event.id] ?? {} })}
                          disabled={updateBranchEventMutation.isPending}
                        >
                          {updateBranchEventMutation.isPending ? 'Saving…' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => setActiveEventDraft(event.id, eventDetailsQuery.data)}
                          disabled={updateBranchEventMutation.isPending}
                        >
                          Reset
                        </button>
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

                {organizerSearchResults[event.id]?.length ? renderOrganizerResults(event.id) : null}

                {pendingOrganizer && pendingOrganizer.eventId === event.id ? renderPendingOrganizer() : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BranchEventsTab
