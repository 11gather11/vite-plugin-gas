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

	// GAS用の設定：各ファイルを独立したチャンクとして出力
	const outputOptions = {
		...config.build.rollupOptions.output,
		entryFileNames: '[name].js',
		chunkFileNames: '[name].js',
		format: 'es' as const, // ESモジュール形式で出力（変換処理でimport/exportを削除）
	}

	// manualChunksを削除してチャンク分割を無効化
	if (typeof outputOptions === 'object' && 'manualChunks' in outputOptions) {
		delete outputOptions.manualChunks
	}

	config.build.rollupOptions.output = outputOptions

	// 各エントリーファイルを独立して処理するための設定
	config.build.rollupOptions.external = () => false // すべての依存関係を内部化
	config.build.rollupOptions.treeshake = false // treeshakingを無効化してコードの削除を防ぐ
	config.build.rollupOptions.preserveEntrySignatures = 'strict'

	// ライブラリモードを無効化し、通常のアプリケーションビルドとして処理
	config.build.lib = false
	config.build.outDir = outputDir
	config.build.minify = false // minify無効化
	config.build.target = 'es2017' // GAS対応のターゲット
	config.build.sourcemap = false // ソースマップ無効化

	// esbuildの設定（TypeScript変換）
	config.esbuild = config.esbuild || {}
	config.esbuild.target = 'es2017'
	config.esbuild.format = 'esm'
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
