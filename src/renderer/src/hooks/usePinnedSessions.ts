import { useState, useCallback } from 'react'
import { getStorageItem, setStorageItem } from '../lib/storage'

const STORAGE_KEY = 'claude-hub-pinned'

export function usePinnedSessions() {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(
    () => new Set(getStorageItem<string[]>(STORAGE_KEY, []))
  )

  const togglePin = useCallback((sessionId: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      setStorageItem(STORAGE_KEY, [...next])
      return next
    })
  }, [])

  return { pinnedIds, togglePin }
}
