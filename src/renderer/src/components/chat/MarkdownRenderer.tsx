import { useMemo, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, Check } from 'lucide-react'

interface MarkdownRendererProps {
  content: string
}

function CodeBlock({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const isInline = !className

  const handleCopy = useCallback(() => {
    const text = String(children).replace(/\n$/, '')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [children])

  if (isInline) {
    return <code className={className} {...props}>{children}</code>
  }

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-1.5 rounded bg-surface-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-200"
        title="Copy code"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <code className={className} {...props}>
        {children}
      </code>
    </div>
  )
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const plugins = useMemo(() => [remarkGfm], [])
  const rehypePlugins = useMemo(() => [rehypeHighlight], [])

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={plugins}
        rehypePlugins={rehypePlugins}
        components={{
          code: CodeBlock as any
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
