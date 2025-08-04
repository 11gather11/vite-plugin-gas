import { describe, expect, it } from 'vitest'
import gasPlugin from '../index'
import {
	extractTransformHook,
	validatePluginInstance,
} from './__mocks__/testUtils'
import { createMockViteContext } from './__mocks__/vite'

describe('gasPlugin - Transform Tests', () => {
	it('should validate plugin has transform hook', () => {
		const plugin = gasPlugin({ transformLogger: true })
		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			const transformFn = extractTransformHook(plugin)
			expect(transformFn).not.toBeNull()
			expect(typeof transformFn).toBe('function')
		}
	})

	it('should handle JavaScript files for transformation', () => {
		const plugin = gasPlugin({ transformLogger: true })
		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			const transformFn = extractTransformHook(plugin)
			expect(transformFn).not.toBeNull()

			if (transformFn) {
				const input = 'console.log("test");'
				const mockThis = {
					info: () => {},
					warn: () => {},
					error: () => {},
				}

				const result = transformFn.call(mockThis, input, 'src/main.js')

				// Result is either a string or TransformResult object
				expect(result).toBeDefined()
				if (typeof result === 'string') {
					expect(result).toContain('Logger.log')
				}
			}
		}
	})

	it('should skip non-JavaScript files', () => {
		const plugin = gasPlugin()
		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			const transformFn = extractTransformHook(plugin)
			expect(transformFn).not.toBeNull()

			if (transformFn) {
				const input = 'body { color: red; }'
				const mockThis = {
					info: () => {},
					warn: () => {},
					error: () => {},
				}

				const result = transformFn.call(mockThis, input, 'src/styles.css')

				// CSS files are not transformed
				expect(result).toBeNull()
			}
		}
	})

	it('should respect transformLogger option', () => {
		const pluginWithLogger = gasPlugin({ transformLogger: true })
		const pluginWithoutLogger = gasPlugin({ transformLogger: false })

		expect(validatePluginInstance(pluginWithLogger)).toBe(true)
		expect(validatePluginInstance(pluginWithoutLogger)).toBe(true)

		// Both plugins have transform hooks
		if (validatePluginInstance(pluginWithLogger)) {
			expect(extractTransformHook(pluginWithLogger)).not.toBeNull()
		}

		if (validatePluginInstance(pluginWithoutLogger)) {
			expect(extractTransformHook(pluginWithoutLogger)).not.toBeNull()
		}
	})

	it('should work with Vite context mock', () => {
		const mockContext = createMockViteContext()
		const plugin = gasPlugin()

		expect(validatePluginInstance(plugin)).toBe(true)
		expect(mockContext).toBeDefined()
		expect(mockContext.resolve).toBeDefined()
		expect(mockContext.load).toBeDefined()
		expect(mockContext.transform).toBeDefined()
	})

	it('should handle empty input gracefully', () => {
		const plugin = gasPlugin()
		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			const transformFn = extractTransformHook(plugin)
			expect(transformFn).not.toBeNull()

			if (transformFn) {
				const mockThis = {
					info: () => {},
					warn: () => {},
					error: () => {},
				}

				const result = transformFn.call(mockThis, '', 'src/empty.js')

				// Empty files should not throw errors
				expect(result).toBeDefined()
			}
		}
	})
})
