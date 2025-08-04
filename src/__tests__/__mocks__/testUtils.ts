/**
 * 共通テストユーティリティ
 * 型アサーション(as)を使わないクリーンなテストヘルパー
 */

import type { Plugin } from 'vite'
import type { GasPluginOptions } from '../../types'

/**
 * プラグインインスタンスの型安全な検証
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
 * プラグインの必須プロパティを検証
 */
export function validatePluginProperties(plugin: Plugin) {
	const errors: string[] = []

	if (!plugin.name) {
		errors.push('Plugin name is required')
	}

	// buildStartは必須ではない（configやtransformがあれば十分）
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
 * プラグインのtransformフックを安全に抽出
 */
export function extractTransformHook(plugin: Plugin) {
	if (!plugin.transform) return null

	// transform がオブジェクト形式の場合
	if (typeof plugin.transform === 'object' && 'handler' in plugin.transform) {
		return plugin.transform.handler
	}

	// transform が関数の場合
	if (typeof plugin.transform === 'function') {
		return plugin.transform
	}

	return null
}

/**
 * 設定オプションのデフォルト値を検証
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
 * ファイル内容の変換を検証
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
 * 非同期処理のテストヘルパー
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
