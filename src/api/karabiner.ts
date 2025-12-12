import { karabiner as karabinerHelpers, BROWSER } from './karabiner-helpers.ts'
import {
  createHyperSubLayers,
  createLeaderLayers,
  createLeaderDisable,
  createWhichCommand,
} from './karabiner-layers.ts'
import type { KarabinerConfig, KarabinerRule, WhichKey } from '../core/config/types.ts'

/**
 * Karabiner helper utilities
 * Provides convenient functions for common Karabiner operations
 */
export const karabiner = {
  ...karabinerHelpers,
  createHyperSubLayers,
  createLeaderLayers,
  createLeaderDisable,
  createWhichCommand,
}

/**
 * Export advanced layer creation functions
 */
export { createHyperSubLayers, createLeaderLayers, createLeaderDisable, createWhichCommand }

/**
 * Create a Karabiner configuration with WhichKey documentation
 *
 * @example
 * ```ts
 * const hyperLayers = createHyperSubLayers({
 *   t: karabiner.app('WezTerm'),
 *   w: {
 *     h: karabiner.rectangle('left-half'),
 *     l: karabiner.rectangle('right-half'),
 *   },
 * })
 *
 * const config = createKarabinerConfig(
 *   hyperLayers.whichKey,
 *   hyperLayers.layers,
 *   customRules
 * )
 * ```
 */
export function createKarabinerConfig(
  whichKey: WhichKey[],
  ...rules: Array<KarabinerRule | KarabinerRule[]>
): {
  whichKey: WhichKey[]
  map: KarabinerRule[]
} {
  return {
    whichKey,
    map: rules.flat(),
  }
}

/**
 * Simple wrapper for Karabiner config (for type safety)
 */
export function karabinerConfig(config: KarabinerConfig): KarabinerConfig {
  return config
}

/**
 * Export BROWSER constant
 */
export { BROWSER }
