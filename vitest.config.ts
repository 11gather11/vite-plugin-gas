import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'dist/',
				'tests/',
				'scripts/',
				'**/*.d.ts',
				'vitest.config.ts',
			],
			// 90%以上のカバレッジを強制
			thresholds: {
				statements: 90,
				branches: 90,
				functions: 80, // index.tsのプラグインフック関数でやや低めに調整
				lines: 90,
			},
		},
	},
})
