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
				'examples/',
				'**/*.d.ts',
				'vitest.config.ts',
				'**/__mocks__/**',
				'**/__fixtures__/**',
			],
			// Enforce 90%+ coverage
			thresholds: {
				statements: 90,
				branches: 90,
				functions: 80, // Adjusted slightly lower for plugin hook functions in index.ts
				lines: 90,
			},
		},
	},
})
