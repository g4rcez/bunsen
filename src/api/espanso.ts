import type { EspansoConfig, EspansoMatch } from '../core/config/types.ts'

export function espanso(config: EspansoConfig): EspansoConfig {
  return config
}

export function textReplacement(trigger: string, replace: string): EspansoMatch {
  return { trigger, replace }
}

export function dateReplacement(trigger: string, format: string = '%Y-%m-%d'): EspansoMatch {
  return {
    trigger,
    replace: '{{date}}',
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
export function shellReplacement(trigger: string, command: string): EspansoMatch {
  return {
    trigger,
    replace: '{{output}}',
    vars: [
      {
        name: 'output',
        type: 'shell',
        params: { cmd: command },
      },
    ],
  }
}
