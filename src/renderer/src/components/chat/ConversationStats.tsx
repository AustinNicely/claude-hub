import { X, MessageSquare, User, Bot, Zap, Brain, Wrench, Clock } from 'lucide-react'
import type { ConversationStats as Stats } from '../../lib/message-parser'

interface ConversationStatsProps {
  stats: Stats
  onClose: () => void
}

export function ConversationStats({ stats, onClose }: ConversationStatsProps) {
  return (
    <div className="w-64 border-l border-border bg-surface-1 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-[13px] font-medium text-gray-300">Statistics</span>
        <button onClick={onClose} className="p-0.5 rounded text-gray-500 hover:text-gray-300 hover:bg-surface-2 transition-colors">
          <X size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        <StatRow icon={<MessageSquare size={13} />} label="Total turns" value={stats.totalTurns} />
        <StatRow icon={<User size={13} />} label="User" value={stats.userTurns} />
        <StatRow icon={<Bot size={13} />} label="Assistant" value={stats.assistantTurns} />
        <div className="border-t border-border my-1" />
        <StatRow icon={<Zap size={13} />} label="Est. tokens" value={stats.estimatedTokens.toLocaleString()} />
        <StatRow icon={<Wrench size={13} />} label="Tool calls" value={stats.toolCallCount} />
        <StatRow icon={<Brain size={13} />} label="Thinking" value={stats.thinkingBlocks} />
        <StatRow icon={<Clock size={13} />} label="Duration" value={stats.duration} />

        {stats.uniqueTools.length > 0 && (
          <>
            <div className="border-t border-border my-1" />
            <div>
              <div className="text-[11px] text-gray-500 mb-1.5">Tools used</div>
              <div className="flex flex-wrap gap-1">
                {stats.uniqueTools.map((tool) => (
                  <span key={tool} className="px-1.5 py-0.5 bg-surface-2 rounded text-[10px] text-gray-400">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="text-gray-600">{icon}</div>
      <span className="text-[12px] text-gray-500 flex-1">{label}</span>
      <span className="text-[12px] text-gray-200 font-medium tabular-nums">{value}</span>
    </div>
  )
}
