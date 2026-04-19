import { homedir } from 'os'
import { join } from 'path'

export function getClaudeDir(): string {
  return join(homedir(), '.claude')
}

export function getHistoryPath(): string {
  return join(getClaudeDir(), 'history.jsonl')
}

export function getProjectsDir(): string {
  return join(getClaudeDir(), 'projects')
}

export function projectPathToDir(projectPath: string): string {
  // Claude encodes project paths: C:\Users\foo -> C--Users-foo
  return projectPath.replace(/[:\\\/]/g, '-').replace(/^-+/, '')
}

export function projectDirToName(dirName: string): string {
  // C--Users-anice-myproject -> myproject (last segment)
  const parts = dirName.split('-').filter(Boolean)
  return parts[parts.length - 1] || dirName
}

export function getSessionFilePath(projectDir: string, sessionId: string): string {
  return join(getProjectsDir(), projectDir, `${sessionId}.jsonl`)
}

export function findSessionFile(sessionId: string, projectPath: string): string {
  const projectDir = projectPathToDir(projectPath)
  return getSessionFilePath(projectDir, sessionId)
}
