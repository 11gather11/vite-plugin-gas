import { readFileSync } from 'node:fs'
import { parse, relative, resolve } from 'node:path'
import { glob } from 'tinyglobby'

/**
 * ファイルが空または空白のみかチェック
 */
export function isEmpty(filePath: string): boolean {
	try {
		const content = readFileSync(filePath, 'utf-8')
		// 空白文字、改行、タブ、コメントのみを削除して内容をチェック
		const cleaned = content
			.replace(/\/\*[\s\S]*?\*\//g, '') // ブロックコメント削除
			.replace(/\/\/.*$/gm, '') // ラインコメント削除
			.trim()

		return cleaned.length === 0
	} catch {
		return true // ファイル読み込みエラーの場合は空とみなす
	}
}

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
			// 空のファイルをスキップ（コメントのみのファイルも含む）
			if (isEmpty(file)) {
				console.warn(`[vite-plugin-gas] Skipping empty file: ${file}`)
				continue
			}

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
