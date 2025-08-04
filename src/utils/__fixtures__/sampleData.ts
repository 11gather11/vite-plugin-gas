/**
 * Utils モジュール用のテストフィクスチャ
 */

export const sampleTsConfig = {
	compilerOptions: {
		baseUrl: '.',
		paths: {
			'@/*': ['src/*'],
			'@components/*': ['src/components/*'],
			'@utils/*': ['src/utils/*'],
			'~/*': ['src/*'],
		},
	},
}

export const sampleViteConfig = {
	resolve: {
		alias: {
			'@': './src',
			'@components': './src/components',
		},
	},
}

export const sampleAppsscriptJson = {
	timeZone: 'Asia/Tokyo',
	dependencies: {},
	exceptionLogging: 'STACKDRIVER',
	executionApi: {
		access: 'DOMAIN',
	},
}

export const sampleCodeTransformations = {
	withImportsExports: `import { helper } from './helper';
export function main() {
	console.log('test');
	return helper.process();
}`,

	withoutImportsExports: `function main() {
	Logger.log('test');
	return helper.process();
}`,

	gasSpecialFunction: `export function onEdit(e) {
	console.log('Cell edited');
	// Handle edit
}`,

	transformedGasFunction: `/* @preserve onEdit */ function onEdit(e) {
	Logger.log('Cell edited');
	// Handle edit
}`,

	multipleGasFunctions: `function onEdit(event) {
	console.log('Sheet edited');
}

function onOpen() {
	Logger.log('Spreadsheet opened');
}

function doGet(request) {
	return HtmlService.createHtmlOutput('Hello');
}`,

	transformedMultipleGasFunctions: `/* @preserve onEdit */ function onEdit(event) {
	console.log('Sheet edited');
}

/* @preserve onOpen */ function onOpen() {
	Logger.log('Spreadsheet opened');
}

/* @preserve doGet */ function doGet(request) {
	return HtmlService.createHtmlOutput('Hello');
}`,

	// Logger transformation test data
	consoleLogCode: `console.log('Basic message');
console.log('User ID:', 123);
console.warn('Warning');
console.error('Error');`,

	expectedLoggerCode: `Logger.log('Basic message');
Logger.log('User ID:', 123);
Logger.warn('Warning');
Logger.error('Error');`,

	mixedLoggerCode: `Logger.log('Already using Logger');
console.log('Convert this');`,

	expectedMixedLoggerCode: `Logger.log('Already using Logger');
Logger.log('Convert this');`,

	// Import/Export removal test data
	complexImportsExports: `import { helper } from './utils';
import * as api from './api';
import type { User } from './types';

export function main() {
  return helper.process();
}`,

	exportVariousTypes: `export function publicFunction() {
  return 'public';
}

export const CONFIG = { version: '1.0' };

export default class MyClass {}`,
}
