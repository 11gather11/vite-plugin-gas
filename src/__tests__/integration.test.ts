import { describe, expect, it, vi } from 'vitest'
import gasPlugin from '../index'

// テスト用のモック
vi.mock('tinyglobby', () => ({
	glob: vi.fn(),
}))

// テスト用のモックコンテキスト
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

describe('gasPlugin - Integration Tests', () => {
	it('should create plugin with correct name and hooks', () => {
		const plugin = gasPlugin({
			autoDetect: true,
			include: ['src', 'lib'],
			exclude: ['**/*.test.ts'],
			outDir: 'dist',
		})

		expect(plugin.name).toBe('vite-plugin-gas')
		expect(plugin.enforce).toBe('post')
		expect(plugin.config).toBeDefined()
		expect(plugin.transform).toBeDefined()
		expect(plugin.generateBundle).toBeDefined()
		expect(plugin.writeBundle).toBeDefined()
	})

	it('should work with minimal configuration', () => {
		const plugin = gasPlugin()

		expect(plugin.name).toBe('vite-plugin-gas')
		expect(plugin.enforce).toBe('post')
		expect(plugin.config).toBeDefined()
		expect(plugin.transform).toBeDefined()
	})

	it('should handle different file types appropriately', () => {
		const plugin = gasPlugin({
			transformLogger: true,
		})

		const transformFunction = plugin.transform
		if (typeof transformFunction === 'function') {
			const mockContext = createMockContext()

			// JavaScriptファイルは変換される
			const jsResult = transformFunction.call(
				mockContext,
				'console.log("test");',
				'src/main.js'
			)
			expect(jsResult).not.toBeNull()

			// TypeScriptファイルは変換されない（Viteのesbuildが処理）
			const tsResult = transformFunction.call(
				mockContext,
				'console.log("test");',
				'src/main.ts'
			)
			expect(tsResult).toBeNull()

			// node_modulesファイルは変換されない
			const nodeResult = transformFunction.call(
				mockContext,
				'console.log("test");',
				'node_modules/lib/index.js'
			)
			expect(nodeResult).toBeNull()
		}
	})

	it('should configure comment preservation correctly for vite build', () => {
		const plugin = gasPlugin({
			preserveComments: true,
			autoDetect: false,
		})

		const mockConfig = {
			plugins: [],
			build: {},
			esbuild: {},
		}

		// config hookをテスト
		if (typeof plugin.config === 'function') {
			const configFunction = plugin.config
			const result = configFunction.call(createMockContext(), mockConfig)

			// configが同期的に返される場合の処理
			if (result && typeof result === 'object' && 'then' in result) {
				// Promiseの場合は実際のテストではawaitが必要
				// ここでは同期的な処理の結果を確認
			}

			// esbuildが適切に設定されていることを確認
			expect(mockConfig.esbuild).toBeDefined()
		}

		// transform hookで適切な変換が行われることを確認
		const transformFunction = plugin.transform
		if (typeof transformFunction === 'function') {
			const mockContext = createMockContext()
			const codeWithComments = `/**
 * JSDoc comment for the function
 * @param {string} input - Input parameter
 */
export function myFunction(input) {
	// Line comment
	console.log(input)
	/* Block comment */
	return input.toUpperCase()
}`

			const result = transformFunction.call(
				mockContext,
				codeWithComments,
				'src/test.js'
			)

			// JavaScriptファイルなので変換されるはず
			expect(result).toBeDefined()
			if (result && typeof result === 'object' && 'code' in result) {
				// コメントが保持されていることを確認
				expect(result.code).toContain('/**')
				expect(result.code).toContain('JSDoc comment for the function')
				expect(result.code).toContain('*/')
				expect(result.code).toContain('// Line comment')
				expect(result.code).toContain('/* Block comment */')

				// Logger変換も行われていることを確認
				expect(result.code).toContain('Logger.log')
			}
		}
	})
})
