import { describe, expect, it } from 'vitest'
import gasPlugin from '../index'

// テスト用のモックコンテキスト
const createMockContext = () => ({
	addWatchFile: () => {},
	cache: new Map(),
	emitFile: () => '',
	error: () => {},
	getCombinedSourcemap: () => null,
	getFileName: () => '',
	getModuleIds: () => [],
	getModuleInfo: () => null,
	getWatchFiles: () => [],
	load: () => null,
	meta: { rollupVersion: '4.0.0', watchMode: false },
	moduleIds: [][Symbol.iterator](),
	parse: () => ({}),
	resolve: () => null,
	setAssetSource: () => {},
	warn: () => {},
	debug: () => {},
	info: () => {},
	fs: {} as Record<string, unknown>,
	environment: {} as Record<string, unknown>,
})

describe('gasPlugin - Transform Tests', () => {
	it('should transform JavaScript files (post-compilation) correctly', () => {
		const plugin = gasPlugin({
			transformLogger: true,
		})

		const testCases = [
			{
				id: 'src/main.js', // JavaScriptファイル（TypeScriptから変換後）
				input: `import { helper } from './utils/helper.js';
import * as api from './api.js';

export function main() {
	console.log('Starting application');
	helper.init();
	return api.getData();
}

export default main;`,
				expected: `function main() {
	Logger.log('Starting application');
	helper.init();
	return api.getData();
}

main;`,
			},
			{
				id: 'src/gas-functions.js',
				input: `import { config } from './config.js';

export function onEdit(e) {
	console.log('Edit detected');
	config.handleEdit(e);
}

export function onOpen() {
	console.warn('Spreadsheet opened');
}`,
				expected: `/* @preserve onEdit */ function onEdit(e) {
	Logger.log('Edit detected');
	config.handleEdit(e);
}

/* @preserve onOpen */ function onOpen() {
	Logger.warn('Spreadsheet opened');
}`,
			},
		]

		for (const testCase of testCases) {
			// プラグインのtransform関数を呼び出し
			const transformFunction = plugin.transform
			if (typeof transformFunction === 'function') {
				const mockContext = createMockContext()
				const result = transformFunction.call(
					mockContext,
					testCase.input,
					testCase.id
				)
				expect(result).toBeDefined()
				if (result && typeof result === 'object' && 'code' in result) {
					const normalizedResult = result.code?.trim().replace(/\s+/g, ' ')
					const normalizedExpected = testCase.expected
						.trim()
						.replace(/\s+/g, ' ')
					expect(normalizedResult).toBe(normalizedExpected)
				}
			}
		}
	})

	it('should not transform TypeScript files (handled by esbuild)', () => {
		const plugin = gasPlugin({
			transformLogger: true,
		})

		const tsCode = `import { helper } from './utils/helper';
export function main() {
	console.log('Starting application');
	return helper.process();
}`

		const transformFunction = plugin.transform
		if (typeof transformFunction === 'function') {
			const mockContext = createMockContext()
			const result = transformFunction.call(mockContext, tsCode, 'src/main.ts')
			// TypeScriptファイルは変換しない（nullを返す）
			expect(result).toBe(null)
		}
	})

	it('should skip node_modules files', () => {
		const plugin = gasPlugin({
			transformLogger: true,
		})

		const jsCode = `import { something } from 'external';
export function external() {
	console.log('external');
}`

		const transformFunction = plugin.transform
		if (typeof transformFunction === 'function') {
			const mockContext = createMockContext()
			const result = transformFunction.call(
				mockContext,
				jsCode,
				'node_modules/package/index.js'
			)
			// node_modulesファイルは変換しない（nullを返す）
			expect(result).toBe(null)
		}
	})
})
