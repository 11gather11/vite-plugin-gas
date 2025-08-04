import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import gasPlugin from '../index'

// Mock for copyAppsscriptJson
vi.mock('../utils/appsscriptCopier', () => ({
	copyAppsscriptJson: vi.fn(),
}))

describe('gasPlugin - writeBundle Hook Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('should have writeBundle hook when copyAppsscriptJson is enabled', () => {
		const plugin = gasPlugin({
			copyAppsscriptJson: true,
			outDir: 'dist',
		})

		expect(typeof plugin.writeBundle).toBe('function')
	})

	it('should have writeBundle hook when copyAppsscriptJson is disabled', () => {
		const plugin = gasPlugin({
			copyAppsscriptJson: false,
			outDir: 'dist',
		})

		expect(typeof plugin.writeBundle).toBe('function')
	})

	it('should have writeBundle hook when copyAppsscriptJson is undefined', () => {
		const plugin = gasPlugin({
			outDir: 'dist',
		})

		expect(typeof plugin.writeBundle).toBe('function')
	})

	it('should call copyAppsscriptJson with correct parameters', async () => {
		const { copyAppsscriptJson } = await import('../utils/appsscriptCopier')
		const mockCopyAppsscriptJson = vi.mocked(copyAppsscriptJson)

		const plugin = gasPlugin({
			copyAppsscriptJson: true,
			outDir: 'build',
		})

		// Execute writeBundle function directly
		if (typeof plugin.writeBundle === 'function') {
			plugin.writeBundle.call({} as never, {} as never, {} as never)
		}

		expect(mockCopyAppsscriptJson).toHaveBeenCalledTimes(1)
		expect(mockCopyAppsscriptJson).toHaveBeenCalledWith(process.cwd(), 'build')
	})

	it('should not call copyAppsscriptJson when disabled', async () => {
		const { copyAppsscriptJson } = await import('../utils/appsscriptCopier')
		const mockCopyAppsscriptJson = vi.mocked(copyAppsscriptJson)

		const plugin = gasPlugin({
			copyAppsscriptJson: false,
			outDir: 'build',
		})

		// Execute writeBundle function directly
		if (typeof plugin.writeBundle === 'function') {
			plugin.writeBundle.call({} as never, {} as never, {} as never)
		}

		expect(mockCopyAppsscriptJson).not.toHaveBeenCalled()
	})

	it('should use default outDir when not specified', async () => {
		const { copyAppsscriptJson } = await import('../utils/appsscriptCopier')
		const mockCopyAppsscriptJson = vi.mocked(copyAppsscriptJson)

		const plugin = gasPlugin({
			copyAppsscriptJson: true,
		})

		// Execute writeBundle function directly
		if (typeof plugin.writeBundle === 'function') {
			plugin.writeBundle.call({} as never, {} as never, {} as never)
		}

		expect(mockCopyAppsscriptJson).toHaveBeenCalledWith(process.cwd(), 'dist')
	})
})
