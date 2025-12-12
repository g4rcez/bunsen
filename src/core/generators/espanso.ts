import { stringify } from 'yaml'
import { writeFile } from '../../utils/fs.ts'
import { expandPath } from '../symlink/resolver.ts'
import { updateEspansoState } from '../state/storage.ts'
import { logger } from '../../utils/logger.ts'
import type { EspansoConfig } from '../config/types.ts'

export async function generateEspansoConfig(
  config: EspansoConfig,
  options: { dryRun?: boolean } = {}
): Promise<void> {
  const { dryRun = false } = options

  const outputPath = expandPath(config.outputPath)

  // Build the Espanso YAML structure
  const espansoYaml = {
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

      return entry
    }),
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
}
