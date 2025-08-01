import { describe, expect, it } from 'vitest'
import type { GasPluginOptions } from '../../types'
import { GasTransformer } from '../gasTransformer'

describe('GasTransformer', () => {
	describe('transform', () => {
		it('should transform TypeScript files only', () => {
			const options: Required<GasPluginOptions> = {
				autoDetect: true,
				include: ['src'],
				exclude: [],
				outDir: 'dist',
				transformLogger: true,
			}

			const transformer = new GasTransformer(options)

			// TypeScriptファイルは変換される
			const tsResult = transformer.transform(
				'import test from "module";\nfunction doGet() { console.log("test"); }',
				'/src/test.ts'
			)
			expect(tsResult).not.toBeNull()
			expect(tsResult?.code).not.toContain('import')
			expect(tsResult?.code).toContain('Logger.log')

			// TypeScript以外のファイルは変換されない
			const jsResult = transformer.transform(
				'function test() { console.log("test"); }',
				'/src/test.js'
			)
			expect(jsResult).toBeNull()
		})

		it('should remove import/export statements', () => {
			const options: Required<GasPluginOptions> = {
				autoDetect: true,
				include: ['src'],
				exclude: [],
				outDir: 'dist',
				transformLogger: false,
			}

			const transformer = new GasTransformer(options)

			const code = `
import { Logger } from 'gas'
import * as fs from 'fs'

function doGet() {
	return 'test'
}

export default doGet
			`.trim()

			const result = transformer.transform(code, '/src/test.ts')
			expect(result).not.toBeNull()
			expect(result?.code).not.toContain('import')
			expect(result?.code).not.toContain('export')
			expect(result?.code).toContain('function doGet()')
		})

		it('should transform logger when option is enabled', () => {
			const options: Required<GasPluginOptions> = {
				autoDetect: true,
				include: ['src'],
				exclude: [],
				outDir: 'dist',
				transformLogger: true,
			}

			const transformer = new GasTransformer(options)

			const code = `
function test() {
	console.log('Hello')
	console.warn('Warning')
}
			`.trim()

			const result = transformer.transform(code, '/src/test.ts')
			expect(result).not.toBeNull()
			expect(result?.code).toContain('Logger.log')
			expect(result?.code).toContain('Logger.warn')
			expect(result?.code).not.toContain('console.log')
		})

		it('should not transform logger when option is disabled', () => {
			const options: Required<GasPluginOptions> = {
				autoDetect: true,
				include: ['src'],
				exclude: [],
				outDir: 'dist',
				transformLogger: false,
			}

			const transformer = new GasTransformer(options)

			const code = `
function test() {
	console.log('Hello')
}
			`.trim()

			const result = transformer.transform(code, '/src/test.ts')
			expect(result).not.toBeNull()
			expect(result?.code).toContain('console.log')
			expect(result?.code).not.toContain('Logger.log')
		})
	})

	describe('generateBundle', () => {
		it('should preserve GAS functions in JavaScript chunks', () => {
			const options: Required<GasPluginOptions> = {
				autoDetect: true,
				include: ['src'],
				exclude: [],
				outDir: 'dist',
				transformLogger: true,
			}

			const transformer = new GasTransformer(options)

			const mockBundle = {
				'main.js': {
					type: 'chunk',
					code: 'function doGet() { return "test"; }',
				},
				'styles.css': {
					type: 'asset',
					code: undefined,
				},
			}

			// generateBundleを実行
			transformer.generateBundle(mockBundle)

			// JavaScriptチャンクのコードが処理されることを確認
			expect(mockBundle['main.js'].code).toContain('function doGet()')
			// アセットファイルは処理されない
			expect(mockBundle['styles.css'].code).toBeUndefined()
		})

		it('should only process JavaScript files', () => {
			const options: Required<GasPluginOptions> = {
				autoDetect: true,
				include: ['src'],
				exclude: [],
				outDir: 'dist',
				transformLogger: true,
			}

			const transformer = new GasTransformer(options)

			const mockBundle = {
				'main.ts': {
					// .jsではない
					type: 'chunk',
					code: 'function doGet() { return "test"; }',
				},
				'main.js': {
					type: 'chunk',
					code: 'function doPost() { return "test"; }',
				},
			}

			const originalTsCode = mockBundle['main.ts'].code

			transformer.generateBundle(mockBundle)

			// .jsファイルのみ処理される
			expect(mockBundle['main.ts'].code).toBe(originalTsCode)
			expect(mockBundle['main.js'].code).toContain('function doPost()')
		})
	})
})
