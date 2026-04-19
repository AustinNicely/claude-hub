import type { ContentBlock } from '../types'

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

export function hasOnlyThinking(blocks: ContentBlock[]): boolean {
  return blocks.every((b) => b.type === 'thinking' || b.type === 'tool_use' || b.type === 'tool_result')
}

export function truncateText(text: string, maxLen: number = 100): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '...'
}
