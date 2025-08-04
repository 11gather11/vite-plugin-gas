/**
 * GAS special functions that should be preserved during minification
 * Now with proper Google Apps Script type definitions!
 */

// GAS trigger functions
function onEdit(event: GoogleAppsScript.Events.SheetsOnEdit) {
	Logger.log('Sheet was edited')
	console.log('Event:', event)
}

function onOpen() {
	Logger.log('Spreadsheet opened')
}

function onInstall() {
	Logger.log('Add-on installed')
}

// Web app functions
function doGet(request: GoogleAppsScript.Events.DoGet) {
	Logger.log('GET request received')
	return HtmlService.createHtmlOutput('Hello World')
}

function doPost(request: GoogleAppsScript.Events.DoPost) {
	Logger.log('POST request received')
	return ContentService.createTextOutput('Success')
}

// Custom functions for Sheets
function CUSTOM_FUNCTION(input: string): string {
	return input.toUpperCase()
}

// Regular functions (can be minified)
export function helperFunction() {
	return 'This can be minified'
}
