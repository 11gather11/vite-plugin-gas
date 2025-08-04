/**
 * Common test utilities
 * Clean test helpers without type assertions (as)
 */

import type { Plugin } from 'vite'
import type { GasPluginOptions } from '../../types'

/**
 * Type-safe validation for plugin instances
 */
export function validatePluginInstance(plugin: unknown): plugin is Plugin {
	return (
		typeof plugin === 'object' &&
		plugin !== null &&
		'name' in plugin &&
		typeof (plugin as Record<string, unknown>).name === 'string'
	)
}

/**
 * Validate required properties of the plugin
 */
export function validatePluginProperties(plugin: Plugin) {
	const errors: string[] = []

	if (!plugin.name) {
		errors.push('Plugin name is required')
	}

	// buildStart is not required (config or transform is sufficient)
	const hasHooks =
		plugin.config ||
		plugin.transform ||
		plugin.writeBundle ||
		plugin.generateBundle

	if (!hasHooks) {
		errors.push('At least one plugin hook is required')
	}

	return errors
}

/**
 * Safely extract the transform hook from the plugin
 */
export function extractTransformHook(plugin: Plugin) {
	if (!plugin.transform) return null

	// When transform is in object format
	if (typeof plugin.transform === 'object' && 'handler' in plugin.transform) {
		return plugin.transform.handler
	}

	// When transform is a function
	if (typeof plugin.transform === 'function') {
		return plugin.transform
	}

	return null
}

/**
 * Validate default values of configuration options
 */
export function validateDefaultOptions(options: GasPluginOptions) {
	const expected = {
		autoDetect: true,
		include: ['src'],
		exclude: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'],
		outDir: 'dist',
		transformLogger: true,
		copyAppsscriptJson: true,
		enablePathAliases: true,
		autoDetectPathAliases: true,
	}

	const differences: string[] = []

	for (const [key, expectedValue] of Object.entries(expected)) {
		const actualValue = options[key as keyof GasPluginOptions]
		if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
			differences.push(
				`${key}: expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actualValue)}`
			)
		}
	}

	return differences
}

/**
 * Validate file content transformation
 */
export function validateTransformation(
	input: string,
	output: string,
	expectations: {
		shouldRemoveImports?: boolean
		shouldRemoveExports?: boolean
		shouldTransformLogger?: boolean
		shouldPreserveContent?: boolean
	}
) {
	const results = {
		importsRemoved: !output.includes('import '),
		exportsRemoved: !output.includes('export '),
		loggerTransformed: output.includes('Logger.log'),
		contentPreserved: output.includes(
			input.replace(/import.*?\n|export.*?\n/g, '').trim()
		),
	}

	const errors: string[] = []

	if (expectations.shouldRemoveImports && !results.importsRemoved) {
		errors.push('Expected imports to be removed')
	}

	if (expectations.shouldRemoveExports && !results.exportsRemoved) {
		errors.push('Expected exports to be removed')
	}

	if (expectations.shouldTransformLogger && !results.loggerTransformed) {
		errors.push('Expected console.log to be transformed to Logger.log')
	}

	if (expectations.shouldPreserveContent && !results.contentPreserved) {
		errors.push('Expected content to be preserved')
	}

	return { results, errors }
}

/**
 * Test helper for async processing
 */
export async function safeAsyncTest<T>(
	testFn: () => Promise<T>,
	errorMessage = 'Async test failed'
): Promise<{ success: boolean; result?: T; error?: Error }> {
	try {
		const result = await testFn()
		return { success: true, result }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error(errorMessage),
		}
	}
}
