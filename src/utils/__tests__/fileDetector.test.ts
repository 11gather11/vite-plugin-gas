import { readFileSync } from 'node:fs'
import { glob } from 'tinyglobby'
import { describe, expect, it, vi } from 'vitest'
import {
	detectTypeScriptFiles,
	generateEntryName,
	isEmpty,
} from '../fileDetector'

// Mock readFileSync and glob
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

		// Mock file list
		mockGlob.mockResolvedValueOnce([
			'src/main.ts',
			'src/empty.ts',
			'src/utils/helper.ts',
		])

		// Mock file contents
		mockReadFileSync
			.mockReturnValueOnce('console.log("main")') // main.ts - has content
			.mockReturnValueOnce('') // empty.ts - empty
			.mockReturnValueOnce('export const helper = () => {}') // helper.ts - has content

		const result = await detectTypeScriptFiles(['src'], ['**/*.test.ts'])

		// Empty files are skipped
		expect(Object.keys(result)).toHaveLength(2)
		// Check the actually generated keys
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

		// Empty file
		mockReadFileSync.mockReturnValueOnce('')
		expect(isEmpty('empty.ts')).toBe(true)

		// Comment-only file
		mockReadFileSync.mockReturnValueOnce(
			'// Comments only\n/* Block comment */'
		)
		expect(isEmpty('comment-only.ts')).toBe(true)

		// File with actual code
		mockReadFileSync.mockReturnValueOnce('const test = "value"')
		expect(isEmpty('with-code.ts')).toBe(false)

		// File read error case
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
