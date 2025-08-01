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
	config.build.rollupOptions.output = {
		...config.build.rollupOptions.output,
		entryFileNames: '[name].js',
		format: 'iife', // GAS用の即座実行関数形式
		inlineDynamicImports: false, // 複数エントリー時は無効化
	}

	// 個別ファイル出力のためのその他設定
	config.build.lib = false // ライブラリモードを無効化
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
