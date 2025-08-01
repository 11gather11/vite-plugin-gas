import type { Plugin } from 'vite'
import { glob } from 'tinyglobby'
import { resolve, relative, parse } from 'node:path'

export interface GasPluginOptions {
	// 出力ターゲット（GASはES5互換が安全）
	target?: 'es5' | 'es2015'

	// エントリーディレクトリ（TSファイルを個別にコンパイル）
	entryDir?: string

	// 出力ディレクトリ
	outputDir?: string

	// GAS互換性チェックを有効にするか
	compatCheck?: boolean

	// console.log → Logger.log 変換
	replaceLogger?: boolean

	// import/exportを削除するか
	removeModuleStatements?: boolean

	// GAS特殊関数を保護するか（minify時に削除されないようにする）
	preserveGasFunctions?: boolean
}

const DEFAULT_OPTIONS: Required<GasPluginOptions> = {
	target: 'es5',
	entryDir: 'src',
	outputDir: 'dist',
	compatCheck: true,
	replaceLogger: false,
	removeModuleStatements: true,
	preserveGasFunctions: true,
}

export default function gasPlugin(options: GasPluginOptions = {}): Plugin {
	const opts = { ...DEFAULT_OPTIONS, ...options }

	return {
		name: 'vite-plugin-gas',

		async config(config) {
			// 自動的にTSファイルを検出してVite設定を更新
			const entryFiles = await detectTypeScriptFiles(opts.entryDir)
			
			if (Object.keys(entryFiles).length > 0) {
				// rollupOptionsを自動設定
				config.build = config.build || {}
				config.build.rollupOptions = config.build.rollupOptions || {}
				config.build.rollupOptions.input = entryFiles
				config.build.rollupOptions.output = {
					...config.build.rollupOptions.output,
					entryFileNames: '[name].js',
					format: 'iife' // GAS用の即座実行関数形式
				}
				
				console.log(`[vite-plugin-gas] Auto-detected ${Object.keys(entryFiles).length} TypeScript files:`)
				Object.keys(entryFiles).forEach(name => {
					console.log(`  - ${name}: ${entryFiles[name]}`)
				})
			}
		},

		configResolved(_config) {
			// Vite設定が解決された後に呼ばれる
			console.log(
				'[vite-plugin-gas] Configuration loaded with target:',
				opts.target
			)
		},

		buildStart() {
			// ビルド開始時の処理
			console.log('[vite-plugin-gas] Starting GAS build process')
		},

		transform(code, id) {
			// ファイル変換処理
			if (!id.endsWith('.ts') && !id.endsWith('.js')) {
				return null
			}

			let transformedCode = code

			// import/export文の削除
			if (opts.removeModuleStatements) {
				transformedCode = removeModuleStatements(transformedCode)
			}

			// console.log → Logger.log 変換
			if (opts.replaceLogger) {
				transformedCode = transformedCode.replace(
					/console\.log\(/g,
					'Logger.log('
				)
			}

			return {
				code: transformedCode,
				map: null, // ソースマップは後で実装
			}
		},

		generateBundle(_options, bundle) {
			// バンドル生成時の処理
			console.log('[vite-plugin-gas] Generating GAS-compatible bundle')

			// GAS特殊関数の保護処理
			if (opts.preserveGasFunctions) {
				for (const [_fileName, chunk] of Object.entries(bundle)) {
					if (chunk.type === 'chunk') {
						chunk.code = preserveGasFunctions(chunk.code)
					}
				}
			}
		},
	}
}

/**
 * import/export文を削除する
 */
function removeModuleStatements(code: string): string {
	let result = code

	// import文の削除
	result = result.replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '')
	result = result.replace(/import\s+['"][^'"]*['"];?\s*/g, '')

	// export文の削除（export default、export function等）
	result = result.replace(/export\s+default\s+/g, '')
	result = result.replace(/export\s+/g, '')

	return result
}

/**
 * GAS特殊関数を保護する（minify対策）
 */
function preserveGasFunctions(code: string): string {
	const gasFunctions = [
		'onOpen',
		'onEdit',
		'onSelectionChange',
		'onFormSubmit',
		'doGet',
		'doPost',
		'onInstall',
	]

	let result = code

	// 関数名の保護コメントを追加
	for (const funcName of gasFunctions) {
		const regex = new RegExp(`function\\s+${funcName}\\s*\\(`, 'g')
		result = result.replace(
			regex,
			`/* @preserve ${funcName} */ function ${funcName}(`
		)
	}

	return result
}

/**
 * TypeScriptファイルを自動検出してエントリーポイントとして設定
 */
async function detectTypeScriptFiles(entryDir: string): Promise<Record<string, string>> {
	try {
		const pattern = `${entryDir}/**/*.ts`
		const files = await glob([pattern], { 
			ignore: ['**/*.d.ts', '**/node_modules/**'] 
		})
		
		const entries: Record<string, string> = {}
		
		for (const file of files) {
			const relativePath = relative(entryDir, file)
			const parsed = parse(relativePath)
			// ディレクトリ構造を保持したエントリー名を生成
			const entryName = parsed.dir 
				? `${parsed.dir.replace(/[/\\]/g, '_')}_${parsed.name}`
				: parsed.name
			
			entries[entryName] = resolve(file)
		}
		
		return entries
	} catch (error) {
		console.warn('[vite-plugin-gas] Failed to detect TypeScript files:', error)
		return {}
	}
}
