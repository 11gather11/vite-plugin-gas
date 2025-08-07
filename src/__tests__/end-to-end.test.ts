import type { UserConfig } from 'vite'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import gasPlugin from '../index'
import {
	preserveGasFunctions,
	removeModuleStatements,
	transformLogger,
} from '../utils/codeTransformer'
import { detectTypeScriptFiles } from '../utils/fileDetector'
import { applyGasViteConfig } from '../utils/viteConfig'

// Mock external dependencies for isolated testing
vi.mock('tinyglobby', () => ({
	glob: vi.fn(),
}))

vi.mock('node:fs', async (importOriginal) => {
	const actual = await importOriginal<typeof import('node:fs')>()
	return {
		...actual,
		readFileSync: vi.fn(),
		writeFileSync: vi.fn(),
		existsSync: vi.fn(),
		mkdirSync: vi.fn(),
	}
})

import { existsSync, readFileSync } from 'node:fs'
import { glob } from 'tinyglobby'

const mockGlob = vi.mocked(glob)
const mockReadFileSync = vi.mocked(readFileSync)
const mockExistsSync = vi.mocked(existsSync)

describe('End-to-End Transformation Pipeline', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Complete Code Transformation Pipeline', () => {
		it('should transform TypeScript code through complete pipeline', () => {
			const inputCode = `
import { helper } from './utils/helper';
import type { Config } from './types';

export function onOpen() {
	console.log('Spreadsheet opened');
	console.warn('Setup required');
}

export function onEdit(e: any) {
	console.log('Cell edited:', e.range.getA1Notation());
	helper.processEdit(e);
}

function doGet(request: any) {
	console.error('GET request received');
	return HtmlService.createHtmlOutput('Hello World');
}

export const config: Config = {
	name: 'Test App',
	version: '1.0.0'
};
`

			// Step 1: Remove import/export statements
			let transformedCode = removeModuleStatements(inputCode)
			expect(transformedCode).not.toContain('import')
			expect(transformedCode).not.toContain('export')
			expect(transformedCode).toContain('function onOpen()')
			expect(transformedCode).toContain('function onEdit(e')

			// Step 2: Transform console.* to Logger.*
			transformedCode = transformLogger(transformedCode)
			expect(transformedCode).toContain('Logger.log')
			expect(transformedCode).toContain('Logger.warn')
			expect(transformedCode).toContain('Logger.error')
			expect(transformedCode).not.toContain('console.log')
			expect(transformedCode).not.toContain('console.warn')
			expect(transformedCode).not.toContain('console.error')

			// Step 3: Preserve GAS special functions
			transformedCode = preserveGasFunctions(transformedCode)
			expect(transformedCode).toContain('/* @preserve onOpen */')
			expect(transformedCode).toContain('/* @preserve onEdit */')
			expect(transformedCode).toContain('/* @preserve doGet */')

			// Verify final output structure
			expect(transformedCode).toContain('Spreadsheet opened')
			expect(transformedCode).toContain('Cell edited:')
			expect(transformedCode).toContain('GET request received')
			expect(transformedCode).toContain('Hello World')
			expect(transformedCode).toContain("name: 'Test App'")
		})

		it('should handle complex GAS application structure', () => {
			const mainCode = `
import { DataProcessor } from './data/processor';
import { EmailSender } from './email/sender';

export function onFormSubmit(e: any) {
	console.log('Form submitted with values:', e.values);
	
	const processor = new DataProcessor();
	const result = processor.process(e.values);
	
	const emailSender = new EmailSender();
	emailSender.sendNotification(result);
}

export function onInstall() {
	console.log('Add-on installed');
	// Setup triggers
}

function doPost(e: any) {
	console.warn('POST request:', e.postData);
	return ContentService
		.createTextOutput(JSON.stringify({status: 'ok'}))
		.setMimeType(ContentService.MimeType.JSON);
}
`

			// Complete transformation pipeline
			let result = removeModuleStatements(mainCode)
			result = transformLogger(result)
			result = preserveGasFunctions(result)

			// Verify transformations
			expect(result).not.toContain('import')
			expect(result).not.toContain('export')
			expect(result).toContain('Logger.log')
			expect(result).toContain('Logger.warn')
			expect(result).toContain('/* @preserve onFormSubmit */')
			expect(result).toContain('/* @preserve onInstall */')
			expect(result).toContain('/* @preserve doPost */')

			// Verify code functionality is preserved
			expect(result).toContain('DataProcessor()')
			expect(result).toContain('EmailSender()')
			expect(result).toContain('sendNotification')
			expect(result).toContain('ContentService')
			expect(result).toContain('JSON.stringify')
		})
	})

	describe('Vite Configuration Integration', () => {
		it('should configure Vite correctly for GAS project', () => {
			const config: UserConfig = {}
			const entryFiles = {
				main: 'src/main.ts',
				'utils/helper': 'src/utils/helper.ts',
				'gas/triggers': 'src/gas/triggers.ts',
			}
			const outputDir = 'dist'

			applyGasViteConfig(config, entryFiles, outputDir, {
				autoDetect: true,
				include: ['src'],
				exclude: ['**/*.test.ts'],
				outDir: 'dist',
				transformLogger: true,
				copyAppsscriptJson: true,
				enablePathAliases: true,
				autoDetectPathAliases: true,
				pathAliases: { '@': './src', '~': './src' },
			})

			// Verify build configuration
			expect(config.build?.rollupOptions?.input).toEqual(entryFiles)
			expect(config.build?.rollupOptions?.output).toMatchObject({
				entryFileNames: '[name].js',
				format: 'es',
			})
			expect(config.build?.outDir).toBe(outputDir)
			expect(config.build?.minify).toBe(false)
			expect(config.build?.target).toBe('es2017')
			expect(config.build?.rollupOptions?.treeshake).toBe(false)

			// Verify esbuild configuration
			expect(config.esbuild).toBeDefined()
			if (config.esbuild) {
				expect(config.esbuild.target).toBe('es2017')
				expect(config.esbuild.format).toBe('esm')
				expect(config.esbuild.keepNames).toBe(true)
			}

			// Verify path aliases
			expect(config.resolve?.alias).toBeDefined()
		})

		it('should handle custom configuration options', () => {
			const config: UserConfig = {
				build: {
					sourcemap: true,
					rollupOptions: {
						external: ['some-external'],
					},
				},
			}
			const entryFiles = { custom: 'lib/custom.ts' }

			applyGasViteConfig(config, entryFiles, 'build', {
				autoDetect: false,
				include: ['lib'],
				exclude: ['**/*.ignore.ts'],
				outDir: 'build',
				transformLogger: false,
				copyAppsscriptJson: false,
				enablePathAliases: false,
				autoDetectPathAliases: false,
				pathAliases: {},
			})

			// Sourcemap should be disabled for GAS
			expect(config.build?.sourcemap).toBe(false)

			// External dependencies should be handled by function
			expect(typeof config.build?.rollupOptions?.external).toBe('function')

			// Input should be updated
			expect(config.build?.rollupOptions?.input).toEqual(entryFiles)

			// Path aliases should not be set
			expect(config.resolve?.alias).toBeUndefined()
		})
	})

	describe('File Detection Integration', () => {
		it('should detect TypeScript files correctly', async () => {
			// Mock glob to return paths relative to current working directory
			const cwd = process.cwd()
			mockGlob.mockResolvedValue([
				`${cwd}\\src\\main.ts`,
				`${cwd}\\src\\utils\\helper.ts`,
				`${cwd}\\src\\gas\\triggers.ts`,
				`${cwd}\\src\\types\\index.ts`,
			])

			// Mock file reading for empty check
			mockReadFileSync.mockReturnValue('// non-empty file\nfunction test() {}')

			const entryFiles = await detectTypeScriptFiles(['src'], ['**/*.d.ts'])

			expect(entryFiles).toEqual({
				main: `${cwd}\\src\\main.ts`,
				utils_helper: `${cwd}\\src\\utils\\helper.ts`,
				gas_triggers: `${cwd}\\src\\gas\\triggers.ts`,
				types_index: `${cwd}\\src\\types\\index.ts`,
			})
		})

		it('should handle empty file detection', async () => {
			mockGlob.mockResolvedValue([])

			const entryFiles = await detectTypeScriptFiles(['src'], [])

			expect(entryFiles).toEqual({})
		})

		it('should handle file detection errors', async () => {
			mockGlob.mockRejectedValue(new Error('File system error'))

			const entryFiles = await detectTypeScriptFiles(['src'], [])

			expect(entryFiles).toEqual({})
		})
	})

	describe('Plugin Integration', () => {
		it('should create plugin with all hooks configured', () => {
			const plugin = gasPlugin({
				autoDetect: true,
				include: ['src', 'lib'],
				exclude: ['**/*.test.ts', '**/*.spec.ts'],
				outDir: 'dist',
				transformLogger: true,
				copyAppsscriptJson: true,
				enablePathAliases: true,
				autoDetectPathAliases: true,
			})

			expect(plugin.name).toBe('vite-plugin-gas')
			expect(plugin.enforce).toBe('post')
			expect(plugin.config).toBeDefined()
			expect(plugin.transform).toBeDefined()
			expect(plugin.generateBundle).toBeDefined()
			expect(plugin.writeBundle).toBeDefined()
		})

		it('should handle plugin lifecycle correctly', () => {
			const plugin = gasPlugin()
			const mockContext = {
				addWatchFile: vi.fn(),
				emitFile: vi.fn(),
				error: vi.fn(),
				warn: vi.fn(),
			}

			// Test transform hook
			if (typeof plugin.transform === 'function') {
				const jsResult = plugin.transform.call(
					mockContext,
					'console.log("test");',
					'src/main.js'
				)
				expect(jsResult).toBeDefined()

				const tsResult = plugin.transform.call(
					mockContext,
					'console.log("test");',
					'src/main.ts'
				)
				expect(tsResult).toBeNull() // TypeScript handled by Vite
			}

			// Test generateBundle hook
			if (plugin.generateBundle) {
				expect(() => {
					if (typeof plugin.generateBundle === 'function') {
						plugin.generateBundle.call(mockContext, {}, {})
					} else if (
						plugin.generateBundle &&
						'handler' in plugin.generateBundle
					) {
						plugin.generateBundle.handler.call(mockContext, {}, {})
					}
				}).not.toThrow()
			}

			// Test writeBundle hook
			if (plugin.writeBundle) {
				mockExistsSync.mockReturnValue(false)
				expect(() => {
					if (typeof plugin.writeBundle === 'function') {
						plugin.writeBundle.call(mockContext, {})
					} else if (plugin.writeBundle && 'handler' in plugin.writeBundle) {
						plugin.writeBundle.handler.call(mockContext, {})
					}
				}).not.toThrow()
			}
		})
	})

	describe('Real-world Use Cases', () => {
		it('should handle Google Sheets automation script', () => {
			const sheetsCode = `
import { SheetHelper } from './utils/SheetHelper';

export function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit) {
	console.log('Sheet edited:', e.range.getA1Notation());
	
	const helper = new SheetHelper();
	helper.processEdit(e);
}

export function onOpen() {
	console.log('Spreadsheet opened');
	SpreadsheetApp.getUi()
		.createMenu('Custom Menu')
		.addItem('Process Data', 'processData')
		.addToUi();
}

function processData() {
	console.log('Processing data...');
	// Process spreadsheet data
}
`

			let result = removeModuleStatements(sheetsCode)
			result = transformLogger(result)
			result = preserveGasFunctions(result)

			// Verify GAS-specific transformations
			expect(result).toContain('/* @preserve onEdit */')
			expect(result).toContain('/* @preserve onOpen */')
			expect(result).toContain('Logger.log')
			expect(result).not.toContain('console.log')
			expect(result).not.toContain('import')
			expect(result).not.toContain('export')

			// Verify GAS API calls are preserved
			expect(result).toContain('SpreadsheetApp.getUi()')
			expect(result).toContain('createMenu')
			expect(result).toContain('addItem')
		})

		it('should handle Gmail automation script', () => {
			const gmailCode = `
import { EmailProcessor } from './email/EmailProcessor';

function doPost(e: GoogleAppsScript.Events.DoPost) {
	console.log('Webhook received:', e.postData.contents);
	
	const processor = new EmailProcessor();
	return processor.handleWebhook(e);
}

export function processEmails() {
	console.warn('Starting email processing...');
	
	const threads = GmailApp.search('is:unread', 0, 10);
	threads.forEach(thread => {
		console.log('Processing thread:', thread.getFirstMessageSubject());
		// Process email thread
	});
}
`

			let result = removeModuleStatements(gmailCode)
			result = transformLogger(result)
			result = preserveGasFunctions(result)

			// Verify transformations
			expect(result).toContain('/* @preserve doPost */')
			expect(result).toContain('Logger.log')
			expect(result).toContain('Logger.warn')
			expect(result).not.toContain('console.log')
			expect(result).not.toContain('import')
			expect(result).not.toContain('export')

			// Verify Gmail API calls are preserved
			expect(result).toContain('GmailApp.search')
			expect(result).toContain('getFirstMessageSubject')
		})
	})
})
