import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { UserConfig } from 'vite'
import { logger } from './logger'

/**
 * Auto-detect path aliases from tsconfig.json
 */
export function detectPathAliasesFromTsConfig(
	rootDir: string = process.cwd()
): Record<string, string> {
	const aliases: Record<string, string> = {}

	try {
		const tsconfigPath = resolve(rootDir, 'tsconfig.json')
		const tsconfigContent = readFileSync(tsconfigPath, 'utf-8')

		// Remove JSON comments and parse
		const jsonContent = tsconfigContent.replace(
			/\/\*[\s\S]*?\*\/|\/\/.*$/gm,
			''
		)
		const tsconfig = JSON.parse(jsonContent)

		// Get path mapping from compilerOptions.paths
		const paths = tsconfig?.compilerOptions?.paths
		if (paths && typeof paths === 'object') {
			const baseUrl = tsconfig?.compilerOptions?.baseUrl || '.'

			for (const [alias, pathArray] of Object.entries(paths)) {
				if (Array.isArray(pathArray) && pathArray.length > 0) {
					// Convert from TypeScript path format to Vite format
					const aliasKey = alias.replace('/*', '')
					let aliasPath = pathArray[0]

					// Remove '/*' pattern
					if (aliasPath.endsWith('/*')) {
						aliasPath = aliasPath.slice(0, -2)
					}

					// Convert * only to empty string
					if (aliasPath === '*') {
						aliasPath = ''
					}

					// Path resolution considering baseUrl
					if (!aliasPath.startsWith('/') && !aliasPath.startsWith('./')) {
						if (baseUrl === '.') {
							aliasPath = aliasPath ? `./${aliasPath}` : './'
						} else {
							aliasPath = aliasPath
								? `./${baseUrl}/${aliasPath}`.replace(/\/+/g, '/')
								: `./${baseUrl}`
						}
					} else if (aliasPath === '') {
						// Use baseUrl for empty paths
						aliasPath = baseUrl === '.' ? './' : `./${baseUrl}`
					}

					// Normalize to relative paths
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
		logger.debug('Could not read tsconfig.json for path aliases:', error)
	}

	return aliases
}

/**
 * Detect path aliases from existing Vite configuration
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
		logger.debug('Could not detect existing path aliases:', error)
	}

	return aliases
}

/**
 * Infer path aliases from common project structures
 */
export function detectCommonPathAliases(
	rootDir: string = process.cwd()
): Record<string, string> {
	const aliases: Record<string, string> = {}

	// Check common directory structures
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
 * Comprehensive automatic path alias detection
 */
export function autoDetectPathAliases(
	rootDir: string = process.cwd(),
	viteConfig?: UserConfig
): Record<string, string> {
	const aliases: Record<string, string> = {}

	// 1. Detect from existing Vite configuration
	if (viteConfig) {
		Object.assign(aliases, detectExistingPathAliases(viteConfig))
	}

	// 2. Detect from tsconfig.json
	Object.assign(aliases, detectPathAliasesFromTsConfig(rootDir))

	// 3. Infer from common patterns (only when no existing configuration)
	if (Object.keys(aliases).length === 0) {
		Object.assign(aliases, detectCommonPathAliases(rootDir))
	}

	logger.info('Auto-detected path aliases:', aliases)

	return aliases
}
