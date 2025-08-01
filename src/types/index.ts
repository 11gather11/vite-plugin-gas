/**
 * GAS Plugin設定オプション
 */
export interface GasPluginOptions {
	/**
	 * TypeScriptファイルを自動検出するかどうか
	 * @default true
	 */
	autoDetect?: boolean

	/**
	 * TypeScriptファイルを検索するディレクトリ
	 * @default ['src']
	 */
	include?: string[]

	/**
	 * 除外するファイルパターン
	 * @default ['**\/*.d.ts', '**\/*.test.ts', '**\/*.spec.ts']
	 */
	exclude?: string[]

	/**
	 * 出力ディレクトリ
	 * @default 'dist'
	 */
	outDir?: string

	/**
	 * console.logをLogger.logに変換するかどうか
	 * @default true
	 */
	transformLogger?: boolean
}

/**
 * デフォルトオプション
 */
export const DEFAULT_OPTIONS: Required<GasPluginOptions> = {
	autoDetect: true,
	include: ['src'],
	exclude: ['**/*.d.ts', '**/*.test.ts', '**/*.spec.ts'],
	outDir: 'dist',
	transformLogger: true,
}
