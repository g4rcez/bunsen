import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { writeFile } from '../../utils/fs.ts'
import { getShellConfigPath, injectIntoShellConfig, hasBunsenIntegration } from '../../utils/shell.ts'
import { updateEnvState } from '../state/storage.ts'
import { expandPath } from '../symlink/resolver.ts'
import { logger } from '../../utils/logger.ts'
import type { EnvConfig } from '../config/types.ts'

function generateExports(variables: Record<string, string | string[]>): string {
  const lines: string[] = ['#!/bin/bash', '']

  for (const [key, value] of Object.entries(variables)) {
    if (Array.isArray(value)) {
      // Handle arrays (like PATH)
      // Replace $PATH tokens with the actual $PATH variable
      const joined = value
        .map((v) => {
          // If it's $PATH or ${PATH}, keep it as-is for shell expansion
          if (v === '$PATH' || v === '${PATH}') {
            return '$PATH'
          }
          // Otherwise, expand any home directory references
          return expandPath(v).replace(homedir(), '$HOME')
        })
        .join(':')

      lines.push(`export ${key}="${joined}"`)
    } else {
      // Handle regular strings
      const expanded = expandPath(value).replace(homedir(), '$HOME')
      lines.push(`export ${key}="${expanded}"`)
    }
  }

  return lines.join('\n') + '\n'
}

/**
 * Generates environment variable configuration
 */
export async function generateEnvConfig(
  config: EnvConfig,
  options: { dryRun?: boolean } = {}
): Promise<void> {
  const { dryRun = false } = options

  // Determine export file path
  const exportFile = config.exportFile
    ? expandPath(config.exportFile)
    : resolve(homedir(), '.config/bunsen/env.sh')

  // Generate export statements
  const content = generateExports(config.variables)

  if (dryRun) {
    logger.info(`[DRY RUN] Would write env exports to: ${exportFile}`)
    logger.debug('Export content:')
    logger.plain(content)
  } else {
    // Write export file
    await writeFile(exportFile, content)
    logger.success(`Generated env exports: ${exportFile}`)
  }

  // Inject into shell configs
  const shells = config.shells || ['zsh', 'bash']
  const injectedShells: string[] = []

  for (const shell of shells) {
    const configPath = getShellConfigPath(shell)

    if (dryRun) {
      const hasIntegration = await hasBunsenIntegration(configPath)
      if (hasIntegration) {
        logger.info(`[DRY RUN] Would update ${shell} config: ${configPath}`)
      } else {
        logger.info(`[DRY RUN] Would inject into ${shell} config: ${configPath}`)
      }
    } else {
      try {
        await injectIntoShellConfig(configPath, exportFile)
        injectedShells.push(configPath)
        logger.success(`Injected into ${shell} config: ${configPath}`)
      } catch (error) {
        logger.error(`Failed to inject into ${shell} config: ${error}`)
      }
    }
  }

  // Update state
  if (!dryRun) {
    await updateEnvState(exportFile, injectedShells)
  }
}
