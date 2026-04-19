import { useEffect, useRef } from 'react'
import type { ChatTurn } from '../../types'
import { MessageBubble } from './MessageBubble'

interface ChatViewerProps {
  turns: ChatTurn[]
}

export function ChatViewer({ turns }: ChatViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to top when conversation loads
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [turns])

  if (turns.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No messages in this conversation
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {turns.map((turn) => (
          <MessageBubble key={turn.id} turn={turn} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
