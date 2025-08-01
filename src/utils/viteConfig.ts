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

	// GAS用の設定：各ファイルを独立したIIFEとして出力
	config.build.rollupOptions.output = {
		...config.build.rollupOptions.output,
		entryFileNames: '[name].js',
		format: 'iife', // GAS用の即座実行関数形式
	}

	// 各エントリーファイルを独立して処理するための設定
	config.build.rollupOptions.external = [] // 外部依存を内部化
	config.build.rollupOptions.preserveEntrySignatures = 'strict'

	// ライブラリモードを無効化し、通常のアプリケーションビルドとして処理
	config.build.lib = false
	config.build.outDir = outputDir
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
