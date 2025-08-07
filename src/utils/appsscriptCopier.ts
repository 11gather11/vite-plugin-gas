import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { logger } from './logger'

/**
 * Copy appsscript.json to output directory
 */
export function copyAppsscriptJson(sourceDir: string, outputDir: string): void {
	try {
		const srcFile = resolve(sourceDir, 'appsscript.json')

		// Check if source file exists
		if (!existsSync(srcFile)) {
			logger.debug('appsscript.json not found in project root. Skipping copy.')
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
		logger.success('appsscript.json has been copied to dist folder')
	} catch (error) {
		logger.error('Failed to copy appsscript.json:', error)
	}
}
