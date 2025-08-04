import { resolve } from 'node:path'
import type { UserConfig } from 'vite'
import type { GasPluginOptions } from '../types'
import { autoDetectPathAliases } from './pathAliasDetector'

/**
 * パスエイリアスの自動設定
 */
function ensurePathAliases(
	config: UserConfig,
	options: Required<GasPluginOptions>
): void {
	if (!options.enablePathAliases) {
		return
	}

	if (!config.resolve) {
		config.resolve = {}
	}

	// ユーザーが既にエイリアスを設定している場合は尊重し、不足分を追加
	if (!config.resolve.alias) {
		config.resolve.alias = {}
	}

	const aliases = config.resolve.alias as Record<string, string>

	let detectedAliases: Record<string, string> = {}

	// 自動検知が有効な場合のみ実行
	if (options.autoDetectPathAliases) {
		detectedAliases = autoDetectPathAliases(process.cwd(), config)

		// 自動検知されたエイリアスを適用（既存設定を上書きしない）
		for (const [key, value] of Object.entries(detectedAliases)) {
			if (!aliases[key]) {
				aliases[key] = resolve(process.cwd(), value.replace('./', ''))
			}
		}
	}

	// デフォルトのパスエイリアスを設定（既存設定や自動検知がない場合）
	for (const [key, value] of Object.entries(options.pathAliases)) {
		if (!aliases[key]) {
			aliases[key] = resolve(process.cwd(), value.replace('./', ''))
		}
	}
}

/**
 * GAS用のVite設定を適用
 */
export function applyGasViteConfig(
	config: UserConfig,
	entryFiles: Record<string, string>,
	outputDir: string,
	options?: Required<GasPluginOptions>
): void {
	// パスエイリアスを自動設定
	if (options) {
		ensurePathAliases(config, options)
	}

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
	// パスエイリアスを含む内部モジュールは内部化、node_modulesは外部化しない
	config.build.rollupOptions.external = (id: string) => {
		// パスエイリアス（@/で始まる）は内部化
		if (id.startsWith('@/')) return false
		// 相対パス・絶対パスは内部化
		if (id.startsWith('.') || id.startsWith('/')) return false
		// その他（node_modulesなど）も内部化してバンドル
		return false
	}
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
