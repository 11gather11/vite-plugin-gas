/**
 * TypeScript code with import statements for testing import removal
 * Note: These imports will cause TypeScript errors in fixtures, but that's expected
 * as they're meant to test import statement removal functionality
 */

// Standard library import
// import { format } from 'date-fns'

// Path alias imports (commented to avoid TS errors in fixtures)
// import type { User } from '@/types/user'
// import * as utils from '@utils/helpers'

import { CONFIG } from './simple'

interface User {
	name: string
	id: number
}

export function formatUserInfo(user: User): string {
	const formattedDate = new Date().toISOString().split('T')[0]
	return `User: ${user.name}, Date: ${formattedDate}`
}

export function processData() {
	console.log('Processing data...')
	return [1, 2, 3].map((x) => x * 2)
}

// Re-export
export { CONFIG }
