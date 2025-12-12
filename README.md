# Bunsen

> **BUN**dle **SE**ttings **N**ow - Like Dr. Bunsen Honeydew from the Muppets, this tool brings scientific precision to your dotfiles management! 🧪
>
> And yes, it's powered by [Bun](https://bun.sh) - because when you're naming a tool after a Muppet scientist, you might as well run it on the fastest runtime that shares part of his name! ⚡

A NixOS flake-inspired dotfiles manager built with TypeScript.

## Features

- **Declarative Configuration** - Define your entire dotfiles setup in a single `dotfiles.config.ts` file
- **Symlink Management** - GNU stow-like functionality with conflict detection and backup
- **Karabiner Integration** - Generate Karabiner keyboard configurations with TypeScript
- **Espanso Integration** - Create Espanso text expansion configs declaratively
- **Environment Variables** - Manage env vars and inject them into shell configs
- **Type-Safe** - Full TypeScript support with autocomplete and validation
- **Native TypeScript** - Uses Bun's native TypeScript support (no transpilation needed)

## Requirements

- Bun v1.0.0 or higher

## Installation

```bash
bun install -g bunsen
```

Or use locally in your dotfiles repository:

```bash
bun install bunsen
```

## Quick Start

### 1. Initialize Configuration

```bash
bunsen init
```

This creates a `dotfiles.config.ts` file in your current directory.

### 2. Edit Configuration

```typescript
import { defineConfig, karabiner, espanso } from 'bunsen'

export default defineConfig({
  symlinks: {
    '~/.zshrc': '~/dotfiles/zsh/.zshrc',
    '~/.config/nvim': '~/dotfiles/nvim',
  },

  env: {
    variables: {
      EDITOR: 'nvim',
      PATH: ['$HOME/.local/bin', '$PATH'],
    },
    shells: ['zsh', 'bash'],
  },

  karabiner: karabiner({
    profiles: [{
      name: 'Default',
      rules: [{
        description: 'Caps Lock to Escape',
        manipulators: [{
          type: 'basic',
          from: { key_code: 'caps_lock' },
          to: [{ key_code: 'escape' }],
        }],
      }],
    }],
    outputPath: '~/.config/karabiner/karabiner.json',
  }),

  espanso: espanso({
    matches: [
      { trigger: ':shrug', replace: '¯\\_(ツ)_/¯' },
      { trigger: ':email', replace: 'your.email@example.com' },
    ],
    outputPath: '~/.config/espanso/match/base.yml',
  }),
})
```

### 3. Apply Configuration

```bash
# Preview changes
bunsen apply --dry-run

# Apply all
bunsen apply

# Apply specific parts
bunsen apply --symlinks-only
bunsen apply --env-only
```

## Development

Bunsen runs TypeScript directly using Bun's native support:

```bash
# Clone the repository
git clone <repo-url>
cd bunsen

# Install dependencies
bun install

# Run directly from TypeScript source
bun run bunsen -- --help
bun run bunsen -- init
bun run bunsen -- apply --dry-run

# Or use the wrapper script
./bunsen --help
```

Bun executes TypeScript natively - no build step required at any stage.

### 4. Check Status

```bash
bunsen status
```

## Commands

### `bunsen init`

Creates a new `dotfiles.config.ts` template.

**Options:**
- `-f, --force` - Overwrite existing configuration

### `bunsen validate`

Validates your configuration file.

**Options:**
- `-c, --config <path>` - Path to config file

### `bunsen apply`

Applies your dotfiles configuration.

**Options:**
- `-c, --config <path>` - Path to config file
- `--dry-run` - Preview changes without applying
- `-f, --force` - Skip confirmation prompts
- `--symlinks-only` - Only apply symlinks
- `--env-only` - Only apply environment variables
- `--karabiner-only` - Only apply Karabiner configuration
- `--espanso-only` - Only apply Espanso configuration
- `-v, --verbose` - Enable verbose logging

### `bunsen status`

Shows the current state of your dotfiles.

## Configuration

### Symlinks

Simple mapping:
```typescript
symlinks: {
  '~/.zshrc': '~/dotfiles/zsh/.zshrc',
  '~/.config/nvim': '~/dotfiles/nvim',
}
```

Advanced options:
```typescript
symlinks: {
  '~/.ssh/config': {
    source: '~/dotfiles/ssh/config',
    backup: true,        // Create backup if exists
    force: false,        // Require confirmation
    createDirs: true,    // Create parent directories
  },
}
```

### Environment Variables

```typescript
env: {
  variables: {
    EDITOR: 'nvim',
    VISUAL: 'nvim',
    // Control PATH order with $PATH token
    PATH: ['$HOME/.local/bin', '$PATH', '$HOME/.cargo/bin'],
  },
  shells: ['zsh', 'bash', 'fish'],
  exportFile: '~/.config/bunsen/env.sh',
}
```

The generated file is automatically sourced in your shell configs using markers:
```bash
# BEGIN BUNSEN
source ~/.config/bunsen/env.sh
# END BUNSEN
```

### Karabiner

```typescript
karabiner: karabiner({
  profiles: [{
    name: 'Default',
    rules: [{
      description: 'Caps Lock to Escape when pressed alone, Hyper when held',
      manipulators: [{
        type: 'basic',
        from: { key_code: 'caps_lock' },
        to: [{
          key_code: 'left_shift',
          modifiers: ['left_control', 'left_option', 'left_command'],
        }],
        to_if_alone: [{ key_code: 'escape' }],
      }],
    }],
  }],
  outputPath: '~/.config/karabiner/karabiner.json',
})
```

### Espanso

```typescript
espanso: espanso({
  matches: [
    // Simple replacement
    { trigger: ':shrug', replace: '¯\\_(ツ)_/¯' },

    // With variables
    {
      trigger: ':date',
      replace: '{{date}}',
      vars: [{
        name: 'date',
        type: 'date',
        params: { format: '%Y-%m-%d' },
      }],
    },
  ],
  outputPath: '~/.config/espanso/match/base.yml',
})
```

### Lifecycle Hooks

```typescript
hooks: {
  beforeApply: async () => {
    console.log('Running pre-apply checks...')
  },
  afterApply: async () => {
    console.log('Done! Remember to restart your shell.')
  },
}
```

## How It Works

### Configuration Loading

Bunsen uses Bun's native TypeScript support to load your `dotfiles.config.ts` file directly without any transpilation. The configuration is validated against Zod schemas to ensure type safety.

### State Tracking

All operations are tracked in `~/.config/bunsen/state.json`. This enables:
- Status checking
- Conflict detection
- Idempotent operations (safe to run multiple times)
- Future rollback capabilities

### Conflict Resolution

When a symlink target already exists:
1. **Backup (default)** - Creates `.backup.{timestamp}` file
2. **Overwrite** - Removes existing file (with `--force` flag)
3. **Skip** - Leaves existing file unchanged

## Examples

See the [examples](./examples) directory for complete configuration examples.

## Development Commands

```bash
# Run directly from TypeScript
bun run bunsen -- <command>
bun start -- <command>

# Run tests
bun test

# Run tests with coverage
bun test --coverage

# Type check
bun run typecheck

# Format
bun run format
```

## Architecture

- **Bun Runtime** - Native TypeScript execution with zero compilation overhead
- **Config Loader** - Dynamically imports user's `dotfiles.config.ts` with validation
- **Symlink Manager** - Handles creation, conflict detection, and state tracking
- **Generators** - Transform TypeScript configs to target formats (JSON, YAML, shell scripts)
- **State Tracker** - Maintains operation history for status and rollback

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.

## Inspiration

Bunsen is inspired by NixOS's declarative configuration approach, bringing similar concepts to dotfiles management with the flexibility of TypeScript.

## License

MIT
