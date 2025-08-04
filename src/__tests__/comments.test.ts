import { describe, expect, it } from 'vitest'
import {
	preserveGasFunctions,
	removeModuleStatements,
	transformLogger,
} from '../utils/codeTransformer'

describe('Comment preservation', () => {
	it('should preserve comments when removing module statements', () => {
		const input = `/**
 * This is a JSDoc comment
 */
import { someFunction } from './module'

// This is a line comment
export function myFunction() {
	/* This is a block comment */
	return 'Hello World'
}`

		const result = removeModuleStatements(input)

		// Verify that comments are preserved
		expect(result).toContain('/**')
		expect(result).toContain('* This is a JSDoc comment')
		expect(result).toContain('*/')
		expect(result).toContain('// This is a line comment')
		expect(result).toContain('/* This is a block comment */')

		// Verify that import/export statements are removed
		expect(result).not.toContain('import')
		expect(result).not.toContain('export')
	})

	it('should preserve comments when transforming logger', () => {
		const input = `/**
 * Logger transformation test
 */
function testFunction() {
	// Use console.log for debugging
	console.log('Debug message')
	/* More detailed logging */
	console.warn('Warning')
}`

		const result = transformLogger(input)

		// Verify that comments are preserved
		expect(result).toContain('/**')
		expect(result).toContain('* Logger transformation test')
		expect(result).toContain('*/')
		expect(result).toContain('// Use console.log for debugging')
		expect(result).toContain('/* More detailed logging */')

		// Verify that Logger transformation occurred
		expect(result).toContain('Logger.log')
		expect(result).toContain('Logger.warn')
	})

	it('should preserve comments when preserving GAS functions', () => {
		const input = `/**
 * GAS function for handling form submissions
 */
function onFormSubmit(e) {
	// Process form data
	const data = e.values
	/* Log the submission */
	Logger.log(data)
}`

		const result = preserveGasFunctions(input)

		// Verify that comments are preserved
		expect(result).toContain('/**')
		expect(result).toContain('* GAS function for handling form submissions')
		expect(result).toContain('*/')
		expect(result).toContain('// Process form data')
		expect(result).toContain('/* Log the submission */')

		// Verify that GAS function protection comment was added
		expect(result).toContain('/* @preserve onFormSubmit */')
	})

	it('should handle complex comment patterns', () => {
		const input = `/**
 * Multi-line JSDoc
 * @param {string} param - Description
 * @returns {void}
 */
import type { SomeType } from './types'

export function complexFunction(param: string): void {
	/**
	 * Nested JSDoc comment
	 */
	const nested = () => {
		// TODO: Implement this
		console.log(param)
		/* 
		 * Multi-line block comment
		 * with multiple lines
		 */
	}
	
	// End of function comment
	nested()
}`

		let result = removeModuleStatements(input)
		result = transformLogger(result)

		// Verify that all comments are preserved
		expect(result).toContain('/**')
		expect(result).toContain('Multi-line JSDoc')
		expect(result).toContain('@param {string} param - Description')
		expect(result).toContain('@returns {void}')
		expect(result).toContain('Nested JSDoc comment')
		expect(result).toContain('// TODO: Implement this')
		expect(result).toContain('/* ')
		expect(result).toContain('Multi-line block comment')
		expect(result).toContain('with multiple lines')
		expect(result).toContain('// End of function comment')

		// Verify that transformations are applied correctly
		expect(result).not.toContain('import')
		expect(result).not.toContain('export')
		expect(result).toContain('Logger.log')
	})
})
