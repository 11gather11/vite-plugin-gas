/**
 * Transform arrow functions to regular functions for GAS library compatibility
 */
export function transformArrowFunctions(code: string): string {
	let result = code

	// Transform export const functionName = (params) => { body }
	// Only match patterns that are clearly arrow function assignments
	result = result.replace(
		/export\s+const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*\{/g,
		'export function $1($2) {'
	)

	// Transform const/let/var functionName = (params) => { body }
	// Use more specific pattern to avoid matching complex expressions
	result = result.replace(
		/^(\s*)(?:const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*\{/gm,
		'$1function $2($3) {'
	)

	// Transform simple arrow functions: const func = (params) => expression
	// Only match simple expressions, not complex method chains
	result = result.replace(
		/^(\s*)(?:const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*([^;{}\n]+);?\s*$/gm,
		'$1function $2($3) { return $4; }'
	)

	// Transform export const func = (params) => expression
	result = result.replace(
		/^(\s*)export\s+(?:const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*([^;{}\n]+);?\s*$/gm,
		'$1export function $2($3) { return $4; }'
	)

	// Handle arrow functions with no parameters: () => {}
	result = result.replace(
		/^(\s*)(?:const|let|var)\s+(\w+)\s*=\s*\(\s*\)\s*=>\s*\{/gm,
		'$1function $2() {'
	)

	result = result.replace(
		/^(\s*)export\s+(?:const|let|var)\s+(\w+)\s*=\s*\(\s*\)\s*=>\s*\{/gm,
		'$1export function $2() {'
	)

	return result
}

/**
 * Remove import/export statements
 */
export function removeModuleStatements(code: string): string {
	let result = code

	// Remove import statements (supports multiple lines)
	result = result.replace(
		/import\s+(?:[^;]+\s+from\s+)?['"][^'"]*['"];?\s*/g,
		''
	)
	result = result.replace(/import\s+['"][^'"]*['"];?\s*/g, '')
	result = result.replace(
		/import\s*\{[^}]*\}\s*from\s*['"][^'"]*['"];?\s*/g,
		''
	)
	result = result.replace(
		/import\s+\*\s+as\s+\w+\s+from\s*['"][^'"]*['"];?\s*/g,
		''
	)
	result = result.replace(
		/import\s+\w+\s*,\s*\{[^}]*\}\s*from\s*['"][^'"]*['"];?\s*/g,
		''
	)

	// Remove export statements
	result = result.replace(/export\s+default\s+/g, '')
	result = result.replace(
		/export\s+\{[^}]*\}\s*(from\s*['"][^'"]*['"])?\s*;?\s*/g,
		''
	)
	result = result.replace(/export\s+\*\s+from\s*['"][^'"]*['"];?\s*/g, '')
	result = result.replace(
		/export\s+(?=(?:const|let|var|function|class|interface|type|enum))/g,
		''
	)

	// Clean up empty lines
	result = result.replace(/\n\s*\n\s*\n/g, '\n\n')

	return result
}

/**
 * Preserve GAS special functions (anti-minify)
 */
export function preserveGasFunctions(code: string): string {
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

	// Add preserve comments for function names
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
 * Transform console.log → Logger.log
 */
export function transformLogger(code: string): string {
	return code
		.replace(/console\.log\(/g, 'Logger.log(')
		.replace(/console\.warn\(/g, 'Logger.warn(')
		.replace(/console\.error\(/g, 'Logger.error(')
}
