import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'

import { logoutUser, fetchMe } from '../api/auth'
import { useSocket } from '../hooks/useSocket'


function Layout() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { socket } = useSocket()


  // Removed direct monitoring as we rely on server session
  // But for logout, we should clear it immediately for better UX

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout failed', error)
    } finally {
      // Clear local state immediately
      setIsAuthenticated(false)
      window.location.reload()
    }
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
        setIsAuthenticated(true)
      }

    } catch {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!socket) return

    const handleAuthEvent = () => {
      void fetchProfile()
    }

    socket.on('auth:login', handleAuthEvent)
    socket.on('auth:logout', handleAuthEvent)

    return () => {
      socket.off('auth:login', handleAuthEvent)
      socket.off('auth:logout', handleAuthEvent)
    }
  }, [socket])

  useEffect(() => {
    void fetchProfile()

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'logout-event') {
        setIsAuthenticated(false)
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

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen flex-col text-slate-50`}>
      <Navbar
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        isLoading={isLoading}
      />
      <Sidebar isAuthenticated={isAuthenticated} />

      <main className="w-screen flex justify-center items-center flex-1 px-4 lg:pl-24 pt-32 pb-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout
