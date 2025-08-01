import type { UserConfig } from 'vite'

/**
 * GAS用のVite設定を適用
 */
export function applyGasViteConfig(
	config: UserConfig,
	entryFiles: Record<string, string>,
	outputDir: string
): void {
	// rollupOptionsを自動設定
	config.build = config.build || {}
	config.build.rollupOptions = config.build.rollupOptions || {}
	config.build.rollupOptions.input = entryFiles

	// GAS用の設定：各ファイルを独立したESモジュールとして出力（後でimport/exportを削除）
	const outputOptions = {
		...config.build.rollupOptions.output,
		entryFileNames: '[name].js',
		format: 'es' as const, // ESモジュール形式で出力（変換処理でimport/exportを削除）
	}

	// manualChunksを明示的に削除してチャンク分割を無効化
	if ('manualChunks' in outputOptions) {
		delete outputOptions.manualChunks
	}

	config.build.rollupOptions.output = outputOptions

	// 各エントリーファイルを独立して処理するための設定
	config.build.rollupOptions.external = [] // 外部依存を内部化（すべてをバンドル）
	config.build.rollupOptions.treeshake = false // treeshakingを無効化してコードの削除を防ぐ
	config.build.rollupOptions.preserveEntrySignatures = 'strict'

	// ライブラリモードを無効化し、通常のアプリケーションビルドとして処理
	config.build.lib = false
	config.build.outDir = outputDir
	config.build.minify = false // minify無効化
	config.build.target = 'es2017' // GAS対応のターゲット
}

/**
 * 検出されたファイルをログ出力
 */
export function logDetectedFiles(entryFiles: Record<string, string>): void {
	console.log(
		`[vite-plugin-gas] Auto-detected ${Object.keys(entryFiles).length} TypeScript files:`
	)
	Object.keys(entryFiles).forEach((name) => {
		console.log(`  - ${name}: ${entryFiles[name]}`)
	})
}
