import type { UserConfig } from 'vite'
import type { GasPluginOptions } from '../types'
import { DEFAULT_OPTIONS } from '../types'
import { detectTypeScriptFiles } from '../utils/fileDetector'
import { applyGasViteConfig, logDetectedFiles } from '../utils/viteConfig'

/**
 * プラグイン設定処理
 */
export class GasConfigProcessor {
	private readonly mergedOptions: Required<GasPluginOptions>

	constructor(options: GasPluginOptions = {}) {
		this.mergedOptions = { ...DEFAULT_OPTIONS, ...options }
	}

	/**
	 * Vite設定を処理
	 */
	async processConfig(config: UserConfig): Promise<void> {
		// TypeScriptサポートを自動で追加
		this.ensureTypeScriptSupport(config)

		if (!this.mergedOptions.autoDetect) {
			return
		}

		// TypeScriptファイルを自動検出
		const entryFiles = await detectTypeScriptFiles(
			this.mergedOptions.include,
			this.mergedOptions.exclude
		)

		if (Object.keys(entryFiles).length === 0) {
			console.warn(
				'[vite-plugin-gas] No TypeScript files found for auto-detection'
			)
			return
		}

		// Vite設定を適用
		applyGasViteConfig(config, entryFiles, this.mergedOptions.outDir)

		// 検出したファイルをログ出力
		logDetectedFiles(entryFiles)
	}

	/**
	 * TypeScriptサポートを確保
	 */
	private ensureTypeScriptSupport(config: UserConfig): void {
		// プラグインが設定されていない場合は初期化
		if (!config.plugins) {
			config.plugins = []
		}

		// プラグイン配列に変換
		const plugins = Array.isArray(config.plugins)
			? config.plugins
			: [config.plugins]

		// TypeScript関連のプラグインが既に存在するかチェック
		const hasTypeScriptPlugin = plugins.some((plugin) => {
			if (!plugin || typeof plugin !== 'object') return false
			const pluginName = 'name' in plugin ? plugin.name : ''
			return (
				pluginName === 'vite:esbuild' ||
				pluginName === 'typescript' ||
				pluginName === 'rollup-plugin-typescript2'
			)
		})

		if (!hasTypeScriptPlugin) {
			console.log(
				"[vite-plugin-gas] TypeScript support is handled by Vite's built-in esbuild integration"
			)
		}

		// Viteの標準TypeScript設定を適用
		config.esbuild = config.esbuild || {}
		config.esbuild.target = config.esbuild.target || 'es2017'
	}

	/**
	 * オプションを取得
	 */
	get options(): Required<GasPluginOptions> {
		return this.mergedOptions
	}
}
