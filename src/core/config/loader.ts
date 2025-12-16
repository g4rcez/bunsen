import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { logger } from '../../utils/logger.ts'
import { DotfilesConfigSchema } from './schema.ts'
import type { DotfilesConfig } from './types.ts'

export function findConfigFile(configPath?: string): string | null {
  const searchPaths = configPath
    ? [resolve(configPath)]
    : [
        resolve(process.cwd(), 'dotfiles.config.ts'),
        resolve(process.cwd(), 'dotfiles.config.js'),
        resolve(homedir(), '.config/bunsen/dotfiles.config.ts'),
        resolve(homedir(), '.config/bunsen/dotfiles.config.js'),
        resolve(homedir(), 'dotfiles/dotfiles.config.ts'),
        resolve(homedir(), 'dotfiles/dotfiles.config.js'),
        resolve(homedir(), '.dotfiles/dotfiles.config.ts'),
        resolve(homedir(), '.dotfiles/dotfiles.config.js'),
      ]

  for (const path of searchPaths) {
    if (existsSync(path)) {
      logger.debug(`Found config file: ${path}`)
      return path
    }
  }
  return null
}

export async function loadConfig(configPath?: string): Promise<DotfilesConfig> {
  const configFile = findConfigFile(configPath)
  if (!configFile) {
    throw new Error(
      'Could not find dotfiles.config.ts or dotfiles.config.js.\n' +
        'Search paths:\n' +
        '  - ./dotfiles.config.ts\n' +
        '  - ~/.config/bunsen/dotfiles.config.ts\n' +
        '  - ~/dotfiles/dotfiles.config.ts\n' +
        '  - ~/.dotfiles/dotfiles.config.ts\n' +
        'Run "bunsen init" to create a new configuration file.'
    )
  }
  logger.info(`Using config file: ${configFile}`)
  try {
    const fileUrl = pathToFileURL(configFile).href
    const module = await import(fileUrl)
    const config = module.default
    if (!config) {
      throw new Error('Configuration file must have a default export')
    }
    const result = DotfilesConfigSchema.safeParse(config)
    if (!result.success) {
      const errors = result.error.issues
        .map((err) => `  - ${String(err.path.join('.'))}:${err.message}`)
        .join('\n')
      throw new Error(`Configuration validation failed:\n${errors}`)
    }
    logger.debug('Configuration loaded and validated successfully')
    return result.data as DotfilesConfig
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('TypeScript')) {
        throw new Error(
          'Failed to load TypeScript config file.\n' +
            'Make sure you are using Bun 1.0.0 or higher.\n' +
            'Bun natively supports TypeScript without any configuration.\n\n' +
            'Or convert your config to JavaScript (.js).'
        )
      }
      throw error
    }
    throw error
  }
}

export function getConfigDir(configPath?: string): string {
  const configFile = findConfigFile(configPath)
  if (!configFile) {
    throw new Error('Could not find configuration file')
  }
  return dirname(configFile)
}
