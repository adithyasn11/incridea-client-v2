import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem('token') : null)
  }, [])

  const primaryCta = useMemo(
    () => ({ label: token ? 'Profile' : 'Login', to: token ? '/profile' : '/login' }),
    [token],
  )

  return (
    <main className="relative isolate overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 shadow-2xl shadow-slate-950/40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(248,113,113,0.14),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(52,211,153,0.18),transparent_32%)]" />
      <div className="absolute inset-0 bg-[url('/incridea.png.png')] bg-[length:420px] bg-center bg-no-repeat opacity-10" aria-hidden />

      <section className="relative grid min-h-[70vh] gap-8 px-6 py-10 lg:grid-cols-[1fr_1fr] lg:px-12 lg:py-14">
        <div className="flex flex-col justify-center gap-6">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Innovate · Create · Ideate</p>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
            Incridea 2025 — a student-built techno-cultural experience.
          </h1>
          <p className="max-w-2xl text-base text-slate-300 md:text-lg">
            National-level fest crafted by students, featuring pronites, workshops, competitions,
            and showcases across technology, art, and culture.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="button"
              onClick={() => void navigate(primaryCta.to)}
            >
              {primaryCta.label}
            </button>
            <Link
              to="/explore"
              className="button bg-slate-900 text-slate-100 hover:bg-slate-800"
            >
              Explore
            </Link>
            <Link
              to="/form"
              className="button bg-slate-900 text-slate-100 hover:bg-slate-800"
            >
              Register
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm text-slate-100 sm:max-w-md">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-2xl font-bold text-sky-200">40+</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">Events</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-2xl font-bold text-emerald-200">45K</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">Footfall</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-2xl font-bold text-amber-200">200</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">Colleges</p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 -z-10 " />
          <div className="relative w-full max-w-xl overflow-hidden ">
            <div className="aspect-video w-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/nmamit.png"
                alt="NMAMIT"
                className="h-28 w-auto "
                loading="lazy"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-3 pb-4">
              <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                Nitte · Karnataka
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                NMAMIT
              </span>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}

export default HomePage
