export interface SymlinkConfig {
  [target: string]:
    | string
    | {
        source: string
        backup?: boolean
        force?: boolean
        createDirs?: boolean
      }
}

export type Shells = 'zsh' | 'bash' | 'fish'

export interface EnvConfig {
  shells?: Shells[]
  exportFile?: string
  variables: Record<string, string | string[]>
}

export interface KarabinerManipulator {
  type: 'basic' | 'mouse_motion_to_scroll'
  from: {
    key_code?: string
    modifiers?: {
      mandatory?: string[]
      optional?: string[]
    }
  }
  to?: Array<{
    key_code?: string
    modifiers?: string[]
    shell_command?: string
  }>
  to_if_alone?: Array<{
    key_code?: string
    modifiers?: string[]
  }>
  conditions?: Array<{
    type: string
    [key: string]: unknown
  }>
}

/**
 * Karabiner rule
 */
export interface KarabinerRule {
  description: string
  manipulators: KarabinerManipulator[]
}

/**
 * Karabiner profile
 */
export interface KarabinerProfile {
  name: string
  rules: KarabinerRule[]
}

/**
 * Karabiner configuration
 */
export interface KarabinerConfig {
  profiles: KarabinerProfile[]
  outputPath: string
}

/**
 * Espanso match variable
 */
export interface EspansoVariable {
  name: string
  type: 'date' | 'shell' | 'clipboard' | 'echo'
  params?: Record<string, unknown>
}

/**
 * Espanso match
 */
export interface EspansoMatch {
  trigger: string
  replace: string
  vars?: EspansoVariable[]
  word?: boolean
  propagate_case?: boolean
  regex?: string
}

/**
 * Espanso configuration
 */
export interface EspansoConfig {
  matches: EspansoMatch[]
  outputPath: string
}

/**
 * Supported package managers
 */
export type PackageManager = 'brew' | 'apt' | 'pacman' | 'dnf'

/**
 * Package manager configuration
 */
export interface PackageManagerConfig {
  /** Homebrew packages (macOS) */
  brew?: string[] | { packages?: string[]; import?: string }

  /** APT packages (Debian/Ubuntu) */
  apt?: string[] | { packages?: string[]; import?: string }

  /** Pacman packages (Arch Linux) */
  pacman?: string[] | { packages?: string[]; import?: string }

  /** DNF packages (Fedora/RHEL) */
  dnf?: string[] | { packages?: string[]; import?: string }

  /** Skip sudo confirmation for apt/pacman/dnf */
  autoSudo?: boolean
}

/**
 * Package installation result
 */
export interface PackageInstallResult {
  manager: PackageManager
  package: string
  success: boolean
  alreadyInstalled: boolean
  error?: string
}

/**
 * Lifecycle hooks
 */
export interface Hooks {
  beforeApply?: () => Promise<void> | void
  afterApply?: () => Promise<void> | void
}

/**
 * Main dotfiles configuration
 */
export interface DotfilesConfig {
  /** Symlink declarations */
  symlinks?: SymlinkConfig
  /** Environment variable management */
  env?: EnvConfig
  /** Karabiner keyboard configuration */
  karabiner?: KarabinerConfig
  /** Espanso text expansion configuration */
  espanso?: EspansoConfig
  /** Package manager configuration */
  packages?: PackageManagerConfig
  /** Lifecycle hooks */
  hooks?: Hooks
}

/**
 * Normalized symlink entry for internal use
 */
export interface NormalizedSymlink {
  target: string
  source: string
  backup: boolean
  force: boolean
  createDirs: boolean
}

/**
 * State file structure
 */
export interface StateFile {
  version: string
  lastApplied: string
  symlinks: Array<{
    target: string
    source: string
    createdAt: string
    checksum: string
  }>
  env?: {
    exportFile: string
    injectedShells: string[]
  }
  karabiner?: {
    outputPath: string
    lastGenerated: string
  }
  espanso?: {
    outputPath: string
    lastGenerated: string
  }
  packages?: {
    installed: Array<{
      manager: PackageManager
      package: string
      installedAt: string
      version?: string
    }>
    lastSync: string
  }
}
