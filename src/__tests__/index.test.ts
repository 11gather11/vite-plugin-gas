import type { Plugin } from 'vite'
import { describe, expect, it } from 'vitest'
import gasPlugin from '../index'
import type { GasPluginOptions } from '../types'

describe('gasPlugin', () => {
	it('should return a Vite plugin with correct name', () => {
		const plugin = gasPlugin() as Plugin

		expect(plugin.name).toBe('vite-plugin-gas')
		expect(typeof plugin.config).toBe('function')
		expect(typeof plugin.transform).toBe('function')
		expect(typeof plugin.generateBundle).toBe('function')
	})

	it('should accept options', () => {
		const options: GasPluginOptions = {
			autoDetect: false,
			transformLogger: false,
			include: ['lib'],
			exclude: ['**/*.ignore.ts'],
			outDir: 'build',
		}

		const plugin = gasPlugin(options) as Plugin
		expect(plugin.name).toBe('vite-plugin-gas')
	})

	it('should work with default options', () => {
		const plugin = gasPlugin() as Plugin
		expect(plugin.name).toBe('vite-plugin-gas')
	})

	it('should call config hook correctly', async () => {
		const plugin = gasPlugin() as Plugin

		// config フックの存在を確認
		expect(plugin.config).toBeDefined()
		expect(typeof plugin.config).toBe('function')
	})

	it('should call generateBundle hook correctly', () => {
		const plugin = gasPlugin() as Plugin

		// generateBundle フックの存在を確認
		expect(plugin.generateBundle).toBeDefined()
		expect(typeof plugin.generateBundle).toBe('function')
	})

	it('should export GasPluginOptions type', () => {
		// 型のエクスポートが正しく行われていることを確認
		// TypeScriptコンパイラーがこれをチェックする
		const options: GasPluginOptions = {
			autoDetect: true,
			include: ['src'],
			exclude: ['**/*.test.ts'],
			outDir: 'build',
			transformLogger: false,
		}

		expect(typeof options).toBe('object')
		expect(options.autoDetect).toBe(true)
		expect(options.transformLogger).toBe(false)
	})

	it('should have all required plugin hooks', () => {
		const plugin = gasPlugin() as Plugin

		// 必要なプラグインフックが存在することを確認
		expect(plugin.config).toBeDefined()
		expect(plugin.transform).toBeDefined()
		expect(plugin.generateBundle).toBeDefined()
	})
})
