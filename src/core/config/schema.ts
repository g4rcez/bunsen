import { z } from 'zod'

export const SymlinkConfigSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z.object({
      source: z.string(),
      backup: z.boolean().optional(),
      force: z.boolean().optional(),
      createDirs: z.boolean().optional(),
    }),
  ])
)

/**
 * Environment variable configuration schema
 */
export const EnvConfigSchema = z.object({
  variables: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  shells: z.array(z.enum(['zsh', 'bash', 'fish'])).optional(),
  exportFile: z.string().optional(),
})

/**
 * Karabiner manipulator schema
 */
export const KarabinerManipulatorSchema = z.object({
  type: z.enum(['basic', 'mouse_motion_to_scroll']),
  from: z.object({
    key_code: z.string().optional(),
    modifiers: z
      .object({
        mandatory: z.array(z.string()).optional(),
        optional: z.array(z.string()).optional(),
      })
      .optional(),
  }),
  to: z
    .array(
      z.object({
        key_code: z.string().optional(),
        modifiers: z.array(z.string()).optional(),
        shell_command: z.string().optional(),
      })
    )
    .optional(),
  to_if_alone: z
    .array(
      z.object({
        key_code: z.string().optional(),
        modifiers: z.array(z.string()).optional(),
      })
    )
    .optional(),
  conditions: z
    .array(
      z
        .object({
          type: z.string(),
        })
        .passthrough()
    )
    .optional(),
})

/**
 * Karabiner rule schema
 */
export const KarabinerRuleSchema = z.object({
  description: z.string(),
  manipulators: z.array(KarabinerManipulatorSchema),
})

/**
 * Karabiner profile schema
 */
export const KarabinerProfileSchema = z.object({
  name: z.string(),
  rules: z.array(KarabinerRuleSchema),
})

/**
 * Karabiner configuration schema
 */
export const KarabinerConfigSchema = z.object({
  profiles: z.array(KarabinerProfileSchema),
  outputPath: z.string(),
})

/**
 * Espanso variable schema
 */
export const EspansoVariableSchema = z.object({
  name: z.string(),
  type: z.enum(['date', 'shell', 'clipboard', 'echo']),
  params: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Espanso match schema
 */
export const EspansoMatchSchema = z.object({
  trigger: z.string(),
  replace: z.string(),
  vars: z.array(EspansoVariableSchema).optional(),
  word: z.boolean().optional(),
  propagate_case: z.boolean().optional(),
  regex: z.string().optional(),
})

/**
 * Espanso configuration schema
 */
export const EspansoConfigSchema = z.object({
  matches: z.array(EspansoMatchSchema),
  outputPath: z.string(),
})

/**
 * Package manager item schema (array or object with packages/import)
 */
const PackageManagerItemSchema = z.union([
  z.array(z.string()),
  z.object({
    packages: z.array(z.string()).optional(),
    import: z.string().optional(),
  }),
])

/**
 * Package manager configuration schema
 */
export const PackageManagerConfigSchema = z.object({
  brew: PackageManagerItemSchema.optional(),
  apt: PackageManagerItemSchema.optional(),
  pacman: PackageManagerItemSchema.optional(),
  dnf: PackageManagerItemSchema.optional(),
  autoSudo: z.boolean().optional(),
})

/**
 * Hooks schema
 */
export const HooksSchema = z.object({
  beforeApply: z.function().optional(),
  afterApply: z.function().optional(),
})

/**
 * Main dotfiles configuration schema
 */
export const DotfilesConfigSchema = z.object({
  symlinks: SymlinkConfigSchema.optional(),
  env: EnvConfigSchema.optional(),
  karabiner: KarabinerConfigSchema.optional(),
  espanso: EspansoConfigSchema.optional(),
  packages: PackageManagerConfigSchema.optional(),
  hooks: HooksSchema.optional(),
})

/**
 * State file schema
 */
export const StateFileSchema = z.object({
  version: z.string(),
  lastApplied: z.string(),
  symlinks: z.array(
    z.object({
      target: z.string(),
      source: z.string(),
      createdAt: z.string(),
      checksum: z.string(),
    })
  ),
  env: z
    .object({
      exportFile: z.string(),
      injectedShells: z.array(z.string()),
    })
    .optional(),
  karabiner: z
    .object({
      outputPath: z.string(),
      lastGenerated: z.string(),
    })
    .optional(),
  espanso: z
    .object({
      outputPath: z.string(),
      lastGenerated: z.string(),
    })
    .optional(),
  packages: z
    .object({
      installed: z.array(
        z.object({
          manager: z.enum(['brew', 'apt', 'pacman', 'dnf']),
          package: z.string(),
          installedAt: z.string(),
          version: z.string().optional(),
        })
      ),
      lastSync: z.string(),
    })
    .optional(),
})
