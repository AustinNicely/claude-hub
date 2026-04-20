import {
  isToday,
  isYesterday,
  differenceInDays,
  differenceInMonths,
  format
} from 'date-fns'
import type { SessionSummary, DateGroup } from '../types'

export function groupByDate(sessions: SessionSummary[]): DateGroup[] {
  const groups: Map<string, SessionSummary[]> = new Map()
  const order = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days', 'Older']

  for (const label of order) {
    groups.set(label, [])
  }

  for (const session of sessions) {
    const date = new Date(session.timestamp)
    const now = new Date()

    let label: string
    if (session.timestamp === 0) {
      label = 'Older'
    } else if (isToday(date)) {
      label = 'Today'
    } else if (isYesterday(date)) {
      label = 'Yesterday'
    } else if (differenceInDays(now, date) <= 7) {
      label = 'Previous 7 Days'
    } else if (differenceInDays(now, date) <= 30) {
      label = 'Previous 30 Days'
    } else {
      // Group older sessions by month
      const monthLabel = format(date, 'MMMM yyyy')
      label = monthLabel
      if (!groups.has(label)) {
        groups.set(label, [])
        order.push(label)
      }
    }

    groups.get(label)!.push(session)
  }

  return order
    .filter((label) => groups.get(label)!.length > 0)
    .map((label) => ({
      label,
      sessions: groups.get(label)!
    }))
}

export function groupByProject(sessions: SessionSummary[]): DateGroup[] {
  const groups = new Map<string, SessionSummary[]>()

  for (const session of sessions) {
    const name = session.projectName || 'Unknown Project'
    if (!groups.has(name)) {
      groups.set(name, [])
    }
    groups.get(name)!.push(session)
  }

  // Sort projects alphabetically, sessions within each by timestamp (newest first)
  const sortedKeys = [...groups.keys()].sort((a, b) => a.localeCompare(b))

  return sortedKeys.map((label) => ({
    label,
    sessions: groups.get(label)!
  }))
}
