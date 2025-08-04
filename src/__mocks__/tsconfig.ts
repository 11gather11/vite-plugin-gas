/**
 * TypeScript Configuration Mocks
 * pathAliasDetector.test.tsで使用されるtsconfig.jsonのモックデータ
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
			// 無効なパス定義
			'@': ['src'], // 配列だが正しい形式
			invalid: 'not-array', // 配列ではない
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
 * よく使用されるtsconfig.jsonパターン
 */
export const commonTsConfigs = {
	minimal: tsConfigWithoutPaths,
	withPaths: validTsConfigWithPaths,
	noBaseUrl: tsConfigWithoutBaseUrl,
	invalid: tsConfigWithInvalidPaths,
}
