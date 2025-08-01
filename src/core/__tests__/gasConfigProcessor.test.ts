import type { UserConfig } from 'vite'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GasPluginOptions } from '../../types'
import { GasConfigProcessor } from '../gasConfigProcessor'

// detectTypeScriptFilesをモック
vi.mock('../../utils/fileDetector', () => ({
	detectTypeScriptFiles: vi.fn(),
}))

// vite-configのユーティリティをモック
vi.mock('../../utils/viteConfig', () => ({
	applyGasViteConfig: vi.fn(),
	logDetectedFiles: vi.fn(),
}))

import { detectTypeScriptFiles } from '../../utils/fileDetector'
import { applyGasViteConfig, logDetectedFiles } from '../../utils/viteConfig'

const mockDetectTypeScriptFiles = vi.mocked(detectTypeScriptFiles)

describe('GasConfigProcessor', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('constructor', () => {
		it('should merge options with defaults', () => {
			const options: GasPluginOptions = {
				autoDetect: false,
				transformLogger: false,
			}

			const processor = new GasConfigProcessor(options)

			expect(processor.options.autoDetect).toBe(false)
			expect(processor.options.transformLogger).toBe(false)
			expect(processor.options.include).toEqual(['src']) // デフォルト値
			expect(processor.options.outDir).toBe('dist') // デフォルト値
		})

		it('should use default options when no options provided', () => {
			const processor = new GasConfigProcessor()

			expect(processor.options.autoDetect).toBe(true)
			expect(processor.options.include).toEqual(['src'])
			expect(processor.options.exclude).toEqual([
				'**/*.d.ts',
				'**/*.test.ts',
				'**/*.spec.ts',
			])
			expect(processor.options.outDir).toBe('dist')
			expect(processor.options.transformLogger).toBe(true)
		})
	})

	describe('processConfig', () => {
		it('should skip processing when autoDetect is disabled', async () => {
			const options: GasPluginOptions = { autoDetect: false }
			const processor = new GasConfigProcessor(options)
			const config: UserConfig = {}

			await processor.processConfig(config)

			expect(detectTypeScriptFiles).not.toHaveBeenCalled()
			expect(applyGasViteConfig).not.toHaveBeenCalled()
		})

		it('should process config when files are detected', async () => {
			const mockEntryFiles = {
				main: '/src/main.ts',
				utils_helper: '/src/utils/helper.ts',
			}

			mockDetectTypeScriptFiles.mockResolvedValue(mockEntryFiles)

			const processor = new GasConfigProcessor()
			const config: UserConfig = {}

			await processor.processConfig(config)

			expect(detectTypeScriptFiles).toHaveBeenCalledWith(
				['src'],
				['**/*.d.ts', '**/*.test.ts', '**/*.spec.ts']
			)
			expect(applyGasViteConfig).toHaveBeenCalledWith(
				config,
				mockEntryFiles,
				'dist'
			)
			expect(logDetectedFiles).toHaveBeenCalledWith(mockEntryFiles)
		})

		it('should warn when no files are detected', async () => {
			mockDetectTypeScriptFiles.mockResolvedValue({})

			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			const processor = new GasConfigProcessor()
			const config: UserConfig = {}

			await processor.processConfig(config)

			expect(consoleSpy).toHaveBeenCalledWith(
				'[vite-plugin-gas] No TypeScript files found for auto-detection'
			)
			expect(applyGasViteConfig).not.toHaveBeenCalled()
			expect(logDetectedFiles).not.toHaveBeenCalled()

			consoleSpy.mockRestore()
		})

		it('should use custom include and exclude patterns', async () => {
			const options: GasPluginOptions = {
				include: ['lib', 'app'],
				exclude: ['**/*.ignore.ts'],
			}

			mockDetectTypeScriptFiles.mockResolvedValue({ test: '/lib/test.ts' })

			const processor = new GasConfigProcessor(options)
			const config: UserConfig = {}

			await processor.processConfig(config)

			expect(detectTypeScriptFiles).toHaveBeenCalledWith(
				['lib', 'app'],
				['**/*.ignore.ts']
			)
		})

		it('should use custom output directory', async () => {
			const options: GasPluginOptions = {
				outDir: 'build',
			}

			const mockEntryFiles = { main: '/src/main.ts' }
			mockDetectTypeScriptFiles.mockResolvedValue(mockEntryFiles)

			const processor = new GasConfigProcessor(options)
			const config: UserConfig = {}

			await processor.processConfig(config)

			expect(applyGasViteConfig).toHaveBeenCalledWith(
				config,
				mockEntryFiles,
				'build'
			)
		})
	})

	describe('options getter', () => {
		it('should return merged options', () => {
			const options: GasPluginOptions = {
				autoDetect: false,
				include: ['custom'],
			}

			const processor = new GasConfigProcessor(options)
			const result = processor.options

			expect(result.autoDetect).toBe(false)
			expect(result.include).toEqual(['custom'])
			expect(result.exclude).toEqual([
				'**/*.d.ts',
				'**/*.test.ts',
				'**/*.spec.ts',
			]) // デフォルト
		})
	})
})
