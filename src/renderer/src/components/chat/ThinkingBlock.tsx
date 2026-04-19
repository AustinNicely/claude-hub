import { useState } from 'react'
import { ChevronRight, Brain } from 'lucide-react'
import type { ContentBlock } from '../../types'

interface ThinkingBlockProps {
  blocks: ContentBlock[]
}

export function ThinkingBlock({ blocks }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false)

  const totalText = blocks.map((b) => b.thinking || '').join('\n\n')
  const preview = totalText.slice(0, 120).replace(/\n/g, ' ')

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-gray-300 hover:bg-surface-2 transition-colors"
      >
        <ChevronRight
          size={14}
          className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
        <Brain size={14} />
        <span className="font-medium">Thinking</span>
        {!expanded && (
          <span className="text-gray-600 truncate ml-1">{preview}...</span>
        )}
      </button>
      {expanded && (
        <div className="px-3 py-2 border-t border-border bg-surface-1/50 text-xs text-gray-400 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
          {totalText}
        </div>
      )}
    </div>
  )
}
