import type {
  EspansoConfig,
  EspansoBuilderMatch,
  EspansoVariable,
} from '../core/config/types.ts'

/**
 * Espanso builder helper methods
 */
export interface EspansoBuilder<Prefix extends string> {
  trigger: Prefix
  snippets: string
  insert: (key: string, syntax: string, label: string) => EspansoBuilderMatch
  random: (key: string, choices: string[], label: string) => EspansoBuilderMatch
  form: (key: string, replace: string, cmd: string, label: string) => EspansoBuilderMatch
  clipboard: (key: string, name: string, syntax: string, label: string) => EspansoBuilderMatch
  format: (key: string, type: 'date' | 'shell', format: string, label: string) => EspansoBuilderMatch
  shell: (key: string, label: string, cmd: string, capture?: string) => EspansoBuilderMatch
}

/**
 * Espanso config input for builder
 */
export interface EspansoConfigInput<Prefix extends string> {
  trigger: Prefix
  snippets: string
  imports?: string[]
}

/**
 * Creates an Espanso configuration with a fluent builder API
 *
 * @example
 * ```ts
 * const config = createEspansoConfig(
 *   { trigger: '::', snippets: '~/.config/espanso/match/base.yml' },
 *   (e) => ({
 *     matches: [
 *       e.insert('date', '{{date}}', 'Current date'),
 *       e.shell('uuid', 'Generate UUID', 'uuidgen'),
 *       e.random('greeting', ['Hello', 'Hi', 'Hey'], 'Random greeting'),
 *     ],
 *   })
 * )
 * ```
 */
export function createEspansoConfig<Prefix extends string>(
  config: EspansoConfigInput<Prefix>,
  builder: (helpers: EspansoBuilder<Prefix>) => {
    matches: EspansoBuilderMatch[]
    imports?: string[]
  }
): EspansoConfig {
  const triggerPrefix = config.trigger

  // Helper to create trigger with prefix
  const makeTrigger = (key: string | string[]): string | string[] => {
    if (Array.isArray(key)) {
      return key.map((k) => `${triggerPrefix}${k}`)
    }
    return `${triggerPrefix}${key}`
  }

  // Helper to get first key if array
  const getTriggerKey = (key: string | string[]): string => {
    return Array.isArray(key) ? key[0] : key
  }

  const helpers: EspansoBuilder<Prefix> = {
    trigger: config.trigger,
    snippets: config.snippets,

    insert: (key, syntax, label): EspansoBuilderMatch => ({
      trigger: makeTrigger(key),
      replace: syntax,
      label,
    }),

    random: (key, choices, label): EspansoBuilderMatch => ({
      trigger: makeTrigger(key),
      replace: `{{${getTriggerKey(key)}}}`,
      label,
      vars: [
        {
          name: getTriggerKey(key),
          type: 'random',
          params: { choices },
        },
      ],
    }),

    form: (key, replace, cmd, label): EspansoBuilderMatch => ({
      trigger: makeTrigger(key),
      replace,
      label,
      vars: [
        {
          name: 'form',
          type: 'form',
          params: { layout: '[[input]]' },
        },
        {
          name: getTriggerKey(key),
          type: 'shell',
          params: { cmd },
        },
      ],
    }),

    clipboard: (key, name, syntax, label): EspansoBuilderMatch => ({
      trigger: makeTrigger(key),
      replace: syntax,
      label,
      vars: [
        {
          name,
          type: 'clipboard',
        },
      ],
    }),

    format: (key, type, format, label): EspansoBuilderMatch => ({
      trigger: makeTrigger(key),
      replace: `{{${getTriggerKey(key)}}}`,
      label,
      vars: [
        {
          name: getTriggerKey(key),
          type,
          params: { format },
        },
      ],
    }),

    shell: (key, label, cmd, capture): EspansoBuilderMatch => {
      const result: EspansoBuilderMatch = {
        replace: `{{${getTriggerKey(key)}}}`,
        label,
        vars: [
          {
            name: 'clipboard',
            type: 'clipboard',
          },
          {
            name: getTriggerKey(key),
            type: 'shell',
            params: { cmd },
          },
        ],
      }

      if (capture) {
        result.regex = makeTrigger(capture) as string
      } else {
        result.trigger = makeTrigger(key)
      }

      return result
    },
  }

  const result = builder(helpers)

  return {
    matches: result.matches,
    imports: result.imports || config.imports || [],
    outputPath: config.snippets,
  }
}

/**
 * Simple wrapper for Espanso config (for backwards compatibility)
 */
export function espanso(config: EspansoConfig): EspansoConfig {
  return config
}

/**
 * Helper to create a simple text replacement
 */
export function textReplacement(trigger: string, replace: string, label?: string): EspansoBuilderMatch {
  return { trigger, replace, label }
}

/**
 * Helper to create a date replacement
 */
export function dateReplacement(
  trigger: string,
  format: string = '%Y-%m-%d',
  label?: string
): EspansoBuilderMatch {
  return {
    trigger,
    replace: '{{date}}',
    label,
    vars: [
      {
        name: 'date',
        type: 'date',
        params: { format },
      },
    ],
  }
}

/**
 * Helper to create a shell command replacement
 */
export function shellReplacement(trigger: string, command: string, label?: string): EspansoBuilderMatch {
  return {
    trigger,
    replace: '{{output}}',
    label,
    vars: [
      {
        name: 'output',
        type: 'shell',
        params: { cmd: command },
      },
    ],
  }
}
