import { build } from 'tsup'
import { rimraf } from 'rimraf'

async function buildProject() {
  console.log('🧹 Cleaning dist directory...')
  await rimraf('dist')

  console.log('🏗️ Building project...')
  
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
      console.log('✅ Build completed successfully!')
      console.log('📄 Generated files:')
      console.log('  - dist/index.js (ESM)')
      console.log('  - dist/index.cjs (CJS)')
      console.log('  - dist/index.d.ts (ESM types)')
      console.log('  - dist/index.d.cts (CJS types)')
    }
  })
}

buildProject().catch((error) => {
  console.error('❌ Build failed:', error)
  process.exit(1)
})
