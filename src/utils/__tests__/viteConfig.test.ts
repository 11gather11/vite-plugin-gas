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
		expect(config.build?.target).toBe('es2017')
		expect(config.build?.rollupOptions?.treeshake).toBe(false)
	})

	it('should configure esbuild for comment preservation when enabled', () => {
		const config: UserConfig = {}
		const entryFiles = { 'src/main': 'src/main.ts' }
		const outputDir = 'dist'
		const options = {
			...DEFAULT_OPTIONS,
			preserveComments: true,
		}

		applyGasViteConfig(config, entryFiles, outputDir, options)

		expect(config.esbuild).toBeDefined()
		// biome-ignore lint/suspicious/noExplicitAny: テスト用の型アサーション
		const esbuildOptions = config.esbuild as any
		expect(esbuildOptions?.legalComments).toBe('inline')
		expect(esbuildOptions?.minifyWhitespace).toBe(false)
		expect(esbuildOptions?.minifyIdentifiers).toBe(false)
		expect(esbuildOptions?.minifySyntax).toBe(false)
		expect(esbuildOptions?.keepNames).toBe(true)
		expect(esbuildOptions?.tsconfigRaw).toEqual({
			compilerOptions: {
				removeComments: false,
			},
		})
	})

	it('should not configure comment preservation when disabled', () => {
		const config: UserConfig = {}
		const entryFiles = { 'src/main': 'src/main.ts' }
		const outputDir = 'dist'
		const options = {
			...DEFAULT_OPTIONS,
			preserveComments: false,
		}

		applyGasViteConfig(config, entryFiles, outputDir, options)

		expect(config.esbuild).toBeDefined()
		// biome-ignore lint/suspicious/noExplicitAny: テスト用の型アサーション
		const esbuildOptions = config.esbuild as any
		expect(esbuildOptions?.legalComments).toBeUndefined()
		expect(esbuildOptions?.minifyWhitespace).toBeUndefined()
		expect(esbuildOptions?.minifyIdentifiers).toBeUndefined()
		expect(esbuildOptions?.minifySyntax).toBeUndefined()
		expect(esbuildOptions?.keepNames).toBe(true)
		expect(esbuildOptions?.tsconfigRaw).toBeUndefined()
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

		expect(config.build?.sourcemap).toBe(false) // GAS用にソースマップは無効化される
		expect(config.build?.rollupOptions?.external).toEqual(expect.any(Function)) // 関数形式で外部依存を内部化
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
		expect(aliases['@custom']).toBe('./custom') // 既存設定は保持
		expect(aliases['@']).toBeDefined() // 新しい設定は追加
	})

	it('should disable path aliases when option is false', () => {
		const config: UserConfig = {}
		const entryFiles = { main: 'main.ts' }
		const outputDir = 'dist'
		const options = { ...DEFAULT_OPTIONS, enablePathAliases: false }

		applyGasViteConfig(config, entryFiles, outputDir, options)

		// パスエイリアスが設定されていないことを確認
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
		expect(aliases['@']).toBeDefined() // デフォルト設定は適用される
		expect(aliases['~']).toBeDefined() // デフォルト設定は適用される
	})
})
