import { parse, relative, resolve } from 'node:path'
import { glob } from 'tinyglobby'

/**
 * TypeScriptファイルを自動検出してエントリーポイントとして設定
 */
export async function detectTypeScriptFiles(
	includeDirs: string[],
	excludePatterns: string[] = []
): Promise<Record<string, string>> {
	try {
		const patterns = includeDirs.map((dir) => `${dir}/**/*.ts`)
		const defaultIgnore = ['**/*.d.ts', '**/node_modules/**', '**/__tests__/**']
		const ignore = [...defaultIgnore, ...excludePatterns]

		const files = await glob(patterns, {
			ignore,
			absolute: true,
		})

		const entries: Record<string, string> = {}

		for (const file of files) {
			const entryName = generateEntryName(file, includeDirs[0] || 'src')
			entries[entryName] = resolve(file)
		}

		return entries
	} catch (error) {
		console.warn('[vite-plugin-gas] Failed to detect TypeScript files:', error)
		return {}
	}
}

/**
 * ファイルパスからエントリー名を生成
 */
export function generateEntryName(filePath: string, baseDir: string): string {
	const relativePath = relative(baseDir, filePath)
	const parsed = parse(relativePath)

	return parsed.dir
		? `${parsed.dir.replace(/[/\\]/g, '_')}_${parsed.name}`
		: parsed.name
}
