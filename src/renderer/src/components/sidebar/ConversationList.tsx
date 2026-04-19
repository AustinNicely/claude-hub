import type { SessionSummary } from '../../types'
import { groupByDate } from '../../lib/date-groups'
import { ConversationItem } from './ConversationItem'
import { DateGroupHeader } from './DateGroupHeader'

interface ConversationListProps {
  sessions: SessionSummary[]
  selectedId: string | null
  onSelect: (sessionId: string) => void
}

export function ConversationList({ sessions, selectedId, onSelect }: ConversationListProps) {
  const groups = groupByDate(sessions)

  return (
    <div>
      {groups.map((group) => (
        <div key={group.label}>
          <DateGroupHeader label={group.label} />
          {group.sessions.map((session) => (
            <ConversationItem
              key={session.sessionId}
              session={session}
              selected={session.sessionId === selectedId}
              onClick={() => onSelect(session.sessionId)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
