import type { KarabinerConfig } from '../core/config/types.ts'

export function karabiner(config: KarabinerConfig): KarabinerConfig {
  return config
}

export function mapKey(from: string, to: string) {
  return {
    type: 'basic' as const,
    from: { key_code: from },
    to: [{ key_code: to }],
  }
}

export function hyperKey(key: string, toIfAlone?: string) {
  return {
    type: 'basic' as const,
    from: { key_code: key },
    to: [
      {
        key_code: 'left_shift',
        modifiers: ['left_control', 'left_option', 'left_command'],
      },
    ],
    to_if_alone: toIfAlone ? [{ key_code: toIfAlone }] : undefined,
  }
}
