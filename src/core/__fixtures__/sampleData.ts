/**
 * Core モジュール用のテストフィクスチャ
 */

import type { GasPluginOptions } from '../../types'

export const defaultGasOptions: GasPluginOptions = {
	autoDetect: true,
	include: ['src'],
	exclude: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'],
	outDir: 'dist',
	transformLogger: true,
	copyAppsscriptJson: true,
	enablePathAliases: true,
	autoDetectPathAliases: true,
}

export const customGasOptions: GasPluginOptions = {
	autoDetect: false,
	include: ['lib', 'app'],
	exclude: ['**/*.ignore.ts'],
	outDir: 'build',
	transformLogger: false,
	copyAppsscriptJson: false,
	enablePathAliases: false,
	autoDetectPathAliases: false,
}

export const sampleViteUserConfig = {
	root: process.cwd(),
	base: '/',
	mode: 'development',
	build: {
		target: 'es2015',
		outDir: 'dist',
	},
}

export const sampleBuildContext = {
	isProduction: false,
	command: 'build' as const,
	mode: 'development',
}

export const mockFiles = [
	'src/main.ts',
	'src/utils/helper.ts',
	'src/types/index.ts',
	'src/gas/functions.ts',
]

export const sampleBundle = {
	'main.js': {
		type: 'chunk' as const,
		code: 'function main() { return "hello"; }',
		map: null,
		fileName: 'main.js',
		name: 'main',
	},
}
