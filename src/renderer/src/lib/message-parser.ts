import type { ContentBlock, ChatTurn } from '../types'

export function getTextContent(blocks: ContentBlock[]): string {
  return blocks
    .filter((b) => b.type === 'text' && b.text)
    .map((b) => b.text!)
    .join('\n')
}

export function getThinkingBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((b) => b.type === 'thinking' && b.thinking)
}

export function getToolUseBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((b) => b.type === 'tool_use')
}

export function getToolResultBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((b) => b.type === 'tool_result')
}

export function getImageBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.filter((b) => b.type === 'image' && b.source)
}

export function hasOnlyThinking(blocks: ContentBlock[]): boolean {
  return blocks.every((b) => b.type === 'thinking' || b.type === 'tool_use' || b.type === 'tool_result')
}

export function truncateText(text: string, maxLen: number = 100): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '...'
}

export function turnsToMarkdown(turns: ChatTurn[], title?: string): string {
  const lines: string[] = []
  if (title) {
    lines.push(`# ${title}`, '')
  }
  for (const turn of turns) {
    const label = turn.role === 'user' ? '## User' : '## Assistant'
    lines.push(label, '')

    for (const block of turn.content) {
      if (block.type === 'text' && block.text) {
        lines.push(block.text, '')
      } else if (block.type === 'thinking' && block.thinking) {
        lines.push('<details><summary>Thinking</summary>', '', block.thinking, '', '</details>', '')
      } else if (block.type === 'tool_use') {
        lines.push(`**Tool: ${block.name || 'unknown'}**`, '')
        if (block.input) {
          lines.push('```json', JSON.stringify(block.input, null, 2), '```', '')
        }
      } else if (block.type === 'tool_result') {
        const resultText = typeof block.content === 'string' ? block.content : ''
        if (resultText) {
          lines.push('```', resultText, '```', '')
        }
      }
    }

    lines.push('---', '')
  }
  return lines.join('\n')
}

export interface ConversationStats {
  totalTurns: number
  userTurns: number
  assistantTurns: number
  estimatedTokens: number
  toolCallCount: number
  thinkingBlocks: number
  uniqueTools: string[]
  duration: string
}

export function computeStats(turns: ChatTurn[]): ConversationStats {
  let userTurns = 0
  let assistantTurns = 0
  let totalChars = 0
  let toolCallCount = 0
  let thinkingBlockCount = 0
  const toolNames = new Set<string>()

  for (const turn of turns) {
    if (turn.role === 'user') userTurns++
    else assistantTurns++

    for (const block of turn.content) {
      if (block.type === 'text' && block.text) totalChars += block.text.length
      if (block.type === 'thinking' && block.thinking) {
        totalChars += block.thinking.length
        thinkingBlockCount++
      }
      if (block.type === 'tool_use') {
        toolCallCount++
        if (block.name) toolNames.add(block.name)
        if (block.input) totalChars += JSON.stringify(block.input).length
      }
      if (block.type === 'tool_result') {
        if (typeof block.content === 'string') totalChars += block.content.length
      }
    }
  }

  // Compute duration from first to last turn
  let duration = 'N/A'
  if (turns.length >= 2) {
    const first = new Date(turns[0].timestamp).getTime()
    const last = new Date(turns[turns.length - 1].timestamp).getTime()
    const diffMs = last - first
    if (diffMs > 0 && !isNaN(diffMs)) {
      const mins = Math.floor(diffMs / 60000)
      const hours = Math.floor(mins / 60)
      if (hours > 0) {
        duration = `${hours}h ${mins % 60}m`
      } else {
        duration = `${mins}m`
      }
    }
  }

  return {
    totalTurns: turns.length,
    userTurns,
    assistantTurns,
    estimatedTokens: Math.round(totalChars / 4),
    toolCallCount,
    thinkingBlocks: thinkingBlockCount,
    uniqueTools: [...toolNames].sort(),
    duration
  }
}
