import type { ChatTurn } from '../../types'
import { getTextContent, getThinkingBlocks, getToolUseBlocks } from '../../lib/message-parser'
import { MarkdownRenderer } from './MarkdownRenderer'
import { ThinkingBlock } from './ThinkingBlock'
import { ToolUseBlock } from './ToolUseBlock'
import { Sparkles } from 'lucide-react'

interface AssistantMessageProps {
  turn: ChatTurn
}

export function AssistantMessage({ turn }: AssistantMessageProps) {
  const text = getTextContent(turn.content)
  const thinkingBlocks = getThinkingBlocks(turn.content)
  const toolBlocks = getToolUseBlocks(turn.content)

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-1">
        <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
          <Sparkles size={14} className="text-accent" />
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {thinkingBlocks.length > 0 && (
          <ThinkingBlock blocks={thinkingBlocks} />
        )}

        {toolBlocks.map((block, i) => (
          <ToolUseBlock key={i} block={block} />
        ))}

        {text && (
          <div className="text-sm text-gray-200">
            <MarkdownRenderer content={text} />
          </div>
        )}

        {!text && thinkingBlocks.length === 0 && toolBlocks.length === 0 && (
          <div className="text-sm text-gray-500 italic">(no text content)</div>
        )}
      </div>
    </div>
  )
}
