import { rimraf } from 'rimraf'
import { build } from 'tsup'

// Simple colored logger for build script
const colors = {
	cyan: '\x1b[36m',
	green: '\x1b[32m',
	red: '\x1b[31m',
	reset: '\x1b[0m',
	dim: '\x1b[2m',
}

const log = {
	info: (msg: string) =>
		console.log(`${colors.cyan}[build]${colors.reset} ${msg}`),
	success: (msg: string) =>
		console.log(`${colors.green}[build]${colors.reset} ✅ ${msg}`),
	error: (msg: string) =>
		console.error(`${colors.red}[build]${colors.reset} ❌ ${msg}`),
	dim: (msg: string) => console.log(`${colors.dim}${msg}${colors.reset}`),
}

async function buildProject() {
	log.info('Cleaning dist directory...')
	await rimraf('dist')

	log.info('Building project...')

	await build({
		entry: ['src/index.ts'],
		format: ['cjs', 'esm'],
		dts: {
			resolve: true,
		},
		clean: false, // Already cleaned above
		sourcemap: true,
		outDir: 'dist',
		target: 'node18',
		splitting: false,
		minify: false,
		external: ['vite'], // Viteを外部依存として扱う
		treeshake: true,
		platform: 'node',
		bundle: true,
		// CommonJS用の型定義ファイルを生成
		onSuccess: async () => {
			log.success('Build completed successfully!')
			log.dim('Generated files:')
			log.dim('  - dist/index.js (ESM)')
			log.dim('  - dist/index.cjs (CJS)')
			log.dim('  - dist/index.d.ts (ESM types)')
			log.dim('  - dist/index.d.cts (CJS types)')
		},
	})
}

buildProject().catch((error) => {
	log.error(`Build failed: ${error}`)
	process.exit(1)
})
