/**
 * GAS Plugin configuration options
 */
export interface GasPluginOptions {
	/**
	 * Whether to automatically detect TypeScript files
	 * @default true
	 */
	autoDetect?: boolean

	/**
	 * Directories to search for TypeScript files
	 * @default ['src']
	 */
	include?: string[]

	/**
	 * File patterns to exclude
	 * @default ['**\/*.d.ts', '**\/*.test.ts', '**\/*.spec.ts']
	 */
	exclude?: string[]

	/**
	 * Output directory
	 * @default 'dist'
	 */
	outDir?: string

	/**
	 * Whether to transform console.log to Logger.log
	 * @default true
	 */
	transformLogger?: boolean

	/**
	 * Whether to copy appsscript.json to output directory
	 * @default true
	 */
	copyAppsscriptJson?: boolean

	/**
	 * Whether to enable automatic path aliases configuration
	 * @default true
	 */
	enablePathAliases?: boolean

	/**
	 * Whether to enable automatic path alias detection
	 * Automatically detects path aliases from tsconfig.json and project structure
	 * @default true
	 */
	autoDetectPathAliases?: boolean

	/**
	 * Custom path alias configuration
	 * Fallback configuration when auto-detection doesn't find aliases
	 * @default { '@': './src', '~': './src' }
	 */
	pathAliases?: Record<string, string>
}

/**
 * Default options
 */
export const DEFAULT_OPTIONS: Required<GasPluginOptions> = {
	autoDetect: true,
	include: ['src'],
	exclude: ['**/*.d.ts', '**/*.test.ts', '**/*.spec.ts'],
	outDir: 'dist',
	transformLogger: true,
	copyAppsscriptJson: true,
	enablePathAliases: true,
	autoDetectPathAliases: true,
	pathAliases: { '@': './src', '~': './src' },
}
