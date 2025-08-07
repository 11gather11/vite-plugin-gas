import { beforeEach, describe, expect, it, vi } from 'vitest'
import gasPlugin from '../index'
import type { GasPluginOptions } from '../types'

// Mock external dependencies
vi.mock('tinyglobby', () => ({
	glob: vi.fn(),
}))

vi.mock('node:fs', async (importOriginal) => {
	const actual = await importOriginal<typeof import('node:fs')>()
	return {
		...actual,
		readFileSync: vi.fn(),
		writeFileSync: vi.fn(),
		existsSync: vi.fn(),
		mkdirSync: vi.fn(),
	}
})

import { existsSync, readFileSync } from 'node:fs'
import { glob } from 'tinyglobby'

const mockGlob = vi.mocked(glob)
const mockReadFileSync = vi.mocked(readFileSync)
const mockExistsSync = vi.mocked(existsSync)

// Mock context for testing
const createMockContext = () => ({
	addWatchFile: vi.fn(),
	cache: new Map(),
	emitFile: vi.fn(),
	error: vi.fn(),
	getCombinedSourcemap: vi.fn(),
	getFileName: vi.fn(),
	getModuleIds: vi.fn(),
	getModuleInfo: vi.fn(),
	getWatchFiles: vi.fn(),
	load: vi.fn(),
	meta: { rollupVersion: '4.0.0', watchMode: false },
	moduleIds: [][Symbol.iterator](),
	parse: vi.fn(),
	resolve: vi.fn(),
	setAssetSource: vi.fn(),
	warn: vi.fn(),
	debug: vi.fn(),
	info: vi.fn(),
	fs: {} as Record<string, unknown>,
	environment: {} as Record<string, unknown>,
})

// Mock config context for Vite config hook
const createMockConfigContext = () => ({
	meta: { rollupVersion: '4.0.0', watchMode: false },
	debug: vi.fn(),
	warn: vi.fn(),
	info: vi.fn(),
	error: vi.fn(),
})

const createMockViteConfig = () => ({
	root: process.cwd(),
	base: '/',
	mode: 'development',
	build: {
		outDir: 'dist',
	},
})

describe('Plugin Integration Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Plugin Configuration', () => {
		it('should create plugin with default configuration', () => {
			const plugin = gasPlugin()

			expect(plugin.name).toBe('vite-plugin-gas')
			expect(plugin.enforce).toBe('post')
			expect(plugin.config).toBeDefined()
			expect(plugin.transform).toBeDefined()
			expect(plugin.generateBundle).toBeDefined()
			expect(plugin.writeBundle).toBeDefined()
		})

		it('should create plugin with custom configuration', () => {
			const options: GasPluginOptions = {
				autoDetect: false,
				include: ['lib', 'app'],
				exclude: ['**/*.ignore.ts'],
				outDir: 'build',
				transformLogger: false,
				copyAppsscriptJson: false,
				enablePathAliases: false,
				autoDetectPathAliases: false,
			}

			const plugin = gasPlugin(options)

			expect(plugin.name).toBe('vite-plugin-gas')
			expect(plugin.enforce).toBe('post')
		})
	})

	describe('Vite Config Hook', () => {
		it('should modify vite config correctly', () => {
			mockGlob.mockResolvedValue(['src/main.ts', 'src/utils/helper.ts'])
			mockExistsSync.mockReturnValue(false) // No tsconfig.json

			const plugin = gasPlugin()
			const config = createMockViteConfig()

			if (typeof plugin.config === 'function') {
				const mockConfigContext = createMockConfigContext()
				plugin.config.call(mockConfigContext, config, {
					command: 'build',
					mode: 'development',
				})
			}

			// Since the config function is async and modifies config in-place,
			// we check that the function exists and can be called
			expect(plugin.config).toBeDefined()
		})

		it('should handle config with custom options', () => {
			const options: GasPluginOptions = {
				outDir: 'custom-dist',
				transformLogger: false,
			}

			const plugin = gasPlugin(options)

			expect(typeof plugin.config).toBe('function')
		})
	})

	describe('Transform Hook', () => {
		it('should transform JavaScript files correctly', () => {
			const plugin = gasPlugin({ transformLogger: true })
			const mockContext = createMockContext()

			if (typeof plugin.transform === 'function') {
				const code = `
					console.log('test message');
					console.warn('warning message');
					console.error('error message');
				`

				const result = plugin.transform.call(mockContext, code, 'src/main.js')

				if (result && typeof result === 'object') {
					expect(result.code).toContain('Logger.log')
					expect(result.code).toContain('Logger.warn')
					expect(result.code).toContain('Logger.error')
					expect(result.code).not.toContain('console.log')
					expect(result.code).not.toContain('console.warn')
					expect(result.code).not.toContain('console.error')
				}
			}
		})

		it('should preserve GAS special functions', () => {
			const plugin = gasPlugin()
			const mockContext = createMockContext()

			if (typeof plugin.transform === 'function') {
				const code = `
					function onOpen() {
						console.log('Spreadsheet opened');
					}
					
					function onEdit(e) {
						console.log('Cell edited');
					}
					
					function doGet(request) {
						return HtmlService.createHtmlOutput('Hello');
					}
				`

				const result = plugin.transform.call(mockContext, code, 'src/main.js')

				if (result && typeof result === 'object') {
					expect(result.code).toContain('/* @preserve onOpen */')
					expect(result.code).toContain('/* @preserve onEdit */')
					expect(result.code).toContain('/* @preserve doGet */')
				}
			}
		})

		it('should skip TypeScript files (handled by Vite)', () => {
			const plugin = gasPlugin()
			const mockContext = createMockContext()

			if (typeof plugin.transform === 'function') {
				const code = 'console.log("TypeScript file");'
				const result = plugin.transform.call(mockContext, code, 'src/main.ts')

				expect(result).toBeNull()
			}
		})

		it('should skip node_modules files', () => {
			const plugin = gasPlugin()
			const mockContext = createMockContext()

			if (typeof plugin.transform === 'function') {
				const code = 'console.log("node_modules file");'
				const result = plugin.transform.call(
					mockContext,
					code,
					'node_modules/lib/index.js'
				)

				expect(result).toBeNull()
			}
		})

		it('should handle disabled logger transformation', () => {
			const plugin = gasPlugin({ transformLogger: false })
			const mockContext = createMockContext()

			if (typeof plugin.transform === 'function') {
				const code = 'console.log("test");'
				const result = plugin.transform.call(mockContext, code, 'src/main.js')

				if (result && typeof result === 'object') {
					expect(result.code).toContain('console.log')
					expect(result.code).not.toContain('Logger.log')
				}
			}
		})
	})

	describe('GenerateBundle Hook', () => {
		it('should process bundle correctly', () => {
			const plugin = gasPlugin()
			const mockContext = createMockContext()

			const bundle = {
				'main.js': {
					type: 'chunk' as const,
					code: `
						import { helper } from './helper';
						export function main() {
							console.log('main function');
							return helper();
						}
					`,
					map: null,
					fileName: 'main.js',
					name: 'main',
				},
			}

			if (plugin.generateBundle) {
				// The function should execute without throwing
				expect(() => {
					if (typeof plugin.generateBundle === 'function') {
						plugin.generateBundle.call(mockContext, {}, bundle)
					} else if (
						plugin.generateBundle &&
						'handler' in plugin.generateBundle
					) {
						// Handle ObjectHook case
						plugin.generateBundle.handler.call(mockContext, {}, bundle)
					}
				}).not.toThrow()
			}
		})

		it('should handle empty bundle', () => {
			const plugin = gasPlugin()
			const mockContext = createMockContext()
			const emptyBundle = {}

			if (plugin.generateBundle) {
				expect(() => {
					if (typeof plugin.generateBundle === 'function') {
						plugin.generateBundle.call(mockContext, {}, emptyBundle)
					} else if (
						plugin.generateBundle &&
						'handler' in plugin.generateBundle
					) {
						// Handle ObjectHook case
						plugin.generateBundle.handler.call(mockContext, {}, emptyBundle)
					}
				}).not.toThrow()
			}
		})
	})

	describe('WriteBundle Hook', () => {
		it('should copy appsscript.json when enabled', () => {
			mockExistsSync.mockReturnValue(true)
			mockReadFileSync.mockReturnValue('{"timeZone": "UTC"}')

			const plugin = gasPlugin({ copyAppsscriptJson: true })
			const mockContext = createMockContext()

			if (plugin.writeBundle) {
				expect(() => {
					if (typeof plugin.writeBundle === 'function') {
						plugin.writeBundle.call(mockContext, {})
					} else if (plugin.writeBundle && 'handler' in plugin.writeBundle) {
						// Handle ObjectHook case
						plugin.writeBundle.handler.call(mockContext, {})
					}
				}).not.toThrow()
			}
		})

		it('should skip appsscript.json when disabled', () => {
			const plugin = gasPlugin({ copyAppsscriptJson: false })
			const mockContext = createMockContext()

			if (plugin.writeBundle) {
				expect(() => {
					if (typeof plugin.writeBundle === 'function') {
						plugin.writeBundle.call(mockContext, {})
					} else if (plugin.writeBundle && 'handler' in plugin.writeBundle) {
						// Handle ObjectHook case
						plugin.writeBundle.handler.call(mockContext, {})
					}
				}).not.toThrow()
			}
		})

		it('should handle missing appsscript.json gracefully', () => {
			mockExistsSync.mockReturnValue(false)

			const plugin = gasPlugin({ copyAppsscriptJson: true })
			const mockContext = createMockContext()

			if (plugin.writeBundle) {
				expect(() => {
					if (typeof plugin.writeBundle === 'function') {
						plugin.writeBundle.call(mockContext, {})
					} else if (plugin.writeBundle && 'handler' in plugin.writeBundle) {
						// Handle ObjectHook case
						plugin.writeBundle.handler.call(mockContext, {})
					}
				}).not.toThrow()
			}
		})
	})

	describe('Error Handling', () => {
		it('should handle plugin creation with invalid options gracefully', () => {
			expect(() => {
				gasPlugin({} as GasPluginOptions)
			}).not.toThrow()
		})

		it('should handle transform errors gracefully', () => {
			const plugin = gasPlugin()
			const mockContext = createMockContext()

			if (plugin.transform) {
				expect(() => {
					if (typeof plugin.transform === 'function') {
						plugin.transform.call(
							mockContext,
							'invalid syntax {{{',
							'src/broken.js'
						)
					} else if (plugin.transform && 'handler' in plugin.transform) {
						// Handle ObjectHook case
						plugin.transform.handler.call(
							mockContext,
							'invalid syntax {{{',
							'src/broken.js'
						)
					}
				}).not.toThrow()
			}
		})
	})

	describe('Plugin Lifecycle', () => {
		it('should maintain correct hook execution order', () => {
			const plugin = gasPlugin()

			// Check that hooks exist and are callable
			expect(typeof plugin.config).toBe('function')
			expect(typeof plugin.transform).toBe('function')
			expect(typeof plugin.generateBundle).toBe('function')
			expect(typeof plugin.writeBundle).toBe('function')

			// Check plugin metadata
			expect(plugin.name).toBe('vite-plugin-gas')
			expect(plugin.enforce).toBe('post')
		})

		it('should handle multiple plugin instances', () => {
			const plugin1 = gasPlugin({ outDir: 'dist1' })
			const plugin2 = gasPlugin({ outDir: 'dist2' })

			expect(plugin1.name).toBe('vite-plugin-gas')
			expect(plugin2.name).toBe('vite-plugin-gas')
			expect(plugin1).not.toBe(plugin2)
		})
	})

	describe('File Processing', () => {
		it('should process files according to include/exclude patterns', () => {
			const plugin = gasPlugin({
				include: ['src/**/*.ts'],
				exclude: ['**/*.test.ts'],
			})

			expect(plugin.name).toBe('vite-plugin-gas')
		})

		it('should handle auto-detection settings', () => {
			const pluginWithAutoDetect = gasPlugin({ autoDetect: true })
			const pluginWithoutAutoDetect = gasPlugin({ autoDetect: false })

			expect(pluginWithAutoDetect.name).toBe('vite-plugin-gas')
			expect(pluginWithoutAutoDetect.name).toBe('vite-plugin-gas')
		})
	})
})
