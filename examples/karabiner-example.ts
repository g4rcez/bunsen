/**
 * Karabiner Configuration Example
 *
 * This example demonstrates how to use the Karabiner API
 * with helper functions, hyper sublayers, and WhichKey documentation.
 */

import { defineConfig, karabiner, createHyperSubLayers, createKarabinerConfig } from '../src/api/index.ts'

// Create hyper key sublayers with helper functions
const hyperLayers = createHyperSubLayers({
  // Simple app launchers
  t: karabiner.app('WezTerm'),
  b: karabiner.browser('Default', 'Open Chrome default profile'),
  v: karabiner.app('Visual Studio Code'),
  s: karabiner.app('Slack'),

  // Window management sublayer (Hyper + w + ...)
  w: {
    h: karabiner.rectangle('left-half'),
    l: karabiner.rectangle('right-half'),
    k: karabiner.rectangle('top-half'),
    j: karabiner.rectangle('bottom-half'),
    f: karabiner.rectangle('maximize'),
    c: karabiner.rectangle('center'),
  },

  // Aerospace window manager (Hyper + a + ...)
  a: {
    h: karabiner.aerospace('focus left'),
    j: karabiner.aerospace('focus down'),
    k: karabiner.aerospace('focus up'),
    l: karabiner.aerospace('focus right'),
    '1': karabiner.aerospace('workspace 1'),
    '2': karabiner.aerospace('workspace 2'),
    '3': karabiner.aerospace('workspace 3'),
  },

  // Custom shell commands (Hyper + c + ...)
  c: {
    r: karabiner.shell('open -a "Activity Monitor.app"', 'Open Activity Monitor'),
    t: karabiner.shell('open -a "Terminal.app" ~', 'Open Terminal in home'),
  },
})

// Create the complete Karabiner configuration
const karabinerSetup = createKarabinerConfig(
  hyperLayers.whichKey,
  hyperLayers.layers,
  // Add custom rules here if needed
  {
    description: 'Caps Lock to Hyper Key',
    manipulators: [
      {
        type: 'basic',
        from: { key_code: 'caps_lock' },
        to: [
          {
            key_code: 'left_shift',
            modifiers: ['left_control', 'left_option', 'left_command'],
          },
        ],
        to_if_alone: [{ key_code: 'escape' }],
      },
    ],
  }
)

export default defineConfig({
  karabiner: {
    profiles: [
      {
        name: 'Default',
        rules: karabinerSetup.map,
      },
    ],
    outputPath: '~/.config/karabiner/karabiner.json',
    whichKeyPath: '~/.config/karabiner/whichkey.json',
    whichKeys: karabinerSetup.whichKey,
  },
})
