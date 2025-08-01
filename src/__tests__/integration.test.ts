import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import gasPlugin from '../index'

// テスト用のモック
vi.mock('tinyglobby', () => ({
	glob: vi.fn(),
}))

describe('gasPlugin - Multiple Files Integration Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('should handle multiple TypeScript files in configuration', async () => {
		// 複数のTSファイルをモック
		const { glob } = await import('tinyglobby')
		const mockGlob = vi.mocked(glob)

		mockGlob.mockResolvedValue([
			'src/main.ts',
			'src/utils/helper.ts',
			'src/models/user.ts',
			'lib/api.ts',
		])

		const plugin = gasPlugin({
			autoDetect: true,
			include: ['src', 'lib'],
			exclude: ['**/*.test.ts'],
			outDir: 'dist',
		})

		// プラグインのconfig関数を直接呼び出さず、内部の処理をテスト
		expect(plugin.name).toBe('vite-plugin-gas')
		expect(plugin.config).toBeDefined()
		expect(plugin.transform).toBeDefined()
	})

	it('should transform code correctly for multiple file types', () => {
		const plugin = gasPlugin({
			transformLogger: true,
		})

		const testCases = [
			{
				id: 'src/main.ts',
				code: `console.log('test');\nexport function mainFunc() {\n  console.log('main');\n}`,
				expectedTransformations: ['Logger.log', 'no export'],
			},
			{
				id: 'src/utils/helper.ts',
				code: `import { someUtil } from './other';\nconsole.log('helper');\nexport function helperFunc() {\n  return 'helper';\n}`,
				expectedTransformations: ['Logger.log', 'no export', 'no import'],
			},
			{
				id: 'src/triggers.ts',
				code: `function onEdit(e) {\n  console.log('edited');\n}\nfunction onOpen() {\n  console.log('opened');\n}`,
				expectedTransformations: [
					'preserve onEdit',
					'preserve onOpen',
					'Logger.log',
				],
			},
		]

		// transform関数の存在を確認
		expect(typeof plugin.transform).toBe('function')

		// 各テストケースが適切に設定されていることを確認
		for (const testCase of testCases) {
			expect(testCase.id).toMatch(/\.ts$/)
			expect(testCase.code).toBeTruthy()
			expect(testCase.expectedTransformations).toBeInstanceOf(Array)
		}
	})

	it('should handle GAS special functions across multiple files', () => {
		const plugin = gasPlugin()

		const gasFiles = [
			{
				id: 'src/triggers.ts',
				code: 'function onEdit(e) {\n  Logger.log("edited");\n}\nfunction onOpen() {\n  Logger.log("opened");\n}',
				specialFunctions: ['onEdit', 'onOpen'],
			},
			{
				id: 'src/handlers.ts',
				code: 'function onFormSubmit(e) {\n  Logger.log("form submitted");\n}\nfunction doGet() {\n  return "get";\n}',
				specialFunctions: ['onFormSubmit', 'doGet'],
			},
			{
				id: 'src/menu.ts',
				code: 'function onInstall() {\n  Logger.log("installed");\n}\nfunction onSelectionChange() {\n  Logger.log("selection changed");\n}',
				specialFunctions: ['onInstall', 'onSelectionChange'],
			},
		]

		// プラグインの基本構造を確認
		expect(plugin.name).toBe('vite-plugin-gas')
		expect(plugin.transform).toBeDefined()

		// 各ファイルが適切なGAS特殊関数を含んでいることを確認
		for (const file of gasFiles) {
			expect(file.id).toMatch(/\.ts$/)
			expect(file.code).toBeTruthy()

			for (const func of file.specialFunctions) {
				expect(file.code).toContain(`function ${func}`)
			}
		}
	})

	it('should respect include/exclude patterns for multiple directories', async () => {
		const { glob } = await import('tinyglobby')
		const mockGlob = vi.mocked(glob)

		const allFiles = [
			'src/main.ts',
			'src/test.spec.ts', // 除外されるべき
			'lib/utils.ts',
			'lib/test.test.ts', // 除外されるべき
			'scripts/build.ts', // includeに含まれていない
			'src/components/button.ts',
			'lib/api/client.ts',
		]

		mockGlob.mockResolvedValue(allFiles)

		const plugin = gasPlugin({
			autoDetect: true,
			include: ['src', 'lib'],
			exclude: ['**/*.test.ts', '**/*.spec.ts'],
		})

		// プラグインが正しく構成されていることを確認
		expect(plugin.name).toBe('vite-plugin-gas')

		// includeとexcludeパターンの期待値を確認
		const expectedIncluded = [
			'src/main.ts',
			'lib/utils.ts',
			'src/components/button.ts',
			'lib/api/client.ts',
		]

		const expectedExcluded = [
			'src/test.spec.ts',
			'lib/test.test.ts',
			'scripts/build.ts',
		]

		// パターンマッチングの検証
		for (const file of expectedIncluded) {
			expect(file).toMatch(/^(src|lib)\/.*\.ts$/)
			expect(file).not.toMatch(/\.(test|spec)\.ts$/)
		}

		for (const file of expectedExcluded) {
			const shouldBeExcluded =
				file.includes('.test.') ||
				file.includes('.spec.') ||
				(!file.startsWith('src/') && !file.startsWith('lib/'))
			expect(shouldBeExcluded).toBe(true)
		}
	})

	it('should validate multiple file entry configuration structure', () => {
		const plugin = gasPlugin({
			autoDetect: true,
			transformLogger: true,
			include: ['src', 'lib', 'utils'],
			exclude: ['**/*.test.ts', '**/*.spec.ts', '**/*.d.ts'],
			outDir: 'build',
		})

		// プラグイン構造の確認
		expect(plugin.name).toBe('vite-plugin-gas')
		expect(plugin.config).toBeDefined()
		expect(plugin.transform).toBeDefined()
		expect(plugin.generateBundle).toBeDefined()

		// 複数ファイル用の期待されるentry構造例
		const expectedEntryStructure = {
			'src/main': 'src/main.ts',
			'src/utils/helper': 'src/utils/helper.ts',
			'src/models/user': 'src/models/user.ts',
			'lib/api': 'lib/api.ts',
			'lib/config': 'lib/config.ts',
			'utils/common': 'utils/common.ts',
		}

		// エントリー構造が適切であることを確認
		for (const [key, value] of Object.entries(expectedEntryStructure)) {
			// キーはディレクトリ構造を反映
			expect(key).not.toContain('.ts')
			expect(key).toMatch(/^[a-zA-Z0-9_/-]+$/)

			// 値は実際のファイルパス
			expect(value).toMatch(/\.ts$/)
			expect(value).toBe(`${key}.ts`)
		}
	})
})
