import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * Copy appsscript.json to output directory
 */
export function copyAppsscriptJson(sourceDir: string, outputDir: string): void {
	try {
		const srcFile = resolve(sourceDir, 'appsscript.json')

		// Check if source file exists
		if (!existsSync(srcFile)) {
			console.warn(
				'[vite-plugin-gas] appsscript.json not found in project root. Skipping copy.'
			)
			return
		}

		const destDir = resolve(outputDir)
		const destFile = join(destDir, 'appsscript.json')

		// Create output directory if it doesn't exist
		if (!existsSync(destDir)) {
			mkdirSync(destDir, { recursive: true })
		}

		// Copy file
		copyFileSync(srcFile, destFile)
		console.log(
			'[vite-plugin-gas] appsscript.json has been copied to dist folder'
		)
	} catch (error) {
		console.error('[vite-plugin-gas] Failed to copy appsscript.json:', error)
	}
}
