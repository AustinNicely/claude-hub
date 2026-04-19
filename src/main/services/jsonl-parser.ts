import { createReadStream } from 'fs'
import { createInterface } from 'readline'

export async function parseJsonlFile<T>(filePath: string): Promise<T[]> {
  const results: T[] = []

  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, { encoding: 'utf-8' })
    const rl = createInterface({ input: stream, crlfDelay: Infinity })

    rl.on('line', (line) => {
      const trimmed = line.trim()
      if (!trimmed) return
      try {
        results.push(JSON.parse(trimmed) as T)
      } catch {
        // Skip malformed lines
      }
    })

    rl.on('close', () => resolve(results))
    rl.on('error', reject)
    stream.on('error', reject)
  })
}

export async function parseJsonlFileFiltered<T>(
  filePath: string,
  filter: (item: T) => boolean
): Promise<T[]> {
  const results: T[] = []

  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, { encoding: 'utf-8' })
    const rl = createInterface({ input: stream, crlfDelay: Infinity })

    rl.on('line', (line) => {
      const trimmed = line.trim()
      if (!trimmed) return
      try {
        const parsed = JSON.parse(trimmed) as T
        if (filter(parsed)) {
          results.push(parsed)
        }
      } catch {
        // Skip malformed lines
      }
    })

    rl.on('close', () => resolve(results))
    rl.on('error', reject)
    stream.on('error', reject)
  })
}
