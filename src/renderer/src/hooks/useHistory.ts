import { useState, useEffect, useCallback } from 'react'
import type { SessionSummary } from '../types'

export function useHistory() {
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await window.api.getHistory()
      setSessions(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const unsub = window.api.onHistoryUpdate((updated) => {
      setSessions(updated)
    })
    return unsub
  }, [refresh])

  return { sessions, loading, error, refresh }
}
