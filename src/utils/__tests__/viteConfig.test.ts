import type { UserConfig } from 'vite'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_OPTIONS } from '../../types'
import { applyGasViteConfig, logDetectedFiles } from '../viteConfig'

describe('vite-config', () => {
	it('should apply GAS Vite configuration correctly', () => {
		const config: UserConfig = {}
		const entryFiles = {
			'src/main': 'src/main.ts',
			'src/utils/helper': 'src/utils/helper.ts',
		}
		const outputDir = 'dist'

		applyGasViteConfig(config, entryFiles, outputDir, DEFAULT_OPTIONS)

		expect(config.build).toBeDefined()
		expect(config.build?.rollupOptions?.input).toEqual(entryFiles)
		expect(config.build?.rollupOptions?.output).toMatchObject({
			entryFileNames: '[name].js',
			format: 'es',
		})
		expect(config.build?.lib).toBe(false)
		expect(config.build?.outDir).toBe(outputDir)
		expect(config.build?.minify).toBe(false)
		expect(config.build?.target).toBe('es5')
		expect(config.build?.rollupOptions?.treeshake).toBe(false)
	})

	it('should preserve existing build configuration', () => {
		const config: UserConfig = {
			build: {
				sourcemap: true,
				rollupOptions: {
					external: ['some-external'],
				},
			},
		}
		const entryFiles = { main: 'main.ts' }
		const outputDir = 'build'

		applyGasViteConfig(config, entryFiles, outputDir, DEFAULT_OPTIONS)

		expect(config.build?.sourcemap).toBe(false) // Sourcemap is disabled for GAS
		expect(config.build?.rollupOptions?.external).toEqual(expect.any(Function)) // External dependencies are internalized using function form
		expect(config.build?.rollupOptions?.input).toEqual(entryFiles)
	})

	it('should handle empty entry files', () => {
		const config: UserConfig = {}
		const entryFiles = {}
		const outputDir = 'dist'

		applyGasViteConfig(config, entryFiles, outputDir, DEFAULT_OPTIONS)

		expect(config.build?.rollupOptions?.input).toEqual({})
		expect(config.build?.outDir).toBe(outputDir)
	})

	it('should log detected files correctly', () => {
		// Mock console.log
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

		const entryFiles = {
			'src/main': 'src/main.ts',
			'lib/config': 'lib/config.ts',
		}

		logDetectedFiles(entryFiles)

		expect(consoleSpy).toHaveBeenCalledWith(
			'\x1b[32m[vite-plugin-gas]\x1b[0m \x1b[32m✅ Auto-detected 2 TypeScript files\x1b[0m'
		)
		// Note: individual file listings are now logged with logger.verbose, which doesn't output in test environment

		consoleSpy.mockRestore()
	})

	it('should log empty files correctly', () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

		const entryFiles = {}

		logDetectedFiles(entryFiles)

		expect(consoleSpy).toHaveBeenCalledWith(
			'\x1b[32m[vite-plugin-gas]\x1b[0m \x1b[32m✅ Auto-detected 0 TypeScript files\x1b[0m'
		)

		consoleSpy.mockRestore()
	})

	it('should handle empty or whitespace-only TypeScript files', () => {
		const config: UserConfig = {}
		const entryFiles = {
			'src/empty': 'src/empty.ts',
			'src/whitespace': 'src/whitespace.ts',
		}
		const outputDir = 'dist'

		applyGasViteConfig(config, entryFiles, outputDir, DEFAULT_OPTIONS)

		// Empty files should still be processed normally
		expect(config.build?.rollupOptions?.input).toEqual(entryFiles)
		expect(config.build?.rollupOptions?.output).toMatchObject({
			entryFileNames: '[name].js',
			format: 'es',
		})
		expect(config.build?.outDir).toBe(outputDir)
	})

	it('should configure path aliases correctly', () => {
		const config: UserConfig = {}
		const entryFiles = { main: 'main.ts' }
		const outputDir = 'dist'

		applyGasViteConfig(config, entryFiles, outputDir, DEFAULT_OPTIONS)

		expect(config.resolve?.alias).toBeDefined()
		const aliases = config.resolve?.alias as Record<string, string>
		expect(aliases['@']).toContain('src')
		expect(aliases['~']).toContain('src')
	})

	it('should respect existing path aliases', () => {
		const config: UserConfig = {
			resolve: {
				alias: {
					'@custom': './custom',
				},
			},
		}
		const entryFiles = { main: 'main.ts' }
		const outputDir = 'dist'

		applyGasViteConfig(config, entryFiles, outputDir, DEFAULT_OPTIONS)

		const aliases = config.resolve?.alias as Record<string, string>
		expect(aliases['@custom']).toBe('./custom') // Existing settings are preserved
		expect(aliases['@']).toBeDefined() // New settings are added
	})

	it('should disable path aliases when option is false', () => {
		const config: UserConfig = {}
		const entryFiles = { main: 'main.ts' }
		const outputDir = 'dist'
		const options = { ...DEFAULT_OPTIONS, enablePathAliases: false }

		applyGasViteConfig(config, entryFiles, outputDir, options)

		// Verify that path aliases are not set
		expect(config.resolve?.alias).toBeUndefined()
	})

	it('should disable auto-detection when option is false', () => {
		const config: UserConfig = {}
		const entryFiles = { main: 'main.ts' }
		const outputDir = 'dist'
		const options = {
			...DEFAULT_OPTIONS,
			enablePathAliases: true,
			autoDetectPathAliases: false,
		}

		applyGasViteConfig(config, entryFiles, outputDir, options)

		const aliases = config.resolve?.alias as Record<string, string>
		expect(aliases['@']).toBeDefined() // Default settings are applied
		expect(aliases['~']).toBeDefined() // Default settings are applied
	})
})
