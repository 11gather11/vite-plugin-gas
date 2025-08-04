import { describe, expect, it } from 'vitest'
import type { GasPluginOptions } from '../../types'
import { DEFAULT_OPTIONS } from '../../types'
import { GasTransformer } from '../gasTransformer'

describe('GasTransformer', () => {
	describe('transform', () => {
		it('should transform JavaScript files only (post-compilation)', () => {
			// Use default options
			const transformer = new GasTransformer(DEFAULT_OPTIONS)

			// JavaScript files are transformed (after conversion from TypeScript)
			const jsResult = transformer.transform(
				'import test from "module";\nfunction doGet() { console.log("test"); }',
				'/src/test.js'
			)
			expect(jsResult).not.toBeNull()
			expect(jsResult?.code).not.toContain('import')
			expect(jsResult?.code).toContain('Logger.log')

			// TypeScript files are not transformed (processed by Vite's esbuild)
			const tsResult = transformer.transform(
				'function test() { console.log("test"); }',
				'/src/test.ts'
			)
			expect(tsResult).toBeNull()
		})

		it('should remove import/export statements', () => {
			// Options with logger transformation disabled
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
			// Use default options (transformLogger: true)
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
			// Options with logger transformation disabled
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
			// Use default options
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

			// Execute generateBundle
			transformer.generateBundle(mockBundle)

			// Verify that JavaScript chunk code is processed
			expect(mockBundle['main.js'].code).toContain('function doGet()')
			// Asset files are not processed
			expect(mockBundle['styles.css'].code).toBeUndefined()
		})

		it('should only process JavaScript files', () => {
			// Use default options
			const transformer = new GasTransformer(DEFAULT_OPTIONS)

			const mockBundle = {
				'main.ts': {
					// Not .js
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

			// Only .js files are processed
			expect(mockBundle['main.ts'].code).toBe(originalTsCode)
			expect(mockBundle['main.js'].code).toContain('function doPost()')
		})
	})
})
