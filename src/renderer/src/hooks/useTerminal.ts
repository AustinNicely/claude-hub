import { useState, useCallback, useEffect, useRef } from 'react'

export function useTerminal() {
  const [terminalId, setTerminalId] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [exitCode, setExitCode] = useState<number | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const spawn = useCallback(async (cwd?: string) => {
    try {
      const id = await window.api.spawnTerminal(cwd)
      setTerminalId(id)
      setIsRunning(true)
      setExitCode(null)
      return id
    } catch (err) {
      console.error('Failed to spawn terminal:', err)
      return null
    }
  }, [])

  const kill = useCallback(() => {
    if (terminalId) {
      window.api.killTerminal(terminalId)
      setIsRunning(false)
    }
  }, [terminalId])

  const close = useCallback(() => {
    kill()
    setTerminalId(null)
    setExitCode(null)
  }, [kill])

  useEffect(() => {
    const unsub = window.api.onTerminalExit((id, code) => {
      if (id === terminalId) {
        setIsRunning(false)
        setExitCode(code)
      }
    })
    cleanupRef.current = unsub
    return unsub
  }, [terminalId])

  return { terminalId, isRunning, exitCode, spawn, kill, close }
}
