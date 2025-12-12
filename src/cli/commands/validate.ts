import { loadConfig } from '../../core/config/loader.ts'
import { logger } from '../../utils/logger.ts'

export async function validateCommand(options: { config?: string }) {
  try {
    const config = await loadConfig(options.config)
    logger.success('Configuration is valid')

    // Show summary
    const features: string[] = []
    if (config.symlinks) features.push(`${Object.keys(config.symlinks).length} symlinks`)
    if (config.env) features.push('env variables')
    if (config.karabiner) features.push('karabiner')
    if (config.espanso) features.push('espanso')

    if (features.length > 0) {
      logger.info(`Found: ${features.join(', ')}`)
    }
  } catch (error) {
    logger.error('Configuration validation failed')
    logger.error(error);
    if (error instanceof Error) {
      logger.plain(error.message)
    }
    process.exit(1)
  }
}
