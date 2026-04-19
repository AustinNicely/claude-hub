import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { X } from 'lucide-react'

interface TerminalViewProps {
  terminalId: string
  isRunning: boolean
  exitCode: number | null
  onClose: () => void
}

export function TerminalView({ terminalId, isRunning, exitCode, onClose }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<any>(null)
  const fitRef = useRef<any>(null)

  useEffect(() => {
    let cleanup: (() => void) | null = null

    function init() {
      if (!containerRef.current) return

      const term = new Terminal({
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        theme: {
          background: '#0f0f0f',
          foreground: '#e0e0e0',
          cursor: '#d4a574',
          selectionBackground: '#444',
          black: '#1a1a1a',
          red: '#ff6b6b',
          green: '#69db7c',
          yellow: '#ffd93d',
          blue: '#74c0fc',
          magenta: '#da77f2',
          cyan: '#66d9e8',
          white: '#e0e0e0',
          brightBlack: '#666',
          brightRed: '#ff8787',
          brightGreen: '#8ce99a',
          brightYellow: '#ffe066',
          brightBlue: '#a5d8ff',
          brightMagenta: '#e599f7',
          brightCyan: '#99e9f2',
          brightWhite: '#ffffff'
        },
        cursorBlink: true,
        allowProposedApi: true
      })

      const fit = new FitAddon()
      term.loadAddon(fit)
      term.open(containerRef.current)
      fit.fit()

      termRef.current = term
      fitRef.current = fit

      // Wire data
      term.onData((data: string) => {
        window.api.writeTerminal(terminalId, data)
      })

      const unsubData = window.api.onTerminalData((id, data) => {
        if (id === terminalId) {
          term.write(data)
        }
      })

      // Handle resize
      const resizeObserver = new ResizeObserver(() => {
        fit.fit()
        window.api.resizeTerminal(terminalId, term.cols, term.rows)
      })
      resizeObserver.observe(containerRef.current)

      // Initial resize
      window.api.resizeTerminal(terminalId, term.cols, term.rows)

      term.focus()

      cleanup = () => {
        unsubData()
        resizeObserver.disconnect()
        term.dispose()
      }
    }

    init()

    return () => cleanup?.()
  }, [terminalId])

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-1 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-xs text-gray-400">
            {isRunning ? 'Terminal running' : exitCode !== null ? `Exited (${exitCode})` : 'Terminal'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-surface-2 rounded text-gray-400 hover:text-gray-200 transition-colors"
          title="Close terminal"
        >
          <X size={14} />
        </button>
      </div>
      <div ref={containerRef} className="flex-1 p-1" />
    </div>
  )
}
