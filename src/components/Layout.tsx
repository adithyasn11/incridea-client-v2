import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { hasRole, normalizeRoles } from '../utils/roles'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Events', to: '/events' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Login/Register', to: '/login' },
]

import { logoutUser, fetchMe } from '../api/auth'

function Layout() {
  const [token, setToken] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [isBranchRep, setIsBranchRep] = useState(false)
  const [isOrganiser, setIsOrganiser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  // Removed direct localStorage monitoring as we rely on server session

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout failed', error)
    }
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    setToken(null)
    setUserName(null)
    setUserRoles([])
    window.location.href = `${import.meta.env.VITE_AUTH_URL}/`
  }

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const { user } = await fetchMe()
        const name = user && typeof user === 'object'
          ? typeof user.name === 'string'
            ? user.name
            : typeof user.email === 'string'
              ? user.email
              : null
          : null

        const roles = user && typeof user === 'object' ? normalizeRoles((user as { roles?: unknown }).roles) : []
        const branchRep = Boolean(user && (user as { isBranchRep?: unknown }).isBranchRep)
        const organiser = Boolean(user && (user as { isOrganiser?: unknown }).isOrganiser)

        if (name) {
          setUserName(name)
          setToken('logged-in')
        }

        setUserRoles(roles)
        setIsBranchRep(branchRep)
        setIsOrganiser(organiser)
      } catch {
        await handleLogout()
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProfile()
  }, [])

  return (
    <div className={`flex min-h-screen flex-col ${location.pathname.startsWith('/dashboard') ? '' : 'bg-slate-950'} text-slate-50`}>
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold text-sky-300">
            <img
              src="/incridea.png.png"
              alt="Incridea"
              className="h-12 w-auto rounded-xl object-contain"
            />
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium text-slate-200">
            {!isLoading && navLinks
              .filter((link) => !(link.label === 'Login/Register' && token))
              .map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 transition hover:bg-slate-800 hover:text-sky-200 ${
                      isActive ? 'bg-slate-800 text-sky-300' : ''
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            {hasRole(userRoles, 'ADMIN') || hasRole(userRoles, 'DOCUMENTATION') || isBranchRep || isOrganiser ? (
              <a
                href={import.meta.env.VITE_DASHBOARD_URL}
                className="rounded-md px-3 py-2 transition hover:bg-slate-800 hover:text-sky-200"
              >
                Dashboard
              </a>
            ) : null}
            {token ? (
              <div className="flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-xs text-slate-100">
                <a
                  href={`${import.meta.env.VITE_DASHBOARD_URL}/profile`}
                  className="font-semibold hover:text-sky-200"
                >
                  {userName}
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded bg-slate-700 px-2 py-1 text-[11px] font-semibold text-sky-200 hover:bg-slate-600"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="w-screen flex justify-center items-center flex-1 px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 bg-slate-900/70">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-5 text-xs font-semibold text-slate-100 md:flex-row md:flex-wrap md:justify-center md:gap-4">
          <Link className="transition-colors duration-200 hover:text-slate-200" to="/privacy">
            Privacy Policy
          </Link>
          <span className="hidden text-slate-600 md:inline">|</span>
          <Link className="transition-colors duration-200 hover:text-slate-200" to="/rules">
            Terms & Conditions
          </Link>
          <span className="hidden text-slate-600 md:inline">|</span>
          <Link className="transition-colors duration-200 hover:text-slate-200" to="/guidelines">
            Guidelines
          </Link>
          <span className="hidden text-slate-600 md:inline">|</span>
          <Link className="transition-colors duration-200 hover:text-slate-200" to="/refund">
            Refund Policy
          </Link>
          <span className="hidden text-slate-600 md:inline">|</span>
          <Link className="transition-colors duration-200 hover:text-slate-200" to="/contact">
            Contact Us
          </Link>
        </div>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-4 pb-5 text-[11px] font-semibold tracking-wide text-slate-200">
          <Link className="inline-flex items-center gap-1 transition-all hover:tracking-wider hover:text-slate-100" to="/team">
            Made with <span className="text-rose-400">❤</span> by Technical Team
          </Link>
          <p>© Incridea {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
