import { describe, expect, it } from 'vitest'
import {
	preserveGasFunctions,
	removeModuleStatements,
	transformLogger,
} from '../codeTransformer'

describe('GAS-specific transformations', () => {
	describe('Logger transformation', () => {
		it('should transform console.log to Logger.log', () => {
			const input = `
console.log('Basic message');
console.log('User ID:', 123);
console.warn('Warning');
console.error('Error');
`
			const expected = `
Logger.log('Basic message');
Logger.log('User ID:', 123);
Logger.warn('Warning');
Logger.error('Error');
`
			const result = transformLogger(input)
			expect(result.trim()).toBe(expected.trim())
		})

		it('should not transform existing Logger calls', () => {
			const input = `
Logger.log('Already using Logger');
console.log('Convert this');
`
			const expected = `
Logger.log('Already using Logger');
Logger.log('Convert this');
`
			const result = transformLogger(input)
			expect(result.trim()).toBe(expected.trim())
		})

		it('should preserve GAS special functions', () => {
			const input = `
function onEdit(event) {
  console.log('Sheet edited');
}

function onOpen() {
  Logger.log('Spreadsheet opened');
}

function doGet(request) {
  return HtmlService.createHtmlOutput('Hello');
}
`
			const result = preserveGasFunctions(input)

			// GAS特殊関数名が保護コメント付きで保持されていることを確認
			expect(result).toContain('/* @preserve onEdit */ function onEdit(')
			expect(result).toContain('/* @preserve onOpen */ function onOpen(')
			expect(result).toContain('/* @preserve doGet */ function doGet(')
		})
	})

	describe('Import/Export removal', () => {
		it('should remove all import statements', () => {
			const input = `
import { helper } from './utils';
import * as api from './api';
import type { User } from './types';

export function main() {
  return helper.process();
}
`
			const result = removeModuleStatements(input)

			expect(result).not.toContain('import')
			expect(result).toContain('function main()')
		})

		it('should remove export statements but keep function declarations', () => {
			const input = `
export function publicFunction() {
  return 'public';
}

export const CONFIG = { version: '1.0' };

export default class MyClass {}
`
			const result = removeModuleStatements(input)

			expect(result).not.toContain('export')
			expect(result).toContain('function publicFunction()')
			expect(result).toContain('const CONFIG')
			expect(result).toContain('class MyClass')
		})
	})
})
