import type { UserConfig } from 'vite'
import type { GasPluginOptions } from '../types'
import { DEFAULT_OPTIONS } from '../types'
import { detectTypeScriptFiles } from '../utils/fileDetector'
import { applyGasViteConfig, logDetectedFiles } from '../utils/viteConfig'

/**
 * Plugin configuration processor
 */
export class GasConfigProcessor {
	private readonly mergedOptions: Required<GasPluginOptions>

	constructor(options: GasPluginOptions = {}) {
		this.mergedOptions = { ...DEFAULT_OPTIONS, ...options }
	}

	/**
	 * Process Vite configuration
	 */
	async processConfig(config: UserConfig): Promise<void> {
		// Automatically add TypeScript support
		this.ensureTypeScriptSupport(config)

		if (!this.mergedOptions.autoDetect) {
			return
		}

		// Auto-detect TypeScript files
		const entryFiles = await detectTypeScriptFiles(
			this.mergedOptions.include,
			this.mergedOptions.exclude
		)

		if (Object.keys(entryFiles).length === 0) {
			console.warn(
				'[vite-plugin-gas] No TypeScript files found for auto-detection'
			)
			return
		}

		// Apply Vite configuration
		applyGasViteConfig(
			config,
			entryFiles,
			this.mergedOptions.outDir,
			this.mergedOptions
		)

		// Log detected files
		logDetectedFiles(entryFiles)
	}

	/**
	 * Ensure TypeScript support
	 */
	private ensureTypeScriptSupport(config: UserConfig): void {
		// Initialize plugins if not configured
		if (!config.plugins) {
			config.plugins = []
		}

		// Convert to plugin array
		const plugins = Array.isArray(config.plugins)
			? config.plugins
			: [config.plugins]

		// Check if TypeScript-related plugins already exist
		const hasTypeScriptPlugin = plugins.some((plugin) => {
			if (!plugin || typeof plugin !== 'object') return false
			const pluginName = 'name' in plugin ? plugin.name : ''
			return (
				pluginName === 'vite:esbuild' ||
				pluginName === 'typescript' ||
				pluginName === 'rollup-plugin-typescript2'
			)
		})

		if (!hasTypeScriptPlugin) {
			console.log(
				"[vite-plugin-gas] TypeScript support is handled by Vite's built-in esbuild integration"
			)
		}

		// Apply Vite's standard TypeScript configuration
		config.esbuild = config.esbuild || {}
		config.esbuild.target = config.esbuild.target || 'es2017'
	}

	/**
	 * Get options
	 */
	get options(): Required<GasPluginOptions> {
		return this.mergedOptions
	}
}
