import type { Plugin } from 'vite'
import { GasConfigProcessor } from './core/gasConfigProcessor'
import { GasTransformer } from './core/gasTransformer'
import type { GasPluginOptions } from './types'

/**
 * Google Apps Script用のViteプラグイン
 */
function gasPlugin(options: GasPluginOptions = {}): Plugin {
	const configProcessor = new GasConfigProcessor(options)
	const transformer = new GasTransformer(configProcessor.options)

	return {
		name: 'vite-plugin-gas',

		async config(config) {
			await configProcessor.processConfig(config)
		},

		transform(code, id) {
			return transformer.transform(code, id)
		},

		generateBundle(_options, bundle) {
			// Viteから渡されるbundleは適切な型を持っているので
			// 型チェックはGasTransformer内で行う
			transformer.generateBundle(bundle)
		},
	}
}

// デフォルトエクスポート
export default gasPlugin

// 型定義もエクスポート
export type { GasPluginOptions } from './types'
