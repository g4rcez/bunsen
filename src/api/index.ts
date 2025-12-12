export { defineConfig } from './dotfiles.ts'

// Karabiner exports
export {
  karabiner,
  createKarabinerConfig,
  createHyperSubLayers,
  createLeaderLayers,
  createLeaderDisable,
  createWhichCommand,
  karabinerConfig,
  BROWSER,
} from './karabiner.ts'

// Espanso exports
export {
  createEspansoConfig,
  espanso,
  textReplacement,
  dateReplacement,
  shellReplacement,
} from './espanso.ts'

export { packages, importFrom, inlinePackages } from './packages.ts'

// Export all types
export type {
  DotfilesConfig,
  SymlinkConfig,
  EnvConfig,
  KarabinerConfig,
  KarabinerProfile,
  KarabinerRule,
  KarabinerManipulator,
  EspansoConfig,
  EspansoMatch,
  EspansoVariable,
  EspansoBuilderMatch,
  EspansoBuilder,
  PackageManagerConfig,
  PackageManager,
  Hooks,
  // New types from dotbot API
  LayerCommand,
  KeyCode,
  RectangleActions,
  SubLayers,
  HyperKeySublayer,
  WhichKey,
  To,
  From,
  Modifiers,
  Conditions,
  Parameters,
  Empty,
  Alphabet,
} from '../core/config/types.ts'
