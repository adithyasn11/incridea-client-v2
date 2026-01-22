import { Link, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './Navbar'

import { logoutUser, fetchMe } from '../api/auth'


function Layout() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('userName') ? 'logged-in' : null)
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'))
  const [isLoading, setIsLoading] = useState(true)


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

  }

  const fetchProfile = async () => {
      // setIsLoading(true) // Don't flicker loading on focus check
      try {
        const { user } = await fetchMe()
        const name = user && typeof user === 'object'
          ? typeof user.name === 'string'
            ? user.name
            : typeof user.email === 'string'
              ? user.email
              : null
          : null


        if (name) {
          setUserName(name)
          setToken('logged-in')
          localStorage.setItem('userName', name)
          if (!localStorage.getItem('token')) {
              localStorage.setItem('token', 'cookie-session')
          }
        }

      } catch {
        // If auth fails, just clear local state
        localStorage.removeItem('token')
        localStorage.removeItem('userName')
        localStorage.removeItem('userId')
        setToken(null)
        setUserName(null)
      } finally {
        setIsLoading(false)
      }
    }

  useEffect(() => {
    void fetchProfile()

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'token' && event.newValue === null) {
            setToken(null)
            setUserName(null)
            // No strict redirect for client as guest view is allowed
        }
    }

    const handleFocus = () => {
       // Re-verify session when returning to the tab
       void fetchProfile() 
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)

    return () => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return (
    <div className={`flex min-h-screen flex-col text-slate-50`}>
      <Navbar
        token={token}
        userName={userName}
        onLogout={handleLogout}
        isLoading={isLoading}
      />

      <main className="w-screen flex justify-center items-center flex-1 px-4 pt-32 pb-10">
        <Outlet />
      </main>

      <footer>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-100 md:flex-row md:flex-wrap md:justify-center md:gap-4">
          <Link className="transition-colors duration-200 hover:text-slate-200 cursor-target" to="/privacy">
            Privacy Policy
          </Link>
          <span className="hidden text-white md:inline">|</span>
          <Link className="transition-colors duration-200 hover:text-slate-200 cursor-target" to="/rules">
            Terms & Conditions
          </Link>
          <span className="hidden text-white md:inline">|</span>
          <Link className="transition-colors duration-200 hover:text-slate-200 cursor-target" to="/guidelines">
            Guidelines
          </Link>
          <span className="hidden text-white md:inline">|</span>
          <Link className="transition-colors duration-200 hover:text-slate-200 cursor-target" to="/refund">
            Refund Policy
          </Link>
          <span className="hidden text-white md:inline">|</span>
          <Link className="transition-colors duration-200 hover:text-slate-200 cursor-target" to="/contact">
            Contact Us
          </Link>
        </div>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-4 pb-5 text-[11px] font-semibold tracking-wide text-slate-200">
          <Link className="inline-flex items-center gap-1 transition-all hover:tracking-wider hover:text-slate-100 cursor-target" to="/team">
            Made with <span className="text-rose-400">❤</span> by Technical Team
          </Link>
          <p className='cursor-target'>© Incridea {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
