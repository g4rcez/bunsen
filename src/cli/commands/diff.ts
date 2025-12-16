import { loadConfig } from '../../core/config/loader.js'
import { calculateDiff } from '../../core/diff/calculator.js'
import { formatDiffResult } from '../../core/diff/formatter.js'
import { logger } from '../../utils/logger.js'
import type { DiffOptions } from '../../core/diff/types.js'

export interface DiffCommandOptions {
  config?: string
  symlinksOnly?: boolean
  envOnly?: boolean
  karabinerOnly?: boolean
  espansoOnly?: boolean
  packagesOnly?: boolean
}

export async function diffCommand(options: DiffCommandOptions): Promise<void> {
  try {
    const filterCount = [
      options.symlinksOnly,
      options.envOnly,
      options.karabinerOnly,
      options.espansoOnly,
      options.packagesOnly,
    ].filter(Boolean).length

    if (filterCount > 1) {
      logger.error('Cannot use multiple filter flags together')
      logger.plain('Use only one of: --symlinks-only, --env-only, --karabiner-only, --espanso-only, --packages-only')
      process.exit(1)
    }

    let config
    try {
      config = await loadConfig(options.config)
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        logger.error('Configuration file not found')
        logger.plain('Searched in:')
        logger.plain('  - ./dotfiles.config.ts')
        logger.plain('  - ~/.config/bunsen/dotfiles.config.ts')
        logger.plain('  - ~/dotfiles/dotfiles.config.ts')
        logger.plain('  - ~/.dotfiles/dotfiles.config.ts')
        logger.plain('')
        logger.plain("Run 'bunsen init' to create a configuration file.")
        process.exit(1)
      }

      if (error instanceof Error && error.message.includes('validation')) {
        logger.error('Configuration validation failed')
        if (options.config) {
          logger.plain(`File: ${options.config}`)
        }
        logger.plain('')
        logger.plain(error.message)
        logger.plain('')
        logger.plain('Fix these errors and try again.')
        process.exit(2)
      }

      throw error
    }

    const diffOptions: DiffOptions = {
      configPath: options.config,
      symlinksOnly: options.symlinksOnly,
      envOnly: options.envOnly,
      karabinerOnly: options.karabinerOnly,
      espansoOnly: options.espansoOnly,
      packagesOnly: options.packagesOnly,
    }

    try {
      const result = await calculateDiff(config, diffOptions)
      const output = formatDiffResult(result)
      console.log(output)
    } catch (error) {
      if (error instanceof Error && error.message.includes('state')) {
        logger.warn('State file is corrupted or invalid')
        logger.plain('Using fallback: all config items will appear as additions')
        logger.plain('')
        logger.plain("Run 'bunsen apply' to rebuild state tracking.")
        logger.plain('')
      }

      const result = await calculateDiff(config, diffOptions)
      const output = formatDiffResult(result)
      console.log(output)
    }
  } catch (error) {
    logger.error('Unexpected error')
    if (error instanceof Error) {
      logger.plain(error.message)
    }
    process.exit(1)
  }
}
