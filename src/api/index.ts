export { defineConfig } from './dotfiles.ts'
export { karabiner, mapKey, hyperKey } from './karabiner.ts'
export { espanso, textReplacement, dateReplacement, shellReplacement } from './espanso.ts'
export { packages, importFrom, inlinePackages } from './packages.ts'
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
  PackageManagerConfig,
  PackageManager,
  Hooks,
} from '../core/config/types.ts'
