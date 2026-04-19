import { Plus, Terminal } from 'lucide-react'

interface TopBarProps {
  onNewSession: () => void
  title?: string
}

export function TopBar({ onNewSession, title }: TopBarProps) {
  return (
    <div className="h-12 bg-surface-1 border-b border-border flex items-center px-4 titlebar-drag">
      {/* macOS traffic light spacing */}
      <div className="w-20 flex-shrink-0" />

      <div className="flex-1 flex items-center justify-center titlebar-no-drag">
        <span className="text-sm text-gray-400 truncate max-w-md">
          {title || 'Claude Hub'}
        </span>
      </div>

      <div className="flex items-center gap-2 titlebar-no-drag">
        <button
          onClick={onNewSession}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-sm text-gray-300 hover:text-white transition-colors"
          title="New Session (Ctrl+N)"
        >
          <Terminal size={14} />
          <span>New</span>
        </button>
      </div>
    </div>
  )
}
