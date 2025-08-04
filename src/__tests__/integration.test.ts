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
})
