/**
 * import/export文を削除する
 */
export function removeModuleStatements(code: string): string {
	let result = code

	// import文の削除（複数行に対応）
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

	// export文の削除
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

	// 空行の整理
	result = result.replace(/\n\s*\n\s*\n/g, '\n\n')

	return result
}

/**
 * GAS特殊関数を保護する（minify対策）
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
 * console.log → Logger.log 変換
 */
export function transformLogger(code: string): string {
	return code
		.replace(/console\.log\(/g, 'Logger.log(')
		.replace(/console\.warn\(/g, 'Logger.warn(')
		.replace(/console\.error\(/g, 'Logger.error(')
}
