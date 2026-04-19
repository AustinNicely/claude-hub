import type { ChatTurn } from '../../types'
import { getTextContent } from '../../lib/message-parser'
import { User } from 'lucide-react'

interface UserMessageProps {
  turn: ChatTurn
}

export function UserMessage({ turn }: UserMessageProps) {
  const text = getTextContent(turn.content)

  return (
    <div className="flex gap-3 justify-end">
      <div className="max-w-[80%] bg-user-bubble rounded-2xl rounded-br-md px-4 py-3">
        <div className="text-sm text-gray-100 whitespace-pre-wrap break-words">
          {text || '(empty message)'}
        </div>
      </div>
    </div>
  )
}
