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

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout failed', error)
    } finally {
      setIsAuthenticated(false)
      // Force reload to clear all states
      window.location.reload()
    }
  }

  const fetchProfile = async () => {
    try {
      const { user } = await fetchMe()
      // Basic validation that we got a valid user object
      if (user && user.id) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    } catch {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    void fetchProfile()

    // SAFETY TIMEOUT: If API hangs, stop loading after 5s so user sees SOMETHING
    const timer = setTimeout(() => {
      setIsLoading((prev) => {
        if (prev) {
          console.warn("Layout loading timed out. Forcing render.")
          return false
        }
        return prev
      })
    }, 5000)

    const handleAuthEvent = () => void fetchProfile()
    const handleFocus = () => void fetchProfile()
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'logout-event') setIsAuthenticated(false)
    }

    if (socket) {
      socket.on('auth:login', handleAuthEvent)
      socket.on('auth:logout', handleAuthEvent)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      clearTimeout(timer)
      if (socket) {
        socket.off('auth:login', handleAuthEvent)
        socket.off('auth:logout', handleAuthEvent)
      }
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [socket])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading App...</p>
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
