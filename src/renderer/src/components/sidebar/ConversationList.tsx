import { useState } from 'react'
import type { SessionSummary } from '../../types'
import { groupByDate, groupByProject } from '../../lib/date-groups'
import { ConversationItem } from './ConversationItem'
import { DateGroupHeader } from './DateGroupHeader'

interface ConversationListProps {
  sessions: SessionSummary[]
  selectedId: string | null
  focusedId?: string | null
  onSelect: (sessionId: string) => void
  onContinue?: (sessionId: string) => void
  onDelete?: (sessionId: string) => void
  onOpenProject?: (projectPath: string) => void
  groupMode?: 'date' | 'project'
  pinnedIds?: Set<string>
  onTogglePin?: (sessionId: string) => void
  sessionTags?: Map<string, string[]>
  tagDefs?: Map<string, { id: string; name: string; color: string }>
  onOpenTagEditor?: (sessionId: string, anchor: HTMLElement) => void
  onExport?: (session: SessionSummary) => void
}

export function ConversationList({
  sessions,
  selectedId,
  focusedId,
  onSelect,
  onContinue,
  onDelete,
  onOpenProject,
  groupMode = 'date',
  pinnedIds,
  onTogglePin,
  sessionTags,
  tagDefs,
  onOpenTagEditor,
  onExport
}: ConversationListProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Separate pinned sessions
  const pinned = pinnedIds && pinnedIds.size > 0
    ? sessions.filter((s) => pinnedIds.has(s.sessionId))
    : []
  const unpinned = pinnedIds && pinnedIds.size > 0
    ? sessions.filter((s) => !pinnedIds.has(s.sessionId))
    : sessions

  const groups = groupMode === 'project' ? groupByProject(unpinned) : groupByDate(unpinned)

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

  const renderItem = (session: SessionSummary) => (
    <ConversationItem
      key={session.sessionId}
      session={session}
      selected={session.sessionId === selectedId}
      focused={session.sessionId === focusedId}
      onClick={() => onSelect(session.sessionId)}
      onContinue={onContinue}
      onDelete={onDelete}
      onOpenProject={onOpenProject}
      isPinned={pinnedIds?.has(session.sessionId)}
      onTogglePin={onTogglePin}
      tags={sessionTags?.get(session.sessionId)?.map((tid) => tagDefs?.get(tid)).filter(Boolean) as { id: string; name: string; color: string }[] | undefined}
      onOpenTagEditor={onOpenTagEditor}
      onExport={onExport}
    />
  )

  return (
    <div>
      {pinned.length > 0 && (
        <div>
          <DateGroupHeader
            label="Pinned"
            count={pinned.length}
            collapsed={collapsedGroups.has('__pinned__')}
            onToggle={() => toggleGroup('__pinned__')}
          />
          {!collapsedGroups.has('__pinned__') && pinned.map(renderItem)}
        </div>
      )}
      {groups.map((group) => (
        <div key={group.label}>
          <DateGroupHeader
            label={group.label}
            count={group.sessions.length}
            collapsed={collapsedGroups.has(group.label)}
            onToggle={() => toggleGroup(group.label)}
          />
          {!collapsedGroups.has(group.label) && group.sessions.map(renderItem)}
        </div>
      ))}
    </div>
  )
}
