import { useState, useCallback } from 'react'
import type { ChatTurn } from '../types'

export function useSession() {
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  const loadSession = useCallback(async (sessionId: string) => {
    setLoading(true)
    setError(null)
    setCurrentSessionId(sessionId)
    try {
      const data = await window.api.getSession(sessionId)
      setTurns(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session')
      setTurns([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setTurns([])
    setCurrentSessionId(null)
    setError(null)
  }, [])

  return { turns, loading, error, currentSessionId, loadSession, clear }
}
