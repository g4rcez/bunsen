import ora from 'ora'
import { loadConfig } from '../../core/config/loader.ts'
import { normalizeSymlinks, createSymlink } from '../../core/symlink/manager.ts'
import { generateEnvConfig } from '../../core/generators/env.ts'
import { generateKarabinerConfig } from '../../core/generators/karabiner.ts'
import { generateEspansoConfig } from '../../core/generators/espanso.ts'
import { generatePackagesConfig } from '../../core/generators/packages.ts'
import { updateLastApplied } from '../../core/state/storage.ts'
import { logger } from '../../utils/logger.ts'

export interface ApplyOptions {
  config?: string
  dryRun?: boolean
  force?: boolean
  symlinksOnly?: boolean
  envOnly?: boolean
  karabinerOnly?: boolean
  espansoOnly?: boolean
  packagesOnly?: boolean
}

export async function applyCommand(options: ApplyOptions) {
  const { dryRun = false, force = false } = options
  const spinner = ora('Loading configuration...').start()
  let config
  try {
    config = await loadConfig(options.config)
    spinner.succeed('Configuration loaded')
  } catch (error) {
    spinner.fail('Failed to load configuration')
    if (error instanceof Error) {
      logger.plain(error.message)
    }
    process.exit(1)
  }

  if (config.hooks?.beforeApply) {
    try {
      await config.hooks.beforeApply()
    } catch (error) {
      logger.error('beforeApply hook failed')
      if (error instanceof Error) {
        logger.plain(error.message)
      }
    }
  }

  const applyAll =
    !options.symlinksOnly &&
    !options.envOnly &&
    !options.karabinerOnly &&
    !options.espansoOnly &&
    !options.packagesOnly

  // Apply packages (BEFORE symlinks, so dependencies are available)
  if ((applyAll || options.packagesOnly) && config.packages) {
    spinner.start('Installing packages...')
    try {
      await generatePackagesConfig(config.packages, { dryRun })
      if (dryRun) {
        spinner.info('[DRY RUN] Would install packages')
      } else {
        spinner.succeed('Installed packages')
      }
    } catch (error) {
      spinner.fail('Failed to install packages')
      if (error instanceof Error) {
        logger.error(error.message)
      }
    }
  }

  if ((applyAll || options.symlinksOnly) && config.symlinks) {
    spinner.start('Creating symlinks...')
    const normalized = normalizeSymlinks(config.symlinks)
    let successCount = 0

    for (const link of normalized) {
      const success = await createSymlink(link, { dryRun, force })
      if (success) successCount++
    }

    if (dryRun) {
      spinner.info(`[DRY RUN] Would create ${successCount}/${normalized.length} symlinks`)
    } else {
      spinner.succeed(`Created ${successCount}/${normalized.length} symlinks`)
    }
  }

  // Apply env variables
  if ((applyAll || options.envOnly) && config.env) {
    spinner.start('Generating environment variables...')
    try {
      await generateEnvConfig(config.env, { dryRun })
      if (dryRun) {
        spinner.info('[DRY RUN] Would generate env config')
      } else {
        spinner.succeed('Generated environment variables')
      }
    } catch (error) {
      spinner.fail('Failed to generate env config')
      if (error instanceof Error) {
        logger.error(error.message)
      }
    }
  }

  // Apply Karabiner
  if ((applyAll || options.karabinerOnly) && config.karabiner) {
    spinner.start('Generating Karabiner configuration...')
    try {
      await generateKarabinerConfig(config.karabiner, { dryRun })
      if (dryRun) {
        spinner.info('[DRY RUN] Would generate Karabiner config')
      } else {
        spinner.succeed('Generated Karabiner configuration')
      }
    } catch (error) {
      spinner.fail('Failed to generate Karabiner config')
      if (error instanceof Error) {
        logger.error(error.message)
      }
    }
  }

  // Apply Espanso
  if ((applyAll || options.espansoOnly) && config.espanso) {
    spinner.start('Generating Espanso configuration...')
    try {
      await generateEspansoConfig(config.espanso, { dryRun })
      if (dryRun) {
        spinner.info('[DRY RUN] Would generate Espanso config')
      } else {
        spinner.succeed('Generated Espanso configuration')
      }
    } catch (error) {
      spinner.fail('Failed to generate Espanso config')
      if (error instanceof Error) {
        logger.error(error.message)
      }
    }
  }

  // Update state
  if (!dryRun) {
    await updateLastApplied()
  }

  // Run after hook
  if (config.hooks?.afterApply) {
    try {
      await config.hooks.afterApply()
    } catch (error) {
      logger.error('afterApply hook failed')
      if (error instanceof Error) {
        logger.plain(error.message)
      }
    }
  }

  logger.plain('')
  if (dryRun) {
    logger.success('[DRY RUN] Complete - no changes were made')
  } else {
    logger.success('Configuration applied successfully!')
  }
}
