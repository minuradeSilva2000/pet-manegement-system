import React, { createContext, useState, useEffect } from 'react'

export const SessionContext = createContext()

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/users/session', { credentials: 'include' })
        const data = await res.json()
        setSession(data)
      } catch (e) {
        console.error('Session fetch failed', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto" />
        <p className="mt-2 text-gray-600">Loading session…</p>
      </div>
    )
  }

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  )
}
