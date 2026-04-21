import { useState, useCallback } from 'react'
import { Download, ZoomIn, ZoomOut, X } from 'lucide-react'
import type { ContentBlock } from '../../types'

interface ImageBlockProps {
  block: ContentBlock
}

export function ImageBlock({ block }: ImageBlockProps) {
  const [lightbox, setLightbox] = useState(false)

  const src = block.source?.type === 'base64'
    ? `data:${block.source.media_type};base64,${block.source.data}`
    : block.source?.url || ''

  const handleDownload = useCallback(() => {
    const a = document.createElement('a')
    a.href = src
    a.download = `image-${Date.now()}.${block.source?.media_type?.split('/')[1] || 'png'}`
    a.click()
  }, [src, block.source?.media_type])

  if (!src) return null

  return (
    <>
      <div className="my-2 inline-block max-w-sm">
        <img
          src={src}
          alt="Conversation image"
          className="rounded-lg border border-border max-h-64 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setLightbox(true)}
          draggable
        />
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleDownload() }}
              className="p-2 rounded-lg bg-surface-2/80 text-gray-300 hover:text-white hover:bg-surface-3 transition-colors"
              title="Download image"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => setLightbox(false)}
              className="p-2 rounded-lg bg-surface-2/80 text-gray-300 hover:text-white hover:bg-surface-3 transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
          <img
            src={src}
            alt="Conversation image"
            className="max-w-[90vw] max-h-[90vh] rounded-lg"
            onClick={(e) => e.stopPropagation()}
            draggable
          />
        </div>
      )}
    </>
  )
}
