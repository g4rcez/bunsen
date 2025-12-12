/**
 * Main dotfiles configuration API
 */

import type { DotfilesConfig } from '../core/config/types.ts'

/**
 * Defines a dotfiles configuration with type safety
 */
export function defineConfig(config: DotfilesConfig): DotfilesConfig {
  return config
}
