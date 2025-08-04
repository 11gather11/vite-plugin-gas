import type { PathLike } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { sampleTsConfig } from '../__fixtures__/sampleData'
import {
	autoDetectPathAliases,
	detectCommonPathAliases,
	detectExistingPathAliases,
	detectPathAliasesFromTsConfig,
} from '../pathAliasDetector'

// ファイルシステムをモック
vi.mock('node:fs', () => ({
	readFileSync: vi.fn(),
	existsSync: vi.fn(),
}))

describe('pathAliasDetector', () => {
	describe('detectPathAliasesFromTsConfig', () => {
		it('should detect path aliases from tsconfig.json', async () => {
			const { readFileSync } = await import('node:fs')
			const mockReadFileSync = vi.mocked(readFileSync)

			mockReadFileSync.mockReturnValue(JSON.stringify(sampleTsConfig))

			const result = detectPathAliasesFromTsConfig()

			expect(result).toEqual({
				'@': './src',
				'@components': './src/components',
				'@utils': './src/utils',
				'~': './src',
			})
		})

		it('should handle tsconfig.json with comments', async () => {
			const { readFileSync } = await import('node:fs')
			const mockReadFileSync = vi.mocked(readFileSync)

			const mockTsConfigWithComments = `{
				// TypeScript configuration
				"compilerOptions": {
					"baseUrl": ".",
					/* Path mappings */
					"paths": {
						"@/*": ["src/*"]
					}
				}
			}`

			mockReadFileSync.mockReturnValue(mockTsConfigWithComments)

			const result = detectPathAliasesFromTsConfig()

			expect(result).toEqual({
				'@': './src',
			})
		})

		it('should handle missing tsconfig.json gracefully', async () => {
			const { readFileSync } = await import('node:fs')
			const mockReadFileSync = vi.mocked(readFileSync)

			mockReadFileSync.mockImplementation(() => {
				throw new Error('File not found')
			})

			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			const result = detectPathAliasesFromTsConfig()

			expect(result).toEqual({})
			expect(consoleSpy).toHaveBeenCalledWith(
				'[vite-plugin-gas] Could not read tsconfig.json for path aliases:',
				expect.any(Error)
			)

			consoleSpy.mockRestore()
		})

		it('should handle baseUrl correctly', async () => {
			const { readFileSync } = await import('node:fs')
			const mockReadFileSync = vi.mocked(readFileSync)

			const mockTsConfig = JSON.stringify({
				compilerOptions: {
					baseUrl: 'src',
					paths: {
						'@/*': ['*'], // src/* になる
						'@lib/*': ['lib/*'], // src/lib/* になる
					},
				},
			})

			mockReadFileSync.mockReturnValue(mockTsConfig)

			const result = detectPathAliasesFromTsConfig()

			expect(result).toEqual({
				'@': './src',
				'@lib': './src/lib',
			})
		})
	})

	describe('detectExistingPathAliases', () => {
		it('should detect existing path aliases from Vite config', () => {
			const config = {
				resolve: {
					alias: {
						'@': './src',
						'~': './app',
					},
				},
			}

			const result = detectExistingPathAliases(config)

			expect(result).toEqual({
				'@': './src',
				'~': './app',
			})
		})

		it('should handle config without resolve.alias', () => {
			const config = {}

			const result = detectExistingPathAliases(config)

			expect(result).toEqual({})
		})

		it('should handle invalid config gracefully', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			// null config should not throw
			const result = detectExistingPathAliases({})

			expect(result).toEqual({})

			consoleSpy.mockRestore()
		})
	})

	describe('detectCommonPathAliases', () => {
		it('should detect common path patterns', async () => {
			const fs = await import('node:fs')
			const mockExistsSync = vi.mocked(fs.existsSync)

			// src ディレクトリが存在する場合
			mockExistsSync.mockImplementation((path: PathLike) => {
				return path.toString().includes('src')
			})

			const result = detectCommonPathAliases()

			expect(result['@']).toBe('./src')
			expect(result['~']).toBe('./src')
		})

		it('should fallback to app directory if src does not exist', async () => {
			const fs = await import('node:fs')
			const mockExistsSync = vi.mocked(fs.existsSync)

			// app ディレクトリのみ存在する場合
			mockExistsSync.mockImplementation((path: PathLike) => {
				const pathStr = path.toString()
				// srcを含むパスは存在しない、appを含むパスは存在する
				if (pathStr.includes('src')) return false
				return pathStr.includes('app')
			})

			const result = detectCommonPathAliases()

			expect(result['@']).toBe('./app')
			expect(result['~']).toBe('./app')
		})
	})

	describe('autoDetectPathAliases', () => {
		it('should combine detection methods correctly', async () => {
			const { readFileSync } = await import('node:fs')
			const mockReadFileSync = vi.mocked(readFileSync)

			// tsconfig.jsonから@エイリアスを検出
			const mockTsConfig = JSON.stringify({
				compilerOptions: {
					paths: {
						'@/*': ['src/*'],
					},
				},
			})

			mockReadFileSync.mockReturnValue(mockTsConfig)

			// Vite設定から~エイリアスを検出
			const viteConfig = {
				resolve: {
					alias: {
						'~': './app',
					},
				},
			}

			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

			const result = autoDetectPathAliases(process.cwd(), viteConfig)

			expect(result).toEqual({
				'~': './app', // Vite設定から
				'@': './src', // tsconfig.jsonから
			})

			expect(consoleSpy).toHaveBeenCalledWith(
				'[vite-plugin-gas] Auto-detected path aliases:',
				expect.any(Object)
			)

			consoleSpy.mockRestore()
		})

		it('should fallback to common patterns when no aliases found', async () => {
			const { readFileSync, existsSync } = await import('node:fs')
			const mockReadFileSync = vi.mocked(readFileSync)
			const mockExistsSync = vi.mocked(existsSync)

			// tsconfig.jsonが存在しない
			mockReadFileSync.mockImplementation(() => {
				throw new Error('File not found')
			})

			// src ディレクトリが存在
			mockExistsSync.mockImplementation((path: PathLike) => {
				return path.toString().includes('src')
			})

			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			const consoleLogSpy = vi
				.spyOn(console, 'log')
				.mockImplementation(() => {})

			const result = autoDetectPathAliases()

			// 共通パターンからのフォールバック
			expect(result['@']).toBe('./src')

			consoleSpy.mockRestore()
			consoleLogSpy.mockRestore()
		})
	})
})
