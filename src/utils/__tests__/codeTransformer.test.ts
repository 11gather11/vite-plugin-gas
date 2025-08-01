import { describe, expect, it } from 'vitest'
import {
	preserveGasFunctions,
	removeModuleStatements,
	transformLogger,
} from '../codeTransformer'

describe('code-transformer', () => {
	describe('removeModuleStatements', () => {
		it('should remove import statements', () => {
			const code = `
import { test } from 'module'
import * as fs from 'fs'

function myFunction() {
	return 'test'
}
			`.trim()

			const result = removeModuleStatements(code)
			expect(result).not.toContain('import')
			expect(result).toContain('function myFunction()')
		})

		it('should remove export statements', () => {
			const code = `
function myFunction() {
	return 'test'
}

export default myFunction
export { myFunction }
			`.trim()

			const result = removeModuleStatements(code)
			expect(result).not.toContain('export')
			expect(result).toContain('function myFunction()')
		})

		it('should preserve function content', () => {
			const code = `
import { Logger } from 'gas'

function doGet() {
	Logger.log('Hello from doGet')
	return 'success'
}

export { doGet }
			`.trim()

			const result = removeModuleStatements(code)
			expect(result).toContain("Logger.log('Hello from doGet')")
			expect(result).toContain("return 'success'")
			expect(result).not.toContain('import')
			expect(result).not.toContain('export')
		})
	})

	describe('preserveGasFunctions', () => {
		it('should preserve doGet function', () => {
			const code = `
function doGet() {
	return 'test'
}

function regularFunction() {
	return 'regular'
}
			`.trim()

			const result = preserveGasFunctions(code)
			expect(result).toContain('function doGet()')
			expect(result).toContain('function regularFunction()')
		})

		it('should preserve doPost function', () => {
			const code = `
function doPost() {
	return 'test'
}
			`.trim()

			const result = preserveGasFunctions(code)
			expect(result).toContain('function doPost()')
		})

		it('should preserve onEdit trigger', () => {
			const code = `
function onEdit() {
	return 'test'
}
			`.trim()

			const result = preserveGasFunctions(code)
			expect(result).toContain('function onEdit()')
		})
	})

	describe('transformLogger', () => {
		it('should transform console.log to Logger.log', () => {
			const code = `
function test() {
	console.log('Hello world')
	console.warn('Warning message')
	console.error('Error message')
}
			`.trim()

			const result = transformLogger(code)
			expect(result).toContain('Logger.log(')
			expect(result).toContain('Logger.warn(')
			expect(result).toContain('Logger.error(')
			expect(result).not.toContain('console.log')
			expect(result).not.toContain('console.warn')
			expect(result).not.toContain('console.error')
		})

		it('should preserve other console methods', () => {
			const code = `
function test() {
	console.log('Hello')
	console.info('Info')
	console.debug('Debug')
}
			`.trim()

			const result = transformLogger(code)
			expect(result).toContain('Logger.log(')
			expect(result).toContain('console.info')
			expect(result).toContain('console.debug')
		})
	})
})
