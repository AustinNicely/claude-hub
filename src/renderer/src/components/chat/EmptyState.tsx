import { MessageSquare, Terminal } from 'lucide-react'

interface EmptyStateProps {
  onNewSession: () => void
}

export function EmptyState({ onNewSession }: EmptyStateProps) {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto">
        <MessageSquare size={28} className="text-gray-600" />
      </div>
      <div>
        <h2 className="text-lg font-medium text-gray-300">Claude Hub</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select a conversation from the sidebar to view it,
          <br />
          or start a new Claude Code session.
        </p>
      </div>
      <button
        onClick={onNewSession}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors text-sm"
      >
        <Terminal size={16} />
        New Session
      </button>
    </div>
  )
}
