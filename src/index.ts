import type { Plugin } from 'vite'
import { GasConfigProcessor } from './core/gasConfigProcessor'
import { GasTransformer } from './core/gasTransformer'
import type { GasPluginOptions } from './types'
import { copyAppsscriptJson } from './utils/appsscriptCopier'

/**
 * Vite plugin for Google Apps Script
 */
function gasPlugin(options: GasPluginOptions = {}): Plugin {
	const configProcessor = new GasConfigProcessor(options)
	const transformer = new GasTransformer(configProcessor.options)

	return {
		name: 'vite-plugin-gas',
		// Specify order to run after TypeScript plugin
		enforce: 'post',

		async config(config) {
			await configProcessor.processConfig(config)
		},

		transform(code, id) {
			return transformer.transform(code, id)
		},

		generateBundle(_options, bundle) {
			// The bundle passed from Vite has proper types
			// Type checking is performed within GasTransformer
			transformer.generateBundle(bundle)
		},

		writeBundle() {
			// Copy appsscript.json
			if (configProcessor.options.copyAppsscriptJson) {
				copyAppsscriptJson(
					process.cwd(),
					configProcessor.options.outDir || 'dist'
				)
			}
		},
	}
}

// Default export
export default gasPlugin

// Export type definitions as well
export type { GasPluginOptions } from './types'
