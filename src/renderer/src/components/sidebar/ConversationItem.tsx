import { format } from 'date-fns'
import { MessageSquare, AlertCircle } from 'lucide-react'
import type { SessionSummary } from '../../types'

interface ConversationItemProps {
  session: SessionSummary
  selected: boolean
  onClick: () => void
}

export function ConversationItem({ session, selected, onClick }: ConversationItemProps) {
  const timeStr = session.timestamp
    ? format(new Date(session.timestamp), 'h:mm a')
    : ''

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 hover:bg-surface-2 transition-colors group ${
        selected ? 'bg-surface-2 border-l-2 border-accent' : 'border-l-2 border-transparent'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-200 truncate leading-snug">
            {session.display}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 truncate">
              {session.projectName}
            </span>
            {timeStr && (
              <span className="text-xs text-gray-600 flex-shrink-0">
                {timeStr}
              </span>
            )}
          </div>
        </div>
        {!session.hasData && (
          <AlertCircle size={12} className="text-gray-600 flex-shrink-0 mt-1" title="Session data unavailable" />
        )}
      </div>
    </button>
  )
}
