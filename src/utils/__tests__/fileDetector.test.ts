import { readFileSync } from 'node:fs'
import { glob } from 'tinyglobby'
import { describe, expect, it, vi } from 'vitest'
import {
	detectTypeScriptFiles,
	generateEntryName,
	isEmpty,
} from '../fileDetector'

// readFileSyncとglobをモック
vi.mock('node:fs', () => ({
	readFileSync: vi.fn(),
}))

vi.mock('tinyglobby', () => ({
	glob: vi.fn(),
}))

describe('file-detector', () => {
	it('should detect TypeScript files and skip empty ones', async () => {
		const mockGlob = vi.mocked(glob)
		const mockReadFileSync = vi.mocked(readFileSync)

		// モックファイルリスト
		mockGlob.mockResolvedValueOnce([
			'src/main.ts',
			'src/empty.ts',
			'src/utils/helper.ts',
		])

		// ファイル内容をモック
		mockReadFileSync
			.mockReturnValueOnce('console.log("main")') // main.ts - 内容あり
			.mockReturnValueOnce('') // empty.ts - 空
			.mockReturnValueOnce('export const helper = () => {}') // helper.ts - 内容あり

		const result = await detectTypeScriptFiles(['src'], ['**/*.test.ts'])

		// 空のファイルはスキップされる
		expect(Object.keys(result)).toHaveLength(2)
		// 実際に生成されたキーをチェック
		const keys = Object.keys(result)
		expect(keys).toContain('main')
		expect(keys).toContain('utils_helper')
		expect(keys).not.toContain('empty')
	})

	it('should handle glob errors gracefully', async () => {
		const mockGlob = vi.mocked(glob)

		// globがエラーを投げる
		mockGlob.mockRejectedValueOnce(new Error('Glob error'))

		const result = await detectTypeScriptFiles(['src'], [])

		expect(result).toEqual({})
	})
	it('should handle empty directories', async () => {
		const mockGlob = vi.mocked(glob)
		mockGlob.mockResolvedValueOnce([])

		const result = await detectTypeScriptFiles([], [])

		expect(typeof result).toBe('object')
		expect(Object.keys(result)).toHaveLength(0)
	})

	it('should apply exclude patterns correctly', async () => {
		const mockGlob = vi.mocked(glob)
		const mockReadFileSync = vi.mocked(readFileSync)

		mockGlob.mockResolvedValueOnce(['src/main.ts'])
		mockReadFileSync.mockReturnValueOnce('const main = "test"')

		const result = await detectTypeScriptFiles(
			['src'],
			['**/*.test.ts', '**/*.spec.ts']
		)

		expect(typeof result).toBe('object')
		const keys = Object.keys(result)
		expect(keys).toContain('main')
	})

	it('should check if file is empty correctly', () => {
		const mockReadFileSync = vi.mocked(readFileSync)

		// 空のファイル
		mockReadFileSync.mockReturnValueOnce('')
		expect(isEmpty('empty.ts')).toBe(true)

		// コメントのみのファイル
		mockReadFileSync.mockReturnValueOnce(
			'// コメントのみ\n/* ブロックコメント */'
		)
		expect(isEmpty('comment-only.ts')).toBe(true)

		// 実際のコードがあるファイル
		mockReadFileSync.mockReturnValueOnce('const test = "value"')
		expect(isEmpty('with-code.ts')).toBe(false)

		// ファイル読み込みエラーの場合
		mockReadFileSync.mockImplementationOnce(() => {
			throw new Error('File not found')
		})
		expect(isEmpty('non-existent.ts')).toBe(true)
	})

	it('should generate entry names correctly', () => {
		expect(generateEntryName('src/main.ts', 'src')).toBe('main')
		expect(generateEntryName('src/utils/helper.ts', 'src')).toBe('utils_helper')
		expect(generateEntryName('src/deep/nested/file.ts', 'src')).toBe(
			'deep_nested_file'
		)
	})
})
