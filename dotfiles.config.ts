import { defineConfig } from './src/api/index.ts'

export default defineConfig({
  symlinks: {
    '~/.zshrc': '~/dotfiles/zsh/.zshrc',
    '~/.config/nvim': '~/dotfiles/nvim',
  },
  env: {
    shells: ['zsh'],
    exportFile: '~/.config/bunsen/env.sh',
    variables: {
      EDITOR: 'nvim',
      VISUAL: 'nvim',
    },
  },
})

