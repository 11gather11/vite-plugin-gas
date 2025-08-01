import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * appsscript.jsonを出力ディレクトリにコピー
 */
export function copyAppsscriptJson(sourceDir: string, outputDir: string): void {
	try {
		const srcFile = resolve(sourceDir, 'appsscript.json')

		// ソースファイルが存在するか確認
		if (!existsSync(srcFile)) {
			console.warn(
				'[vite-plugin-gas] appsscript.json not found in project root. Skipping copy.'
			)
			return
		}

		const destDir = resolve(outputDir)
		const destFile = join(destDir, 'appsscript.json')

		// 出力ディレクトリが存在しない場合は作成
		if (!existsSync(destDir)) {
			mkdirSync(destDir, { recursive: true })
		}

		// ファイルをコピー
		copyFileSync(srcFile, destFile)
		console.log(
			'[vite-plugin-gas] appsscript.json has been copied to dist folder'
		)
	} catch (error) {
		console.error('[vite-plugin-gas] Failed to copy appsscript.json:', error)
	}
}
