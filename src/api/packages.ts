/**
 * Package manager API - Type-safe helpers for package configuration
 */

import type { PackageManagerConfig } from '../core/config/types.ts'

/**
 * Helper to define package manager configuration
 */
export function packages(config: PackageManagerConfig): PackageManagerConfig {
  return config
}

/**
 * Helper to import packages from a file
 */
export function importFrom(filePath: string): { import: string } {
  return { import: filePath }
}

/**
 * Helper to define inline packages
 */
export function inlinePackages(...packages: string[]): string[] {
  return packages
}
