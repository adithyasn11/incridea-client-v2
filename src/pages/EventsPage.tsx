import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AiOutlineSearch } from 'react-icons/ai'
import { Link as RouterLink } from 'react-router-dom'
import {
  fetchPublishedEvents,
  type EventDayConfig,
  type PublicEvent,
  type PublicEventCategory,
  type PublishedEventsResponse,
} from '../api/public'
import { showToast } from '../utils/toast'

import EventPreviewCard from '../components/events/EventCard'

const CATEGORY_FILTERS: (PublicEventCategory | 'ALL')[] = [
  'ALL',
  'TECHNICAL',
  'NON_TECHNICAL',
  'CORE',
  'SPECIAL',
]

const DAY_FILTERS = [
  { label: 'Day 1', key: 'day1' },
  { label: 'Day 2', key: 'day2' },
  { label: 'Day 3', key: 'day3' },
  { label: 'Day 4', key: 'day4' },
] as const

type DayFilterLabel = (typeof DAY_FILTERS)[number]['label'] | 'All'
type EventDayKey = keyof EventDayConfig

function isSameUtcDay(left: Date, right: Date) {
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  )
}



function toSlug(event: PublicEvent) {
  const base = event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${base}-${event.id}`
}


// MOCK DATA FOR DEVELOPMENT
const MOCK_EVENTS = Array.from({ length: 9 }).map((_, i) => ({
  id: `mock-${i + 1}`,
  name: i % 2 === 0 ? 'ROBOWARS' : 'CODE QUEST',
  description: 'Experience the thrill of competition and showcase your skills in this amazing event.',
  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop',
  category: i % 2 === 0 ? 'TECH' : 'N-TECH',
  rounds: [{ date: new Date().toISOString() }],
  venue: 'Main Auditorium',
  minTeamSize: 1,
  maxTeamSize: 4,
  eventType: 'TEAM_MULTIPLE_ENTRY',
  needRegistration: true,
  registered: false,
})) as unknown as PublicEvent[]


function EventsPage() {
  const [categoryFilter, setCategoryFilter] = useState<(PublicEventCategory | 'ALL')>('ALL')
  const [dayFilter, setDayFilter] = useState<DayFilterLabel>('All')
  const [query, setQuery] = useState('')


  // NOTE: Server part not ready, using mock data for development
  /*
  const eventsQuery = useQuery<PublishedEventsResponse, Error>({
    queryKey: ['public-events'],
    queryFn: fetchPublishedEvents,
    staleTime: 5 * 60 * 1000,
  })

  const dayConfig = useMemo<EventDayConfig | undefined>(
    () => eventsQuery.data?.days,
    [eventsQuery.data?.days],
  )
  const events = useMemo<PublicEvent[]>(
    () => eventsQuery.data?.events ?? [],
    [eventsQuery.data?.events],
  )

  useEffect(() => {
    if (eventsQuery.error) {
      const message = eventsQuery.error instanceof Error ? eventsQuery.error.message : 'Unable to load events'
      showToast(message, 'error')
    }
  }, [eventsQuery.error])
  */

  // Mock Data Integration
  const eventsQuery = { isLoading: false, isError: false };
  const dayConfig = undefined;
  const events = MOCK_EVENTS;


  const availableDayFilters = useMemo<DayFilterLabel[]>(() => {
    const labels: DayFilterLabel[] = ['All']
    DAY_FILTERS.forEach(({ label, key }) => {
      if (dayConfig?.[key as EventDayKey]) {
        labels.push(label)
      }
    })
    return labels
  }, [dayConfig])

  useEffect(() => {
    if (!availableDayFilters.includes(dayFilter)) {
      setDayFilter('All')
    }
  }, [availableDayFilters, dayFilter])

  const activeDayKey = useMemo<EventDayKey | null>(() => {
    if (dayFilter === 'All') {
      return null
    }
    const mapping = DAY_FILTERS.find((item) => item.label === dayFilter)
    return mapping ? (mapping.key as EventDayKey) : null
  }, [dayFilter])

  const filteredEvents = useMemo<PublicEvent[]>(() => {
    const searchTerm = query.trim().toLowerCase()

    return events.filter((event) => {
      const matchesQuery = event.name.toLowerCase().includes(searchTerm)
      const matchesCategory = categoryFilter === 'ALL' || event.category === categoryFilter

      const selectedDayIso = activeDayKey ? dayConfig?.[activeDayKey] ?? null : null
      const matchesDay = !selectedDayIso
        ? true
        : event.rounds.some((round) => {
          if (!round.date) {
            return false
          }
          return isSameUtcDay(new Date(round.date), new Date(selectedDayIso))
        })

      return matchesQuery && matchesCategory && matchesDay
    })
  }, [dayConfig, events, categoryFilter, activeDayKey, query])

  return (
    <section className="space-y-8 max-w-[1400px] mx-auto px-4 md:px-8 py-8">

      <header className="space-y-2">
        <p className="muted uppercase text-xs">Discover</p>
        <h1 className="text-3xl font-bold text-slate-50">Events</h1>
        <p className="muted">
          Browse published events. Day filters come from the variable table so updates from admin will appear here automatically.
        </p>
      </header>


      <div className="card space-y-4 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <AiOutlineSearch className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input pl-9 w-full"
              placeholder="Search events by name"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setCategoryFilter(category)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${categoryFilter === category
                  ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                  : 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-600'
                  }`}
              >
                {category === 'ALL' ? 'All categories' : category.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {availableDayFilters.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setDayFilter(label)}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${dayFilter === label
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                : 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-600'
                }`}
            >
              {label === 'All' ? 'All days' : label}
            </button>
          ))}
          {availableDayFilters.length === 1 ? (
            <p className="text-sm text-slate-400">Day filters will appear when admin sets day variables.</p>
          ) : null}
        </div>
      </div>

      {eventsQuery.isLoading ? (
        <div className="card p-8 text-center text-slate-300">Loading events…</div>
      ) : null}

      {eventsQuery.isError ? (
        <div className="card p-8 text-center text-rose-200">Unable to load events right now.</div>
      ) : null}

      {!eventsQuery.isLoading && filteredEvents.length === 0 ? (
        <div className="card p-8 text-center text-slate-300">No events match the selected filters.</div>
      ) : null}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center">
        {filteredEvents.map((event, index) => (
          <RouterLink
            key={event.id}
            to={`/events/${toSlug(event)}`}
            className="flex w-full items-center justify-center transition hover:scale-105"
          >
            <EventPreviewCard event={event} index={index} />
          </RouterLink>
        ))}
      </div>
    </section>
  )
}

export default EventsPage
