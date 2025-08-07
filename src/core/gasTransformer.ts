import type { TransformResult } from 'vite'
import type { GasPluginOptions } from '../types'
import {
	preserveGasFunctions,
	removeModuleStatements,
	transformArrowFunctions,
	transformLogger,
} from '../utils/codeTransformer'

/**
 * TypeScript file transformation for GAS
 */
export class GasTransformer {
	private readonly options: GasPluginOptions

	constructor(options: GasPluginOptions) {
		this.options = options
	}

	/**
	 * Transform file (for post-transform hook)
	 */
	transform(code: string, id: string): TransformResult | null {
		// Only process .js files (already converted from TypeScript)
		// Vite's esbuild has already completed TypeScript→JavaScript conversion
		if (!id.endsWith('.js') || id.includes('node_modules')) return null

		let transformedCode = code

		// Remove import/export statements
		transformedCode = removeModuleStatements(transformedCode)

		// Transform console.log to Logger.log (when option is enabled)
		if (this.options.transformLogger) {
			transformedCode = transformLogger(transformedCode)
		}

		// Preserve GAS special functions
		transformedCode = preserveGasFunctions(transformedCode)

		return {
			code: transformedCode,
			map: null,
		}
	}

	/**
	 * Preserve GAS special functions during bundle generation
	 * Bundle type is properly handled at runtime
	 */
	generateBundle(bundle: Record<string, unknown>): void {
		Object.keys(bundle).forEach((fileName) => {
			const chunk = bundle[fileName] as {
				type?: string
				code?: string
				[key: string]: unknown
			}

			// Check if chunk is an output chunk that contains code
			if (
				chunk &&
				chunk.type === 'chunk' &&
				fileName.endsWith('.js') &&
				typeof chunk.code === 'string'
			) {
				// Apply GAS-specific transformations
				chunk.code = transformArrowFunctions(chunk.code)
				chunk.code = preserveGasFunctions(chunk.code)
				chunk.code = removeModuleStatements(chunk.code)

				if (this.options.transformLogger) {
					chunk.code = transformLogger(chunk.code)
				}
			}
		})
	}
}
