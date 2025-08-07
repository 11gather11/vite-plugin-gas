import { resolve } from 'node:path'
import type { UserConfig } from 'vite'
import type { GasPluginOptions } from '../types'
import { logger } from './logger'
import { autoDetectPathAliases } from './pathAliasDetector'

/**
 * Automatic path alias configuration
 */
function ensurePathAliases(
	config: UserConfig,
	options: Required<GasPluginOptions>
): void {
	if (!options.enablePathAliases) {
		return
	}

	if (!config.resolve) {
		config.resolve = {}
	}

	// Respect existing user alias configuration and add missing ones
	if (!config.resolve.alias) {
		config.resolve.alias = {}
	}

	const aliases = config.resolve.alias as Record<string, string>

	let detectedAliases: Record<string, string> = {}

	// Execute only when auto-detection is enabled
	if (options.autoDetectPathAliases) {
		detectedAliases = autoDetectPathAliases(process.cwd(), config)

		// Apply auto-detected aliases (don't override existing settings)
		for (const [key, value] of Object.entries(detectedAliases)) {
			if (!aliases[key]) {
				aliases[key] = resolve(process.cwd(), value.replace('./', ''))
			}
		}
	}

	// Set default path aliases (when no existing settings or auto-detection)
	for (const [key, value] of Object.entries(options.pathAliases)) {
		if (!aliases[key]) {
			aliases[key] = resolve(process.cwd(), value.replace('./', ''))
		}
	}
}

/**
 * Apply Vite configuration for GAS
 */
export function applyGasViteConfig(
	config: UserConfig,
	entryFiles: Record<string, string>,
	outputDir: string,
	options?: Required<GasPluginOptions>
): void {
	// Auto-configure path aliases
	if (options) {
		ensurePathAliases(config, options)
	}

	// Auto-configure rollupOptions
	config.build = config.build || {}
	config.build.rollupOptions = config.build.rollupOptions || {}
	config.build.rollupOptions.input = entryFiles

	// GAS configuration: output each file as independent chunks
	const outputOptions = {
		...config.build.rollupOptions.output,
		entryFileNames: '[name].js',
		chunkFileNames: '[name].js',
		format: 'es' as const, // Output in ES module format (import/export removed by transformation)
	}

	// Remove manualChunks to disable chunk splitting
	if (typeof outputOptions === 'object' && 'manualChunks' in outputOptions) {
		delete outputOptions.manualChunks
	}

	config.build.rollupOptions.output = outputOptions

	// Configuration for processing each entry file independently
	// Internalize path alias modules, don't externalize node_modules
	config.build.rollupOptions.external = (id: string) => {
		// Internalize path aliases (starting with @/)
		if (id.startsWith('@/')) return false
		// Internalize relative/absolute paths
		if (id.startsWith('.') || id.startsWith('/')) return false
		// Internalize others (node_modules, etc.) for bundling
		return false
	}
	config.build.rollupOptions.treeshake = false // Disable treeshaking to prevent code removal
	config.build.rollupOptions.preserveEntrySignatures = 'strict'

	// Disable library mode and process as normal application build
	config.build.lib = false
	config.build.outDir = outputDir
	config.build.minify = false // Disable minification
	config.build.target = 'es2017' // Target for modern GAS compatibility (supports arrow functions)
	config.build.sourcemap = false // Disable sourcemap

	// esbuild configuration (TypeScript transformation)
	config.esbuild = config.esbuild || {}
	config.esbuild.target = 'es2017' // Transform TypeScript to es2017 (plugin handles arrow functions)
	config.esbuild.format = 'esm'
}

/**
 * Log detected files
 */
export function logDetectedFiles(entryFiles: Record<string, string>): void {
	const count = Object.keys(entryFiles).length
	logger.success(`Auto-detected ${count} TypeScript files`)

	if (process.env.VERBOSE) {
		Object.keys(entryFiles).forEach((name) => {
			logger.verbose(`  - ${name}: ${entryFiles[name]}`)
		})
	}
}
