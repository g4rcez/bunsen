import { stringify } from 'yaml'
import { writeFile } from '../../utils/fs.ts'
import { expandPath } from '../symlink/resolver.ts'
import { updateEspansoState, updateWhichKeyState } from '../state/storage.ts'
import { logger } from '../../utils/logger.ts'
import type { EspansoConfig } from '../config/types.ts'

export async function generateEspansoConfig(
  config: EspansoConfig,
  options: { dryRun?: boolean } = {}
): Promise<void> {
  const { dryRun = false } = options

  const outputPath = expandPath(config.outputPath)

  // Build the Espanso YAML structure
  const espansoYaml: Record<string, unknown> = {
    matches: config.matches.map((match) => {
      const entry: Record<string, unknown> = {
        trigger: match.trigger,
        replace: match.replace,
      }

      if (match.vars) {
        entry.vars = match.vars
      }

      if (match.word !== undefined) {
        entry.word = match.word
      }

      if (match.propagate_case !== undefined) {
        entry.propagate_case = match.propagate_case
      }

      if (match.regex) {
        entry.regex = match.regex
      }

      if (match.form) {
        entry.form = match.form
      }

      return entry
    }),
  }

  // Add imports if present
  if (config.imports && config.imports.length > 0) {
    espansoYaml.imports = config.imports
  }

  const content = stringify(espansoYaml)

  if (dryRun) {
    logger.info(`[DRY RUN] Would write Espanso config to: ${outputPath}`)
    logger.debug('Config preview:')
    logger.plain(content.substring(0, 500) + (content.length > 500 ? '...' : ''))
  } else {
    await writeFile(outputPath, content)
    await updateEspansoState(outputPath)
    logger.success(`Generated Espanso config: ${outputPath}`)
  }

  // Generate trigger documentation (WhichKey equivalent for Espanso)
  if (config.whichKeyPath && config.matches.length > 0) {
    const triggers = config.matches
      .filter((m) => m.label)
      .map((m) => ({
        trigger: m.trigger,
        label: m.label,
        replace: m.replace,
      }))

    if (triggers.length > 0) {
      const whichKeyPath = expandPath(config.whichKeyPath)
      const triggerContent = JSON.stringify(triggers, null, 2)

      if (dryRun) {
        logger.info(`[DRY RUN] Would write trigger docs to: ${whichKeyPath}`)
        logger.debug(`Trigger preview (${triggers.length} items)`)
      } else {
        await writeFile(whichKeyPath, triggerContent)
        await updateWhichKeyState('espanso', whichKeyPath)
        logger.success(`Generated trigger docs: ${whichKeyPath} (${triggers.length} triggers)`)
      }
    }
  }
}
