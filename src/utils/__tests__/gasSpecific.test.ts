import { describe, expect, it } from 'vitest'
import { sampleCodeTransformations } from '../__fixtures__/sampleData'
import {
	preserveGasFunctions,
	removeModuleStatements,
	transformLogger,
} from '../codeTransformer'

describe('GAS-specific transformations', () => {
	describe('Logger transformation', () => {
		it('should transform console.log to Logger.log', () => {
			const result = transformLogger(sampleCodeTransformations.consoleLogCode)
			expect(result.trim()).toBe(
				sampleCodeTransformations.expectedLoggerCode.trim()
			)
		})

		it('should not transform existing Logger calls', () => {
			const result = transformLogger(sampleCodeTransformations.mixedLoggerCode)
			expect(result.trim()).toBe(
				sampleCodeTransformations.expectedMixedLoggerCode.trim()
			)
		})
	})

	describe('GAS function preservation', () => {
		it('should preserve GAS special functions', () => {
			const result = preserveGasFunctions(
				sampleCodeTransformations.multipleGasFunctions
			)

			// GAS特殊関数名が保護コメント付きで保持されていることを確認
			expect(result).toContain('/* @preserve onEdit */ function onEdit(')
			expect(result).toContain('/* @preserve onOpen */ function onOpen(')
			expect(result).toContain('/* @preserve doGet */ function doGet(')
		})

		it('should handle single GAS function', () => {
			const result = preserveGasFunctions(
				sampleCodeTransformations.gasSpecialFunction
			)
			expect(result).toContain('/* @preserve onEdit */ function onEdit(')
		})
	})

	describe('Import/Export removal', () => {
		it('should remove all import statements', () => {
			const result = removeModuleStatements(
				sampleCodeTransformations.complexImportsExports
			)

			expect(result).not.toContain('import')
			expect(result).toContain('function main()')
		})

		it('should remove export statements but keep function declarations', () => {
			const result = removeModuleStatements(
				sampleCodeTransformations.exportVariousTypes
			)

			expect(result).not.toContain('export')
			expect(result).toContain('function publicFunction()')
			expect(result).toContain('const CONFIG')
			expect(result).toContain('class MyClass')
		})

		it('should handle code with both imports and exports', () => {
			const result = removeModuleStatements(
				sampleCodeTransformations.withImportsExports
			)

			expect(result).not.toContain('import')
			expect(result).not.toContain('export')
			expect(result).toContain('function main()')
		})
	})
})
