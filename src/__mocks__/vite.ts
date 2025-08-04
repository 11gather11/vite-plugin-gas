/**
 * Vite Plugin Context Mock
 * 現在transform.test.tsで重複している`createMockContext`を共通化
 */
import { vi } from 'vitest'

export function createMockViteContext() {
	return {
		// 必要最小限のViteプラグインコンテキスト
		resolve: vi.fn(),
		load: vi.fn(),
		transform: vi.fn(),
		generateBundle: vi.fn(),
		writeBundle: vi.fn(),
		// 追加で必要になるプロパティはここに追加
	}
}

/**
 * Vite設定のモック
 */
export function createMockViteConfig(overrides = {}) {
	return {
		root: process.cwd(),
		resolve: {
			alias: {},
		},
		build: {
			outDir: 'dist',
			rollupOptions: {
				input: {},
			},
		},
		...overrides,
	}
}
