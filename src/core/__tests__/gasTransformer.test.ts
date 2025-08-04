import { describe, expect, it } from 'vitest'
import type { GasPluginOptions } from '../../types'
import { DEFAULT_OPTIONS } from '../../types'
import { GasTransformer } from '../gasTransformer'

describe('GasTransformer', () => {
	describe('transform', () => {
		it('should transform JavaScript files only (post-compilation)', () => {
			// デフォルトオプションを使用
			const transformer = new GasTransformer(DEFAULT_OPTIONS)

			// JavaScriptファイルは変換される（TypeScriptから変換された後）
			const jsResult = transformer.transform(
				'import test from "module";\nfunction doGet() { console.log("test"); }',
				'/src/test.js'
			)
			expect(jsResult).not.toBeNull()
			expect(jsResult?.code).not.toContain('import')
			expect(jsResult?.code).toContain('Logger.log')

			// TypeScriptファイルは変換されない（Viteのesbuildが処理する）
			const tsResult = transformer.transform(
				'function test() { console.log("test"); }',
				'/src/test.ts'
			)
			expect(tsResult).toBeNull()
		})

		it('should remove import/export statements', () => {
			// Logger変換を無効にしたオプション
			const options: GasPluginOptions = {
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

			const result = transformer.transform(code, '/src/test.js')
			expect(result).not.toBeNull()
			expect(result?.code).not.toContain('import')
			expect(result?.code).not.toContain('export')
			expect(result?.code).toContain('function doGet()')
		})

		it('should transform logger when option is enabled', () => {
			// デフォルトオプション（transformLogger: true）を使用
			const transformer = new GasTransformer(DEFAULT_OPTIONS)

			const code = `
function test() {
	console.log('Hello')
	console.warn('Warning')
}
			`.trim()

			const result = transformer.transform(code, '/src/test.js')
			expect(result).not.toBeNull()
			expect(result?.code).toContain('Logger.log')
			expect(result?.code).toContain('Logger.warn')
			expect(result?.code).not.toContain('console.log')
		})

		it('should not transform logger when option is disabled', () => {
			// Logger変換を無効にしたオプション
			const options: GasPluginOptions = {
				transformLogger: false,
			}

			const transformer = new GasTransformer(options)

			const code = `
function test() {
	console.log('Hello')
}
			`.trim()

			const result = transformer.transform(code, '/src/test.js')
			expect(result).not.toBeNull()
			expect(result?.code).toContain('console.log')
			expect(result?.code).not.toContain('Logger.log')
		})
	})

	describe('generateBundle', () => {
		it('should preserve GAS functions in JavaScript chunks', () => {
			// デフォルトオプションを使用
			const transformer = new GasTransformer(DEFAULT_OPTIONS)

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
			// デフォルトオプションを使用
			const transformer = new GasTransformer(DEFAULT_OPTIONS)

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
