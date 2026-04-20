import { useState, useCallback, useMemo } from 'react'
import type { Tag } from '../types'
import { getStorageItem, setStorageItem } from '../lib/storage'

const TAGS_KEY = 'claude-hub-tags'
const SESSION_TAGS_KEY = 'claude-hub-session-tags'

export const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
]

export function useTags() {
  const [tags, setTags] = useState<Tag[]>(
    () => getStorageItem<Tag[]>(TAGS_KEY, [])
  )
  const [sessionTagMap, setSessionTagMap] = useState<Record<string, string[]>>(
    () => getStorageItem<Record<string, string[]>>(SESSION_TAGS_KEY, {})
  )

  const tagDefs = useMemo(() => {
    const map = new Map<string, Tag>()
    for (const t of tags) map.set(t.id, t)
    return map
  }, [tags])

  const sessionTags = useMemo(() => {
    return new Map(Object.entries(sessionTagMap))
  }, [sessionTagMap])

  const createTag = useCallback((name: string, color: string) => {
    const newTag: Tag = { id: Date.now().toString(36), name, color }
    setTags((prev) => {
      const next = [...prev, newTag]
      setStorageItem(TAGS_KEY, next)
      return next
    })
    return newTag
  }, [])

  const deleteTag = useCallback((tagId: string) => {
    setTags((prev) => {
      const next = prev.filter((t) => t.id !== tagId)
      setStorageItem(TAGS_KEY, next)
      return next
    })
    // Remove from all sessions
    setSessionTagMap((prev) => {
      const next = { ...prev }
      for (const sid of Object.keys(next)) {
        next[sid] = next[sid].filter((id) => id !== tagId)
        if (next[sid].length === 0) delete next[sid]
      }
      setStorageItem(SESSION_TAGS_KEY, next)
      return next
    })
  }, [])

  const addTagToSession = useCallback((sessionId: string, tagId: string) => {
    setSessionTagMap((prev) => {
      const existing = prev[sessionId] || []
      if (existing.includes(tagId)) return prev
      const next = { ...prev, [sessionId]: [...existing, tagId] }
      setStorageItem(SESSION_TAGS_KEY, next)
      return next
    })
  }, [])

  const removeTagFromSession = useCallback((sessionId: string, tagId: string) => {
    setSessionTagMap((prev) => {
      const existing = prev[sessionId] || []
      const filtered = existing.filter((id) => id !== tagId)
      const next = { ...prev }
      if (filtered.length === 0) {
        delete next[sessionId]
      } else {
        next[sessionId] = filtered
      }
      setStorageItem(SESSION_TAGS_KEY, next)
      return next
    })
  }, [])

  return {
    tags,
    tagDefs,
    sessionTags,
    createTag,
    deleteTag,
    addTagToSession,
    removeTagFromSession
  }
}
