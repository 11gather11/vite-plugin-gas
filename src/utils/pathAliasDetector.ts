import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { UserConfig } from 'vite'

/**
 * tsconfig.jsonからパスエイリアスを自動検出
 */
export function detectPathAliasesFromTsConfig(
	rootDir: string = process.cwd()
): Record<string, string> {
	const aliases: Record<string, string> = {}

	try {
		const tsconfigPath = resolve(rootDir, 'tsconfig.json')
		const tsconfigContent = readFileSync(tsconfigPath, 'utf-8')

		// JSONのコメントを削除してパース
		const jsonContent = tsconfigContent.replace(
			/\/\*[\s\S]*?\*\/|\/\/.*$/gm,
			''
		)
		const tsconfig = JSON.parse(jsonContent)

		// compilerOptions.paths からパスマッピングを取得
		const paths = tsconfig?.compilerOptions?.paths
		if (paths && typeof paths === 'object') {
			const baseUrl = tsconfig?.compilerOptions?.baseUrl || '.'

			for (const [alias, pathArray] of Object.entries(paths)) {
				if (Array.isArray(pathArray) && pathArray.length > 0) {
					// TypeScriptのパス形式からVite形式に変換
					const aliasKey = alias.replace('/*', '')
					let aliasPath = pathArray[0]

					// /*パターンを削除
					if (aliasPath.endsWith('/*')) {
						aliasPath = aliasPath.slice(0, -2)
					}

					// *のみの場合は空文字列にする
					if (aliasPath === '*') {
						aliasPath = ''
					}

					// baseUrlを考慮したパス解決
					if (!aliasPath.startsWith('/') && !aliasPath.startsWith('./')) {
						if (baseUrl === '.') {
							aliasPath = aliasPath ? `./${aliasPath}` : './'
						} else {
							aliasPath = aliasPath
								? `./${baseUrl}/${aliasPath}`.replace(/\/+/g, '/')
								: `./${baseUrl}`
						}
					} else if (aliasPath === '') {
						// 空のパスの場合はbaseUrlを使用
						aliasPath = baseUrl === '.' ? './' : `./${baseUrl}`
					}

					// 相対パスに正規化
					if (aliasPath === '.') {
						aliasPath = './'
					} else if (
						!aliasPath.startsWith('./') &&
						!aliasPath.startsWith('/')
					) {
						aliasPath = `./${aliasPath}`
					}

					aliases[aliasKey] = aliasPath
				}
			}
		}
	} catch (error) {
		console.warn(
			'[vite-plugin-gas] Could not read tsconfig.json for path aliases:',
			error
		)
	}

	return aliases
}

/**
 * Viteの既存設定からパスエイリアスを検出
 */
export function detectExistingPathAliases(
	config: UserConfig
): Record<string, string> {
	const aliases: Record<string, string> = {}

	try {
		const existingAliases = config?.resolve?.alias
		if (existingAliases && typeof existingAliases === 'object') {
			Object.assign(aliases, existingAliases)
		}
	} catch (error) {
		console.warn(
			'[vite-plugin-gas] Could not detect existing path aliases:',
			error
		)
	}

	return aliases
}

/**
 * 一般的なプロジェクト構造からパスエイリアスを推測
 */
export function detectCommonPathAliases(
	rootDir: string = process.cwd()
): Record<string, string> {
	const aliases: Record<string, string> = {}

	// 一般的なディレクトリ構造をチェック
	const commonPatterns = [
		{ alias: '@', paths: ['src', 'app', 'lib'] },
		{ alias: '~', paths: ['src', 'app'] },
		{ alias: '@components', paths: ['src/components', 'components'] },
		{ alias: '@utils', paths: ['src/utils', 'utils', 'src/lib', 'lib'] },
		{ alias: '@types', paths: ['src/types', 'types', '@types'] },
	]

	for (const pattern of commonPatterns) {
		for (const path of pattern.paths) {
			const fullPath = resolve(rootDir, path)
			if (existsSync(fullPath)) {
				aliases[pattern.alias] = `./${path}`
				break
			}
		}
	}

	return aliases
}

/**
 * 統合的なパスエイリアス自動検出
 */
export function autoDetectPathAliases(
	rootDir: string = process.cwd(),
	viteConfig?: UserConfig
): Record<string, string> {
	const aliases: Record<string, string> = {}

	// 1. 既存のVite設定から検出
	if (viteConfig) {
		Object.assign(aliases, detectExistingPathAliases(viteConfig))
	}

	// 2. tsconfig.jsonから検出
	Object.assign(aliases, detectPathAliasesFromTsConfig(rootDir))

	// 3. 一般的なパターンから推測（既存設定がない場合のみ）
	if (Object.keys(aliases).length === 0) {
		Object.assign(aliases, detectCommonPathAliases(rootDir))
	}

	console.log('[vite-plugin-gas] Auto-detected path aliases:', aliases)

	return aliases
}
