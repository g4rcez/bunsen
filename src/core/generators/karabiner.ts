/**
 * Karabiner configuration generator
 */

import { writeFile } from '../../utils/fs.ts'
import { expandPath } from '../symlink/resolver.ts'
import { updateKarabinerState, updateWhichKeyState } from '../state/storage.ts'
import { logger } from '../../utils/logger.ts'
import type { KarabinerConfig } from '../config/types.ts'

/**
 * Generates Karabiner JSON configuration
 */
export async function generateKarabinerConfig(
  config: KarabinerConfig,
  options: { dryRun?: boolean } = {}
): Promise<void> {
  const { dryRun = false } = options

  const outputPath = expandPath(config.outputPath)

  // Build the Karabiner JSON structure
  const karabinerJson = {
    global: {
      check_for_updates_on_startup: true,
      show_in_menu_bar: true,
      show_profile_name_in_menu_bar: false,
    },
    profiles: config.profiles.map((profile) => ({
      name: profile.name,
      selected: profile.name === 'Default',
      simple_modifications: [],
      complex_modifications: {
        rules: profile.rules.map((rule) => ({
          description: rule.description,
          manipulators: rule.manipulators,
        })),
      },
    })),
  }

  const content = JSON.stringify(karabinerJson, null, 2)

  if (dryRun) {
    logger.info(`[DRY RUN] Would write Karabiner config to: ${outputPath}`)
    logger.debug('Config preview (first 500 chars):')
    logger.plain(content.substring(0, 500) + '...')
  } else {
    await writeFile(outputPath, content)
    await updateKarabinerState(outputPath)
    logger.success(`Generated Karabiner config: ${outputPath}`)
  }

  // Generate WhichKey documentation if present
  if (config.whichKeys && config.whichKeys.length > 0 && config.whichKeyPath) {
    const whichKeyPath = expandPath(config.whichKeyPath)
    const whichKeyContent = JSON.stringify({ items: config.whichKeys }, null, 2)

    if (dryRun) {
      logger.info(`[DRY RUN] Would write WhichKey docs to: ${whichKeyPath}`)
      logger.debug(`WhichKey preview (${config.whichKeys.length} items)`)
    } else {
      await writeFile(whichKeyPath, whichKeyContent)
      await updateWhichKeyState('karabiner', whichKeyPath)
      logger.success(`Generated WhichKey docs: ${whichKeyPath} (${config.whichKeys.length} shortcuts)`)
    }
  }
}
