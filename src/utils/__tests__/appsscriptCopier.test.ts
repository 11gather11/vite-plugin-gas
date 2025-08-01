import * as fs from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copyAppsscriptJson } from '../appsscriptCopier'

// ファイルシステムをモック
vi.mock('node:fs', () => ({
	existsSync: vi.fn(),
	mkdirSync: vi.fn(),
	copyFileSync: vi.fn(),
}))

describe('appsscriptCopier', () => {
	const mockFs = vi.mocked(fs)

	beforeEach(() => {
		vi.clearAllMocks()
		// console.log/warn/error をモック
		vi.spyOn(console, 'log').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.clearAllMocks()
	})

	it('should copy appsscript.json when it exists', () => {
		// appsscript.jsonが存在し、出力ディレクトリも存在する場合
		mockFs.existsSync.mockImplementation((path) => {
			const pathStr = path.toString()
			return pathStr.includes('appsscript.json') || pathStr.includes('dist')
		})

		copyAppsscriptJson('/project', 'dist')

		expect(mockFs.copyFileSync).toHaveBeenCalled()
		expect(console.log).toHaveBeenCalledWith(
			'[vite-plugin-gas] appsscript.json has been copied to dist folder'
		)
	})

	it('should create output directory if it does not exist', () => {
		// appsscript.jsonは存在するが、出力ディレクトリが存在しない場合
		mockFs.existsSync.mockImplementation((path) => {
			const pathStr = path.toString()
			if (pathStr.includes('appsscript.json')) return true
			if (pathStr.includes('dist')) return false
			return false
		})

		copyAppsscriptJson('/project', 'dist')

		expect(mockFs.mkdirSync).toHaveBeenCalledWith(
			expect.stringContaining('dist'),
			{ recursive: true }
		)
		expect(mockFs.copyFileSync).toHaveBeenCalled()
	})

	it('should warn when appsscript.json does not exist', () => {
		// appsscript.jsonが存在しない場合
		mockFs.existsSync.mockReturnValue(false)

		copyAppsscriptJson('/project', 'dist')

		expect(mockFs.copyFileSync).not.toHaveBeenCalled()
		expect(console.warn).toHaveBeenCalledWith(
			'[vite-plugin-gas] appsscript.json not found in project root. Skipping copy.'
		)
	})

	it('should handle copy errors gracefully', () => {
		// ファイルコピー時にエラーが発生する場合
		mockFs.existsSync.mockReturnValue(true)
		mockFs.copyFileSync.mockImplementation(() => {
			throw new Error('Permission denied')
		})

		copyAppsscriptJson('/project', 'dist')

		expect(console.error).toHaveBeenCalledWith(
			'[vite-plugin-gas] Failed to copy appsscript.json:',
			expect.any(Error)
		)
	})

	it('should handle directory creation errors gracefully', () => {
		// ディレクトリ作成時にエラーが発生する場合
		mockFs.existsSync.mockImplementation((path) => {
			const pathStr = path.toString()
			if (pathStr.includes('appsscript.json')) return true
			if (pathStr.includes('dist')) return false
			return false
		})

		mockFs.mkdirSync.mockImplementation(() => {
			throw new Error('Permission denied')
		})

		copyAppsscriptJson('/project', 'dist')

		expect(console.error).toHaveBeenCalledWith(
			'[vite-plugin-gas] Failed to copy appsscript.json:',
			expect.any(Error)
		)
	})
})
