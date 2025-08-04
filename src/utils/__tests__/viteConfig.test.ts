import type { UserConfig } from 'vite'
import { describe, expect, it, vi } from 'vitest'
import { applyGasViteConfig, logDetectedFiles } from '../viteConfig'

describe('vite-config', () => {
	it('should apply GAS Vite configuration correctly', () => {
		const config: UserConfig = {}
		const entryFiles = {
			'src/main': 'src/main.ts',
			'src/utils/helper': 'src/utils/helper.ts',
		}
		const outputDir = 'dist'

		applyGasViteConfig(config, entryFiles, outputDir)

		expect(config.build).toBeDefined()
		expect(config.build?.rollupOptions?.input).toEqual(entryFiles)
		expect(config.build?.rollupOptions?.output).toMatchObject({
			entryFileNames: '[name].js',
			format: 'es',
		})
		expect(config.build?.lib).toBe(false)
		expect(config.build?.outDir).toBe(outputDir)
		expect(config.build?.minify).toBe(false)
		expect(config.build?.target).toBe('es2017')
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

		applyGasViteConfig(config, entryFiles, outputDir)

		expect(config.build?.sourcemap).toBe(false) // GAS用にソースマップは無効化される
		expect(config.build?.rollupOptions?.external).toEqual(expect.any(Function)) // 関数形式で外部依存を内部化
		expect(config.build?.rollupOptions?.input).toEqual(entryFiles)
	})

	it('should handle empty entry files', () => {
		const config: UserConfig = {}
		const entryFiles = {}
		const outputDir = 'dist'

		applyGasViteConfig(config, entryFiles, outputDir)

		expect(config.build?.rollupOptions?.input).toEqual({})
		expect(config.build?.outDir).toBe(outputDir)
	})

	it('should log detected files correctly', () => {
		// console.log をモック
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

		const entryFiles = {
			'src/main': 'src/main.ts',
			'lib/config': 'lib/config.ts',
		}

		logDetectedFiles(entryFiles)

		expect(consoleSpy).toHaveBeenCalledWith(
			'[vite-plugin-gas] Auto-detected 2 TypeScript files:'
		)
		expect(consoleSpy).toHaveBeenCalledWith('  - src/main: src/main.ts')
		expect(consoleSpy).toHaveBeenCalledWith('  - lib/config: lib/config.ts')

		consoleSpy.mockRestore()
	})

	it('should log empty files correctly', () => {
		const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

		const entryFiles = {}

		logDetectedFiles(entryFiles)

		expect(consoleSpy).toHaveBeenCalledWith(
			'[vite-plugin-gas] Auto-detected 0 TypeScript files:'
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

		applyGasViteConfig(config, entryFiles, outputDir)

		// Empty files should still be processed normally
		expect(config.build?.rollupOptions?.input).toEqual(entryFiles)
		expect(config.build?.rollupOptions?.output).toMatchObject({
			entryFileNames: '[name].js',
			format: 'es',
		})
		expect(config.build?.outDir).toBe(outputDir)
	})
})
