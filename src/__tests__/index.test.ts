import { describe, expect, it } from 'vitest'
import gasPlugin from '../index'
import type { GasPluginOptions } from '../types'
import {
	validatePluginInstance,
	validatePluginProperties,
} from './__mocks__/testUtils'

describe('gasPlugin', () => {
	it('should return a Vite plugin with correct name', () => {
		const plugin = gasPlugin()

		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			expect(plugin.name).toBe('vite-plugin-gas')
			const errors = validatePluginProperties(plugin)
			expect(errors).toHaveLength(0)
		}
	})

	it('should accept custom options', () => {
		const options: GasPluginOptions = {
			autoDetect: false,
			transformLogger: false,
			include: ['lib'],
			exclude: ['**/*.ignore.ts'],
			outDir: 'build',
			copyAppsscriptJson: false,
		}

		const plugin = gasPlugin(options)
		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			expect(plugin.name).toBe('vite-plugin-gas')
		}
	})

	it('should work with default options', () => {
		const plugin = gasPlugin()
		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			expect(plugin.name).toBe('vite-plugin-gas')
		}
	})

	it('should have working config processor', () => {
		const plugin = gasPlugin()
		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			expect(plugin.config).toBeDefined()
			expect(typeof plugin.config).toBe('function')
		}
	})

	it('should have working transformer', () => {
		const plugin = gasPlugin()
		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			expect(plugin.transform).toBeDefined()
		}
	})

	it('should have working bundle generator', () => {
		const plugin = gasPlugin()
		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			expect(plugin.generateBundle).toBeDefined()
		}
	})

	it('should export GasPluginOptions type', () => {
		// 型のエクスポートが正しく行われていることを確認
		const options: GasPluginOptions = {
			autoDetect: true,
			include: ['src'],
			exclude: ['**/*.test.ts'],
			outDir: 'build',
			transformLogger: false,
			copyAppsscriptJson: true,
		}

		expect(typeof options).toBe('object')
		expect(options.autoDetect).toBe(true)
		expect(options.transformLogger).toBe(false)
		expect(options.copyAppsscriptJson).toBe(true)
	})

	it('should have all required plugin hooks', () => {
		const plugin = gasPlugin()
		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			const errors = validatePluginProperties(plugin)
			expect(errors).toHaveLength(0)
		}
	})

	it('should accept copyAppsscriptJson option', () => {
		const plugin = gasPlugin({ copyAppsscriptJson: true })
		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			expect(plugin.name).toBe('vite-plugin-gas')
			const errors = validatePluginProperties(plugin)
			expect(errors).toHaveLength(0)
		}
	})

	it('should have writeBundle function', () => {
		const plugin = gasPlugin()
		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			expect(plugin.writeBundle).toBeDefined()
		}
	})

	it('should handle transform hook validation', () => {
		const plugin = gasPlugin({ transformLogger: false })
		expect(validatePluginInstance(plugin)).toBe(true)

		if (validatePluginInstance(plugin)) {
			expect(plugin.transform).toBeDefined()
		}
	})
})
