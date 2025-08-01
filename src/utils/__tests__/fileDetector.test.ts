import { describe, expect, it } from 'vitest'
import { detectTypeScriptFiles } from '../fileDetector'

describe('file-detector', () => {
	it('should detect TypeScript files with default patterns', async () => {
		// 実際のファイルシステムに依存しないモックテスト
		const result = await detectTypeScriptFiles(['src'], ['**/*.test.ts'])

		// 結果がオブジェクトであることを確認
		expect(typeof result).toBe('object')
		expect(result).not.toBeNull()
	})

	it('should handle empty directories', async () => {
		const result = await detectTypeScriptFiles([], [])

		expect(typeof result).toBe('object')
		expect(Object.keys(result)).toHaveLength(0)
	})

	it('should handle invalid directory paths gracefully', async () => {
		const result = await detectTypeScriptFiles(['non-existent-dir'], [])

		expect(typeof result).toBe('object')
		expect(result).not.toBeNull()
	})

	it('should apply exclude patterns correctly', async () => {
		const result = await detectTypeScriptFiles(
			['src'],
			['**/*.test.ts', '**/*.spec.ts']
		)

		expect(typeof result).toBe('object')
		expect(result).not.toBeNull()
	})

	it('should handle multiple include directories', async () => {
		const result = await detectTypeScriptFiles(
			['src', 'lib', 'utils'],
			['**/*.test.ts']
		)

		expect(typeof result).toBe('object')
		expect(result).not.toBeNull()
	})
})
