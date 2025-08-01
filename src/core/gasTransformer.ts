import type { TransformResult } from 'vite'
import type { GasPluginOptions } from '../types'
import {
	preserveGasFunctions,
	removeModuleStatements,
	transformLogger,
} from '../utils/codeTransformer'

/**
 * GAS用のTypeScriptファイル変換処理
 */
export class GasTransformer {
	private readonly options: GasPluginOptions

	constructor(options: GasPluginOptions) {
		this.options = options
	}

	/**
	 * ファイルを変換する
	 */
	transform(code: string, id: string): TransformResult | null {
		// .tsファイルのみ処理
		if (!id.endsWith('.ts')) return null

		let transformedCode = code

		// import/export文を削除
		transformedCode = removeModuleStatements(transformedCode)

		// console.logをLogger.logに変換（オプション有効時）
		if (this.options.transformLogger) {
			transformedCode = transformLogger(transformedCode)
		}

		return {
			code: transformedCode,
			map: null,
		}
	}

	/**
	 * バンドル生成時にGAS特殊関数を保護
	 * bundleの型は実行時に適切に処理される
	 */
	generateBundle(bundle: Record<string, unknown>): void {
		Object.keys(bundle).forEach((fileName) => {
			const chunk = bundle[fileName] as {
				type?: string
				code?: string
				[key: string]: unknown
			}

			// chunkがコードを持つ出力チャンクかどうかをチェック
			if (
				chunk &&
				chunk.type === 'chunk' &&
				fileName.endsWith('.js') &&
				typeof chunk.code === 'string'
			) {
				chunk.code = preserveGasFunctions(chunk.code)
			}
		})
	}
}
