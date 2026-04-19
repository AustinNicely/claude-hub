import type { ChatTurn } from '../../types'
import { UserMessage } from './UserMessage'
import { AssistantMessage } from './AssistantMessage'

interface MessageBubbleProps {
  turn: ChatTurn
}

export function MessageBubble({ turn }: MessageBubbleProps) {
  if (turn.role === 'user') {
    return <UserMessage turn={turn} />
  }
  return <AssistantMessage turn={turn} />
}
