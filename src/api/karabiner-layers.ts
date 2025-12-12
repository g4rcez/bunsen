import { karabiner } from './karabiner-helpers.ts'
import type {
  KarabinerRule,
  KeyCode,
  LayerCommand,
  KarabinerManipulator,
  WhichKey,
  SubLayers,
  HyperKeySublayer,
  To,
} from '../core/config/types.ts'

/**
 * Create sublayer variable name
 */
const createSubLayerName = (key: KeyCode) => `hyper_sublayer_${key}`

/**
 * Create WhichKey command string from LayerCommand
 */
export const createWhichCommand = (value: LayerCommand): string =>
  `${
    value?.to?.flatMap((x) => x.shell_command).join(' | ') ||
    value?.to?.flatMap((x) => x.key_code).join(' + ') ||
    value.description ||
    ''
  }`

/**
 * Check if an object is a LayerCommand (has 'to' property)
 */
const hasTo = (obj: unknown): obj is LayerCommand => {
  const toOptions = ['to', 'to_if_held_down', 'to_if_alone']
  if (typeof obj !== 'object' || obj === null) return false

  for (const option of toOptions) {
    if (option in obj) return true
  }
  return false
}

/**
 * Get object keys (helper for type-safe Object.keys)
 */
const objectKeys = <T extends object>(obj: T): Array<keyof T> => {
  return Object.keys(obj) as Array<keyof T>
}

/**
 * Create a hyper key sublayer with all its manipulators
 */
const createHyperSubLayer = (
  subLayer: KeyCode,
  commands: HyperKeySublayer,
  variables: string[],
  addWhichKey: (item: WhichKey) => void
): KarabinerManipulator[] => {
  const subLayerName = createSubLayerName(subLayer)
  const cmds = objectKeys(commands)
  const conditions = variables.filter((x) => x !== subLayerName)

  return [
    // Toggle sublayer on/off
    {
      description: `Toggle Hyper sublayer ${subLayer}`,
      type: 'basic',
      from: {
        key_code: subLayer,
        modifiers: {
          optional: ['any'],
        },
      },
      to_after_key_up: [{ set_variable: { name: subLayerName, value: 0 } }],
      to: [{ set_variable: { name: subLayerName, value: 1 } }],
      conditions: [
        ...conditions.map((subLayerVariable) => ({
          type: 'variable_if' as const,
          name: subLayerVariable,
          value: 0,
        })),
        { type: 'variable_if', name: 'hyper', value: 1 },
      ],
    },
    // Create manipulators for each command in the sublayer
    ...cmds.map((cmd): KarabinerManipulator => {
      const spread = commands[cmd]!
      addWhichKey({
        description: spread.description || '',
        command: createWhichCommand(spread),
        key: `Hyper + ${subLayer} + ${cmd as string}`,
      })
      return {
        ...spread,
        type: 'basic' as const,
        from: {
          key_code: cmd,
          modifiers: { optional: ['any'] },
        },
        conditions: [{ type: 'variable_if', name: subLayerName, value: 1 }],
      }
    }),
  ]
}

/**
 * Create hyper key sublayers from a SubLayers configuration
 */
export function createHyperSubLayers(modKeys: SubLayers): {
  layers: KarabinerRule[]
  hyper: string[]
  whichKey: WhichKey[]
} {
  const allSubLayerVariables = objectKeys(modKeys).map(createSubLayerName)
  const whichKeyMap: WhichKey[] = []

  const modSubLayers: KarabinerRule[] = Object.entries(modKeys).map(([key, value]) => {
    // If the value is a simple LayerCommand (not a sublayer)
    if (hasTo(value)) {
      whichKeyMap.push({
        key: `Hyper + ${key}`,
        command: createWhichCommand(value),
        description: value.description || `Hyper Key + ${key}`,
      })
      return {
        description: `Hyper Key + ${key}`,
        manipulators: [
          {
            ...value,
            type: 'basic' as const,
            from: {
              key_code: key as KeyCode,
              modifiers: { optional: ['any'] },
            },
            conditions: (value.conditions as any) ?? [
              {
                type: 'variable_if',
                name: 'hyper',
                value: 1,
              },
            ],
          },
        ],
      }
    }

    // Otherwise it's a sublayer
    return {
      description: `Hyper Key sublayer '${key}'`,
      manipulators: createHyperSubLayer(
        key as KeyCode,
        value as HyperKeySublayer,
        allSubLayerVariables,
        (item) => whichKeyMap.push(item)
      ),
    }
  })

  return {
    layers: modSubLayers,
    hyper: objectKeys(modKeys).map(String),
    whichKey: whichKeyMap,
  }
}

/**
 * Leader layer configuration type
 */
type KarabinerMotion = { to: To[]; description?: string } | LayerCommand

type LeaderConfig = Partial<
  Record<
    KeyCode,
    Partial<
      Record<KeyCode, KarabinerMotion> & {
        description?: string
        hold?: boolean
      }
    >
  >
>

/**
 * Create leader key layers with VIM-style modes
 */
export function createLeaderLayers(config: LeaderConfig): {
  layers: KarabinerRule[]
  whichKey: WhichKey[]
  keys: string[]
} {
  const entries = Object.entries(config)
  const whichKey: WhichKey[] = []
  const keys: string[] = []

  const allLayers = entries.reduce<KarabinerRule[]>(
    (acc, [key, { description: leaderDescription = '', hold: leaderHold = false, ...motions }]) => {
      const modal = `Layer "${key}" ${leaderDescription}` as const
      keys.push(key)

      const whichKeyModal = Object.entries(motions).map(
        ([key, motion]) => `${key}: ${motion.description || ''}`
      )

      const fromModifiers = ['any']
      if (key === key.toUpperCase()) {
        fromModifiers.push('shift')
      }

      // Leader key activation
      const leader: KarabinerRule = {
        description: `leader ${key}`,
        manipulators: [
          {
            conditions: [{ type: 'variable_if', name: 'hyper', value: 1 }],
            description: `leader_key_${key}`,
            from: {
              key_code: key as KeyCode,
              modifiers: { optional: fromModifiers },
            },
            to_if_alone: [
              karabiner.vim.on(key, leaderHold),
              karabiner.notify(`${modal}\n\n${whichKeyModal.join('\n')}`),
            ],
            to_if_held_down: [
              karabiner.vim.on(key, true),
              karabiner.notify(`Persistent mode - ${modal}\n\n${whichKeyModal.join('\n')}`),
            ],
            type: 'basic',
          },
        ],
      }

      // ESC to disable single mode
      const escDisableSingle: KarabinerRule = {
        description: `esc disable single - leader ${key}`,
        manipulators: [
          {
            description: `esc_disable_single_leader_key_${key}`,
            conditions: [
              {
                type: 'variable_if',
                name: karabiner.vim.name(key, false),
                value: karabiner.vim.value.on,
              },
              { type: 'variable_if', name: 'hyper', value: 0 },
            ],
            from: {
              key_code: 'escape',
              modifiers: {
                optional: ['any'],
                mandatory: ['any'],
              },
            },
            to: [karabiner.vim.off(key, false)],
            type: 'basic',
          },
        ],
      }

      // Disable single mode by pressing leader again
      const singleDisable: KarabinerRule = {
        description: `disable single - leader ${key}`,
        manipulators: [
          {
            conditions: [
              {
                type: 'variable_if',
                name: karabiner.vim.name(key, false),
                value: karabiner.vim.value.on,
              },
              { type: 'variable_if', name: 'hyper', value: 1 },
            ],
            description: `disable_single_leader_key_${key}`,
            from: {
              key_code: key as KeyCode,
              modifiers: { optional: ['any'] },
            },
            to: [karabiner.vim.off(key, false), karabiner.notify()],
            type: 'basic',
          },
        ],
      }

      // Disable hold mode
      const holdDisable: KarabinerRule = {
        description: `disable holder - leader ${key}`,
        manipulators: [
          {
            conditions: [
              {
                type: 'variable_if',
                name: karabiner.vim.name(key, true),
                value: karabiner.vim.value.on,
              },
              { type: 'variable_if', name: 'hyper', value: 1 },
            ],
            description: `disable_leader_key_${key}`,
            from: {
              key_code: key as KeyCode,
              modifiers: { optional: ['any'] },
            },
            to: [karabiner.vim.off(key, true), karabiner.notify()],
            type: 'basic',
          },
        ],
      }

      // Create rules for each motion in the layer
      const ownMotions = Object.entries(motions).map(([subKey, subMotion]): KarabinerRule => {
        const description = `leader + ${key} + ${subKey} - ${subMotion.description}`
        whichKey.push({
          key: `<Leader>${karabiner.replaceWhichKeys(key as KeyCode)}${karabiner.replaceWhichKeys(
            subKey as KeyCode
          )}`,
          command: createWhichCommand(subMotion),
          description: subMotion.description!,
        })
        return {
          description,
          manipulators: [
            {
              conditions: [
                {
                  type: 'variable_if',
                  name: karabiner.vim.name(key, false),
                  value: karabiner.vim.value.on,
                },
              ],
              description,
              from: { key_code: subKey as KeyCode },
              to: [...(subMotion.to || []), karabiner.vim.off(key, false), karabiner.notify()],
              type: 'basic',
            },
            {
              conditions: [
                {
                  type: 'variable_if',
                  name: karabiner.vim.name(key, true),
                  value: karabiner.vim.value.on,
                },
              ],
              description,
              from: { key_code: subKey as KeyCode },
              to: subMotion.to,
              type: 'basic',
            },
          ],
        }
      })

      return [...acc, singleDisable, escDisableSingle, holdDisable, leader, ...ownMotions]
    },
    []
  )

  return { layers: allLayers, whichKey, keys: Array.from(new Set(keys)) }
}

/**
 * Create manipulator to disable leader when hyper is released
 */
export const createLeaderDisable = (key: string, hold: boolean): KarabinerManipulator => ({
  description: `Caps Lock -> Hyper Key(${key}_single)`,
  type: 'basic',
  to_if_alone: [{ key_code: 'escape' }],
  from: {
    key_code: 'caps_lock',
    modifiers: { optional: ['any'] },
  },
  to: [{ set_variable: { name: 'hyper', value: 1 } }],
  to_after_key_up: [
    karabiner.vim.off(key, hold),
    { set_variable: { name: 'hyper', value: 0 } },
    karabiner.notify(),
  ],
  conditions: [
    {
      type: 'variable_if',
      name: karabiner.vim.off(key, hold).set_variable.name,
      value: 'on',
    },
  ],
})
