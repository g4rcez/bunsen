import { hostname } from 'node:os'
import type { DotfilesConfig, ProfileConfig, ProfileContext, EnvConfig } from './types'

/**
 * Select which profile to use based on priority
 *
 * Priority order:
 * 1. CLI parameter (--profile flag)
 * 2. Environment variable (BUNSEN_PROFILE)
 * 3. Hostname matching
 * 4. Default profile
 * 5. No profile selected
 */
export function selectProfile(
  config: DotfilesConfig,
  options: {
    cliProfile?: string
    envProfile?: string
  }
): ProfileContext {
  const profiles = config.profiles || {}

  // Priority 1: CLI parameter
  if (options.cliProfile) {
    return {
      profile: options.cliProfile,
      source: 'cli',
      exists: options.cliProfile in profiles,
    }
  }

  // Priority 2: Environment variable
  if (options.envProfile) {
    return {
      profile: options.envProfile,
      source: 'env',
      exists: options.envProfile in profiles,
    }
  }

  // Priority 3: Hostname matching
  const currentHostname = hostname()
  for (const [name, profile] of Object.entries(profiles)) {
    if (!profile.hostname) continue

    const hostnames = Array.isArray(profile.hostname)
      ? profile.hostname
      : [profile.hostname]

    if (hostnames.includes(currentHostname)) {
      return {
        profile: name,
        source: 'hostname',
        exists: true,
      }
    }
  }

  // Priority 4: Default profile
  if ('default' in profiles) {
    return {
      profile: 'default',
      source: 'default',
      exists: true,
    }
  }

  // No profile selected
  return {
    profile: '',
    source: 'default',
    exists: false,
  }
}

/**
 * Resolve profile inheritance chain
 * Follows extends chain and merges configs in order
 */
export function resolveProfile(
  profileName: string,
  profiles: Record<string, ProfileConfig>
): ProfileConfig {
  if (!profiles[profileName]) {
    return {}  // Profile doesn't exist, return empty
  }

  const visited = new Set<string>()
  const chain: ProfileConfig[] = []

  let current = profileName
  while (current && profiles[current]) {
    if (visited.has(current)) {
      throw new Error(`Circular profile inheritance detected: ${current}`)
    }
    visited.add(current)

    const profile = profiles[current]
    chain.push(profile)

    current = profile.extends || ''
  }

  // Merge chain from base to specific (reverse order)
  const merged = chain.reverse().reduce(
    (acc, profile) => ({
      symlinks: { ...acc.symlinks, ...profile.symlinks },
      env: mergeEnvConfig(acc.env, profile.env),
      karabiner: acc.karabiner || profile.karabiner,
      espanso: acc.espanso || profile.espanso,
    }),
    {} as ProfileConfig
  )
  return merged
}

/**
 * Get effective config by merging base + selected profile
 */
export function getEffectiveConfig(
  config: DotfilesConfig,
  context: ProfileContext
): DotfilesConfig {
  // If profile doesn't exist or no profile selected, return base config
  if (!context.exists || !context.profile || !config.profiles) {
    return config
  }

  // Resolve profile with inheritance
  const profileConfig = resolveProfile(context.profile, config.profiles)

  // Merge base config + profile config
  return {
    symlinks: { ...config.symlinks, ...profileConfig.symlinks },
    env: mergeEnvConfig(config.env, profileConfig.env),
    karabiner: profileConfig.karabiner || config.karabiner,
    espanso: profileConfig.espanso || config.espanso,
    packages: config.packages,
    hooks: config.hooks,
    profiles: config.profiles,
  }
}

/**
 * Merge two env configs
 * Profile overrides take precedence
 */
function mergeEnvConfig(
  base?: EnvConfig,
  override?: EnvConfig
): EnvConfig | undefined {
  if (!base && !override) return undefined
  if (!base) return override
  if (!override) return base

  return {
    shells: override.shells || base.shells,
    exportFile: override.exportFile || base.exportFile,
    variables: { ...base.variables, ...override.variables },
  }
}
