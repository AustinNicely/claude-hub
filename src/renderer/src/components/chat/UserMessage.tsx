import type { ChatTurn } from '../../types'
import { getTextContent, getImageBlocks } from '../../lib/message-parser'
import { ImageBlock } from './ImageBlock'

interface UserMessageProps {
  turn: ChatTurn
}

export function UserMessage({ turn }: UserMessageProps) {
  const text = getTextContent(turn.content)
  const imageBlocks = getImageBlocks(turn.content)

  return (
    <div className="flex gap-3 justify-end">
      <div className="max-w-[80%] bg-user-bubble rounded-2xl rounded-br-md px-4 py-3">
        {imageBlocks.map((block, i) => (
          <ImageBlock key={`img-${i}`} block={block} />
        ))}
        <div className="text-sm text-gray-100 whitespace-pre-wrap break-words">
          {text || (imageBlocks.length === 0 ? '(empty message)' : '')}
        </div>
      </div>
    </div>
  )
}
