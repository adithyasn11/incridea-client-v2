import { useEffect, useMemo, type ReactElement } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AiOutlineArrowLeft, AiOutlineMail, AiOutlinePhone } from 'react-icons/ai'
import { BiTimeFive } from 'react-icons/bi'
import { BsCalendarDate } from 'react-icons/bs'
import { FiMapPin } from 'react-icons/fi'
import { IoCashOutline, IoInformationOutline, IoPeopleOutline } from 'react-icons/io5'
import {
  fetchPublishedEvent,
  type PublicEventDetail,
  type PublicEventType,
  type PublishedEventResponse,
} from '../api/public'
import { showToast } from '../utils/toast'

function isPublishedEventResponse(value: unknown): value is PublishedEventResponse {
  return typeof value === 'object' && value !== null && 'event' in value
}

function parseIdFromSlug(slug: string | undefined) {
  if (!slug) {
    return null
  }
  const parts = slug.split('-')
  const maybeId = parts[parts.length - 1]
  const id = Number(maybeId)
  return Number.isFinite(id) ? id : null
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Date TBD'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Date TBD'
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(parsed)
}

function formatTeamSize(min: number, max: number) {
  if (min === max) {
    if (min === 1) {
      return 'Solo'
    }
    if (min === 0) {
      return 'Open'
    }
    return `${min} per team`
  }
  return `${min}-${max} per team`
}

function formatEventType(eventType: PublicEventType) {
  if (eventType.includes('MULTIPLE')) {
    return 'Multi-entry'
  }
  return eventType.toLowerCase().startsWith('team') ? 'Team' : 'Individual'
}

function EventDetailPage() {
  const { slug } = useParams()
  const eventId = useMemo(() => parseIdFromSlug(slug), [slug])

  const query = useQuery<PublishedEventResponse, Error>({
    queryKey: ['public-event', eventId],
    queryFn: () => fetchPublishedEvent(eventId ?? 0),
    enabled: eventId !== null,
    staleTime: 5 * 60 * 1000,
  })

  const { data, isLoading, isError, error } = query

  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Unable to load event'
      showToast(message, 'error')
    }
  }, [error])

  if (eventId === null) {
    return (
      <section className="space-y-4">
        <RouterLink to="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300">
          <AiOutlineArrowLeft /> Back to events
        </RouterLink>
        <div className="card p-6 text-red-200">Invalid event link.</div>
      </section>
    )
  }

  if (isLoading) {
    return <div className="card p-6 text-slate-200">Loading event…</div>
  }

  if (isError || !data || !isPublishedEventResponse(data)) {
    return (
      <section className="space-y-4">
        <RouterLink to="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300">
          <AiOutlineArrowLeft /> Back to events
        </RouterLink>
        <div className="card p-6 text-red-200">Could not find this event.</div>
      </section>
    )
  }

  const event: PublicEventDetail = data.event

  return (
    <section className="space-y-6">
      <RouterLink to="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300">
        <AiOutlineArrowLeft /> Back to events
      </RouterLink>

      <div className="card space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">{event.category.replace('_', ' ')}</p>
            <h1 className="text-3xl font-bold text-slate-50">{event.name}</h1>
            {event.description ? <p className="text-slate-200">{event.description}</p> : null}
          </div>
          {event.image ? (
            <img
              src={event.image}
              alt={event.name}
              className="h-28 w-28 flex-shrink-0 rounded-lg object-cover shadow-lg"
            />
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoPill label="Type" value={`${formatEventType(event.eventType)} · ${formatTeamSize(event.minTeamSize, event.maxTeamSize)}`} icon={<IoPeopleOutline className="text-amber-300" />} />
          <InfoPill label="Venue" value={event.venue ?? 'Will be announced'} icon={<FiMapPin className="text-emerald-300" />} />
          <InfoPill label="Fees" value={event.fees ? `₹${event.fees}` : 'Free'} icon={<IoCashOutline className="text-sky-300" />} />
          <InfoPill label="Max teams/participants" value={event.maxTeams ?? 'TBD'} icon={<IoInformationOutline className="text-fuchsia-300" />} />
          <InfoPill label="Rounds planned" value={event.rounds.length} icon={<IoInformationOutline className="text-slate-200" />} />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-50">Schedule</h2>
          {event.rounds.length === 0 ? (
            <p className="text-slate-300">Round details will be announced soon.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {event.rounds.map((round) => (
                <div key={round.roundNo} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <p className="text-sm font-semibold text-slate-100">Round {round.roundNo}</p>
                  <div className="mt-2 space-y-1 text-sm text-slate-200">
                    <div className="flex items-center gap-2">
                      <BsCalendarDate className="text-sky-300" />
                      <span>{formatDate(round.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BiTimeFive className="text-emerald-300" />
                      <span>{round.date ? new Date(round.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'TBD'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {event.organizers.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-50">Organizers</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {event.organizers.map((org, idx) => (
                <div key={`${org.name}-${idx}`} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <p className="text-sm font-semibold text-slate-100">{org.name}</p>
                  <div className="mt-2 space-y-1 text-sm text-slate-200">
                    {org.email ? (
                      <a className="flex items-center gap-2 hover:text-sky-200" href={`mailto:${org.email}`}>
                        <AiOutlineMail /> {org.email}
                      </a>
                    ) : null}
                    {org.phoneNumber ? (
                      <a className="flex items-center gap-2 hover:text-sky-200" href={`tel:${org.phoneNumber}`}>
                        <AiOutlinePhone /> {org.phoneNumber}
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function InfoPill({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number | null
  icon: ReactElement
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
      <span className="text-lg">{icon}</span>
      <div className="leading-tight">
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
        <p className="font-semibold text-slate-50">{value ?? 'TBD'}</p>
      </div>
    </div>
  )
}

export default EventDetailPage
