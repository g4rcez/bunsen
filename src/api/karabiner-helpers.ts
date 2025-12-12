import type { LayerCommand, RectangleActions, KeyCode } from '../core/config/types.ts'

/**
 * Open a file or application
 */
const open = (what: string, params: string = '', description: string = ''): LayerCommand => ({
  to: [{ shell_command: `open ${params} ${what}` }],
  description: description || `Open ${what}`,
})

/**
 * Run a shell command
 */
const shell = (cmd: string, description: string = ''): LayerCommand => ({
  description,
  to: [{ shell_command: cmd }],
})

/**
 * Browser name constant
 */
export const BROWSER = 'Google Chrome'

/**
 * Open a browser with specific profile
 */
const browser = (
  profile: 'Profile 1' | 'Default',
  description: string,
  append: string = '-n'
): LayerCommand => ({
  description: description || `Open ${BROWSER} ${profile}`,
  to: [
    {
      shell_command: `open ${append} -a '${BROWSER}.app' --args --profile-directory='${profile}'`,
    },
  ],
})

/**
 * Execute Aerospace window manager command
 */
const aerospace = (command: string): LayerCommand => ({
  to: [{ shell_command: `/opt/homebrew/bin/aerospace ${command}` }],
  description: `Window: ${command}`,
})

/**
 * Execute Rectangle window action
 */
const rectangle = (name: RectangleActions): LayerCommand => ({
  description: `Window: ${name}`,
  to: [
    {
      shell_command: `open -g rectangle-pro://execute-action?name=${name}`,
    },
  ],
})

/**
 * Open an application
 */
const app = (name: string): LayerCommand => open(`-a '${name}.app'`, '', `Open ${name}`)

/**
 * Open a new instance of an application
 */
const appInstance = (name: string): LayerCommand => open(`-n -a '${name}.app'`, '', `Open ${name}`)

/**
 * VIM mode utilities
 */
const vim = {
  value: { on: 'on' as const, off: 'off' as const },
  name: (leader: string, hold: boolean) => `VIM_MODE_${leader}_${hold ? 'HOLD' : 'SINGLE'}` as const,
  on: (leader: string, hold: boolean) => ({
    halt: true,
    set_variable: {
      name: `VIM_MODE_${leader}_${hold ? 'HOLD' : 'SINGLE'}`,
      value: 'on' as const,
    },
  }),
  off: (leader: string, hold: boolean) => ({
    halt: true,
    set_variable: {
      name: `VIM_MODE_${leader}_${hold ? 'HOLD' : 'SINGLE'}`,
      value: 'off' as const,
    },
  }),
}

/**
 * Show notification message
 */
const notify = (text: string = '', enabled = true) => ({
  set_notification_message: { id: 'dev.garcez.vim_mode', text: enabled ? text : '' },
})

/**
 * Replace WhichKey key codes with readable names
 */
const replaceWhichKeys = (str: KeyCode): string => {
  const trimmed = str.trim() as KeyCode
  if (trimmed === 'return' || trimmed === 'return_or_enter') return 'ENTER'
  if (trimmed === 'equal_sign') return '='
  if (trimmed === 'hyphen') return '-'
  if (trimmed === 'backslash') return '\\'
  return trimmed
}

/**
 * Karabiner helper utilities object
 */
export const karabiner = {
  app,
  vim,
  open,
  shell,
  BROWSER,
  browser,
  aerospace,
  rectangle,
  appInstance,
  replaceWhichKeys,
  notify,
}
