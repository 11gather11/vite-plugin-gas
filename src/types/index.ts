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

	/**
	 * TypeScriptからJavaScriptに変換時にコメントを保持するかどうか
	 * @default true
	 */
	preserveComments?: boolean

	/**
	 * appsscript.jsonを出力ディレクトリにコピーするかどうか
	 * @default true
	 */
	copyAppsscriptJson?: boolean

	/**
	 * パスエイリアスの自動設定を有効にするかどうか
	 * @default true
	 */
	enablePathAliases?: boolean

	/**
	 * パスエイリアスの自動検知を有効にするかどうか
	 * tsconfig.jsonやプロジェクト構造から自動的にパスエイリアスを検出します
	 * @default true
	 */
	autoDetectPathAliases?: boolean

	/**
	 * カスタムパスエイリアス設定
	 * 自動検知で見つからない場合のフォールバック設定
	 * @default { '@': './src', '~': './src' }
	 */
	pathAliases?: Record<string, string>
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
	preserveComments: false,
	copyAppsscriptJson: true,
	enablePathAliases: true,
	autoDetectPathAliases: true,
	pathAliases: { '@': './src', '~': './src' },
}
