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
	 * オプションを取得
	 */
	get options(): Required<GasPluginOptions> {
		return this.mergedOptions
	}
}
