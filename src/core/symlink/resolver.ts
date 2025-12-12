import { resolve, normalize } from 'node:path'
import { homedir } from 'node:os'

export function expandPath(path: string): string {
  const expanded = path.startsWith('~/') ? path.replace('~', homedir()) : path
  return normalize(
    expanded
      .replace(/\$(\w+)/g, (_, varName) => process.env[varName] || `$${varName}`)
      .replace(/\$\{(\w+)\}/g, (_, varName) => process.env[varName] || `\${${varName}}`)
  )
}

export function resolvePath(path: string): string {
  return resolve(expandPath(path))
}

export function validatePath(path: string): boolean {
  const normalized = normalize(path)
  const segments = normalized.split('/')
  return !segments.includes('..')
}

export function isAbsolute(path: string): boolean {
  return path.startsWith('/')
}
