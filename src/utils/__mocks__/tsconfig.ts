/**
 * TypeScript Configuration Mocks
 * Mock data for tsconfig.json used in pathAliasDetector.test.ts
 */

export const validTsConfigWithPaths = {
	compilerOptions: {
		baseUrl: '.',
		paths: {
			'@/*': ['src/*'],
			'@components/*': ['src/components/*'],
			'@utils/*': ['src/utils/*'],
		},
	},
}

export const tsConfigWithoutPaths = {
	compilerOptions: {
		baseUrl: '.',
		target: 'es5',
	},
}

export const tsConfigWithInvalidPaths = {
	compilerOptions: {
		baseUrl: '.',
		paths: {
			// Invalid path definitions
			'@': ['src'], // Array but correct format
			invalid: 'not-array', // Not an array
		},
	},
}

export const tsConfigWithoutBaseUrl = {
	compilerOptions: {
		paths: {
			'@/*': ['src/*'],
		},
	},
}

/**
 * Commonly used tsconfig.json patterns
 */
export const commonTsConfigs = {
	minimal: tsConfigWithoutPaths,
	withPaths: validTsConfigWithPaths,
	noBaseUrl: tsConfigWithoutBaseUrl,
	invalid: tsConfigWithInvalidPaths,
}
