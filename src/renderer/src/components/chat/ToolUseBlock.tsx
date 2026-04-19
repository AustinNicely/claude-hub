import { useState } from 'react'
import { ChevronRight, Wrench } from 'lucide-react'
import type { ContentBlock } from '../../types'

interface ToolUseBlockProps {
  block: ContentBlock
}

export function ToolUseBlock({ block }: ToolUseBlockProps) {
  const [expanded, setExpanded] = useState(false)

  const toolName = block.name || 'Unknown tool'
  const input = block.input || {}

  // Build a summary line from tool input
  let summary = ''
  if ('command' in input) {
    summary = String(input.command).slice(0, 80)
  } else if ('file_path' in input) {
    summary = String(input.file_path)
  } else if ('pattern' in input) {
    summary = String(input.pattern)
  } else if ('query' in input) {
    summary = String(input.query)
  }

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
        <Wrench size={14} />
        <span className="font-medium text-accent-dim">{toolName}</span>
        {summary && (
          <span className="text-gray-600 truncate ml-1 font-mono">{summary}</span>
        )}
      </button>
      {expanded && (
        <div className="px-3 py-2 border-t border-border bg-surface-1/50">
          <pre className="text-xs text-gray-400 whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
            {JSON.stringify(input, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
