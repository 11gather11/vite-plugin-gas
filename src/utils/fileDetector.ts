import { readFileSync } from 'node:fs'
import { parse, relative, resolve } from 'node:path'
import { glob } from 'tinyglobby'

/**
 * Check if file is empty or contains only whitespace
 */
export function isEmpty(filePath: string): boolean {
	try {
		const content = readFileSync(filePath, 'utf-8')
		// Remove whitespace, newlines, tabs, and comments only to check content
		const cleaned = content
			.replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
			.replace(/\/\/.*$/gm, '') // Remove line comments
			.trim()

		return cleaned.length === 0
	} catch {
		return true // Consider as empty if file read error occurs
	}
}

/**
 * Auto-detect TypeScript files and set them as entry points
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
			// Skip empty files (including comment-only files)
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
 * Generate entry name from file path
 */
export function generateEntryName(filePath: string, baseDir: string): string {
	// Resolve both paths to ensure consistent behavior across platforms
	const resolvedFilePath = resolve(filePath)
	const resolvedBaseDir = resolve(baseDir)

	const relativePath = relative(resolvedBaseDir, resolvedFilePath)
	const parsed = parse(relativePath)

	return parsed.dir
		? `${parsed.dir.replace(/[/\\]/g, '_')}_${parsed.name}`
		: parsed.name
}
