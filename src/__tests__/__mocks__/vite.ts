/**
 * Vite Plugin Context Mock
 * Consolidate the duplicate `createMockContext` currently used in transform.test.ts
 */
import { vi } from 'vitest'

export function createMockViteContext() {
	return {
		// Minimal Vite plugin context
		resolve: vi.fn(),
		load: vi.fn(),
		transform: vi.fn(),
		generateBundle: vi.fn(),
		writeBundle: vi.fn(),
		// Add additional properties here as needed
	}
}

/**
 * Mock for Vite configuration
 */
export function createMockViteConfig(overrides = {}) {
	return {
		root: process.cwd(),
		resolve: {
			alias: {},
		},
		build: {
			outDir: 'dist',
			rollupOptions: {
				input: {},
			},
		},
		...overrides,
	}
}
