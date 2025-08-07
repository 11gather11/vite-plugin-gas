import { describe, expect, it } from 'vitest'
import { transformArrowFunctions } from '../codeTransformer'

describe('transformArrowFunctions', () => {
	it('should transform export const arrow function to export function', () => {
		const input = 'export const changeShiftName = ({ sheet, name }) => {'
		const expected = 'export function changeShiftName({ sheet, name }) {'
		expect(transformArrowFunctions(input)).toBe(expected)
	})

	it('should transform const arrow function to regular function', () => {
		const input = 'const myFunction = (param1, param2) => {'
		const expected = 'function myFunction(param1, param2) {'
		expect(transformArrowFunctions(input)).toBe(expected)
	})

	it('should transform let arrow function to regular function', () => {
		const input = 'let myFunction = (param1, param2) => {'
		const expected = 'function myFunction(param1, param2) {'
		expect(transformArrowFunctions(input)).toBe(expected)
	})

	it('should transform var arrow function to regular function', () => {
		const input = 'var myFunction = (param1, param2) => {'
		const expected = 'function myFunction(param1, param2) {'
		expect(transformArrowFunctions(input)).toBe(expected)
	})

	it('should transform simple arrow function expression', () => {
		const input = 'const add = (a, b) => a + b;'
		const expected = 'function add(a, b) { return a + b; }'
		expect(transformArrowFunctions(input)).toBe(expected)
	})

	it('should transform export const arrow function expression', () => {
		const input = 'export const multiply = (x, y) => x * y;'
		const expected = 'export function multiply(x, y) { return x * y; }'
		expect(transformArrowFunctions(input)).toBe(expected)
	})

	it('should handle arrow functions with no parameters', () => {
		const input = 'const noParams = () => {'
		const expected = 'function noParams() {'
		expect(transformArrowFunctions(input)).toBe(expected)
	})

	it('should handle export arrow functions with no parameters', () => {
		const input = 'export const noParams = () => {'
		const expected = 'export function noParams() {'
		expect(transformArrowFunctions(input)).toBe(expected)
	})

	it('should handle complex destructuring parameters', () => {
		const input = 'export const complexFunc = ({ a, b, c }) => {'
		const expected = 'export function complexFunc({ a, b, c }) {'
		expect(transformArrowFunctions(input)).toBe(expected)
	})

	it('should handle multiple transformations in one code block', () => {
		const input = `
const func1 = (a) => a + 1;
export const func2 = (b, c) => {
  return b * c;
};
let func3 = () => {
  console.log('test');
}`

		const result = transformArrowFunctions(input)

		expect(result).toContain('function func1(a) { return a + 1; }')
		expect(result).toContain('export function func2(b, c) {')
		expect(result).toContain('function func3() {')
	})

	it('should not transform non-arrow functions', () => {
		const input = 'function regularFunction(param) { return param; }'
		expect(transformArrowFunctions(input)).toBe(input)
	})

	it('should not transform variable declarations with complex expressions', () => {
		const input = `const lastNonEmptyCol =
		rowData
			.map((value, index) => ({ value, index: index + 1 }))
			.reverse()
			.find((cell) => cell.value !== '')?.index || 1`

		const result = transformArrowFunctions(input)

		// Should not transform this complex variable declaration
		expect(result).toContain('const lastNonEmptyCol =')
		expect(result).not.toContain('function lastNonEmptyCol(')

		// Should preserve the arrow function in the map call
		expect(result).toContain(
			'.map((value, index) => ({ value, index: index + 1 }))'
		)
	})

	it('should not transform method definitions', () => {
		const input = 'const obj = { method: function(param) { return param; } }'
		expect(transformArrowFunctions(input)).toBe(input)
	})
})
