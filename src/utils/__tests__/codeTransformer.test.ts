import { describe, expect, it } from 'vitest'
import { sampleCodeTransformations } from '../__fixtures__/sampleData'
import {
	preserveGasFunctions,
	removeModuleStatements,
	transformLogger,
} from '../codeTransformer'

describe('codeTransformer', () => {
	describe('removeModuleStatements', () => {
		it('should remove ES6 import statements', () => {
			const result = removeModuleStatements(
				sampleCodeTransformations.withImportsExports
			)
			expect(result).not.toContain('import')
			expect(result).not.toContain('export')
		})

		it('should not affect code without imports/exports', () => {
			const result = removeModuleStatements(
				sampleCodeTransformations.withoutImportsExports
			)
			expect(result).toBe(sampleCodeTransformations.withoutImportsExports)
		})
	})

	describe('preserveGasFunctions', () => {
		it('should add preserve comments to GAS special functions', () => {
			const result = preserveGasFunctions(
				sampleCodeTransformations.gasSpecialFunction
			)
			expect(result).toContain('/* @preserve onEdit */')
		})

		it('should handle code without GAS functions', () => {
			const result = preserveGasFunctions(
				sampleCodeTransformations.withoutImportsExports
			)
			expect(result).toBe(sampleCodeTransformations.withoutImportsExports)
		})
	})

	describe('transformLogger', () => {
		it('should transform console.log to Logger.log', () => {
			const code =
				'console.log("test"); console.warn("warn"); console.error("error");'
			const result = transformLogger(code)
			expect(result).toContain('Logger.log("test")')
			expect(result).toContain('Logger.warn("warn")')
			expect(result).toContain('Logger.error("error")')
		})
	})
})
