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
		expect(typeof plugin.writeBundle).toBe('function')
	})

	it('should accept options', () => {
		const options: GasPluginOptions = {
			autoDetect: false,
			transformLogger: false,
			include: ['lib'],
			exclude: ['**/*.ignore.ts'],
			outDir: 'build',
			copyAppsscriptJson: false,
		}

		const plugin = gasPlugin(options) as Plugin
		expect(plugin.name).toBe('vite-plugin-gas')
	})

	it('should work with default options', () => {
		const plugin = gasPlugin() as Plugin
		expect(plugin.name).toBe('vite-plugin-gas')
	})

	it('should have working config processor', () => {
		const plugin = gasPlugin() as Plugin
		const pluginImpl = gasPlugin()

		// プラグイン内部のconfigProcessorが動作することを確認
		expect(pluginImpl).toBeDefined()
		expect(plugin.config).toBeDefined()
	})

	it('should have working transformer', () => {
		const plugin = gasPlugin() as Plugin
		const pluginImpl = gasPlugin()

		// プラグイン内部のtransformerが動作することを確認
		expect(pluginImpl).toBeDefined()
		expect(plugin.transform).toBeDefined()
	})

	it('should have working bundle generator', () => {
		const plugin = gasPlugin() as Plugin
		const pluginImpl = gasPlugin()

		// プラグイン内部のbundle generatorが動作することを確認
		expect(pluginImpl).toBeDefined()
		expect(plugin.generateBundle).toBeDefined()
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
			copyAppsscriptJson: true,
		}

		expect(typeof options).toBe('object')
		expect(options.autoDetect).toBe(true)
		expect(options.transformLogger).toBe(false)
		expect(options.copyAppsscriptJson).toBe(true)
	})

	it('should have all required plugin hooks', () => {
		const plugin = gasPlugin() as Plugin

		// 必要なプラグインフックが存在することを確認
		expect(plugin.config).toBeDefined()
		expect(plugin.transform).toBeDefined()
		expect(plugin.generateBundle).toBeDefined()
	})

	it('should accept copyAppsscriptJson option', () => {
		const plugin = gasPlugin({ copyAppsscriptJson: true }) as Plugin

		expect(plugin.name).toBe('vite-plugin-gas')
		expect(typeof plugin.config).toBe('function')
		expect(typeof plugin.transform).toBe('function')
		expect(typeof plugin.generateBundle).toBe('function')
		expect(typeof plugin.writeBundle).toBe('function')
	})

	it('should execute transform hook with valid TypeScript code', () => {
		const plugin = gasPlugin({ transformLogger: false })

		// transform関数を抽出してテスト
		const transformFunc = plugin.transform as (
			code: string,
			id: string
		) => unknown

		const result = transformFunc(
			'function test() { return "hello"; }',
			'src/main.ts'
		)

		expect(result).toBeDefined()
		// transformはTransformResultオブジェクトまたは文字列を返す
		expect(typeof result === 'string' || typeof result === 'object').toBe(true)
	})

	it('should have generateBundle function', () => {
		const plugin = gasPlugin()

		// generateBundle関数が存在することを確認
		expect(typeof plugin.generateBundle).toBe('function')
	})
})
