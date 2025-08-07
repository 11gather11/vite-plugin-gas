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
			// Balanced coverage thresholds based on actual achievable levels
			thresholds: {
				statements: 90, // Good coverage for executed code
				branches: 85, // Realistic for error handling branches
				functions: 90, // Most functions should be tested
				lines: 90, // Good line coverage target
			},
		},
	},
})
