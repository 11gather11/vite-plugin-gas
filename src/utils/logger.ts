/**
 * Colored logging utility for vite-plugin-gas
 */

// ANSI color codes
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	dim: '\x1b[2m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
	gray: '\x1b[90m',
} as const

const PREFIX = '[vite-plugin-gas]'

/**
 * Colored logger for consistent output
 */
export const logger = {
	info: (message: string, ...args: unknown[]) => {
		console.log(`${colors.cyan}${PREFIX}${colors.reset} ${message}`, ...args)
	},

	success: (message: string, ...args: unknown[]) => {
		console.log(
			`${colors.green}${PREFIX}${colors.reset} ${colors.green}✅ ${message}${colors.reset}`,
			...args
		)
	},

	warn: (message: string, ...args: unknown[]) => {
		console.warn(
			`${colors.yellow}${PREFIX}${colors.reset} ${colors.yellow}⚠️  ${message}${colors.reset}`,
			...args
		)
	},

	error: (message: string, ...args: unknown[]) => {
		console.error(
			`${colors.red}${PREFIX}${colors.reset} ${colors.red}❌ ${message}${colors.reset}`,
			...args
		)
	},

	debug: (message: string, ...args: unknown[]) => {
		if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
			console.log(
				`${colors.gray}${PREFIX}${colors.reset} ${colors.dim}🔍 ${message}${colors.reset}`,
				...args
			)
		}
	},

	verbose: (message: string, ...args: unknown[]) => {
		if (process.env.VERBOSE) {
			console.log(
				`${colors.gray}${PREFIX}${colors.reset} ${colors.dim}${message}${colors.reset}`,
				...args
			)
		}
	},
} as const
