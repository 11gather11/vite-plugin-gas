/**
 * Console.log usage examples for testing logger transformation
 */

export function logExamples() {
	// Basic console.log
	console.log('Basic log message')

	// Console.log with multiple parameters
	console.log('User ID:', 12345, 'Name:', 'John Doe')

	// Console.log with object
	console.log({ userId: 123, name: 'Jane' })

	// Other console methods (should also be transformed)
	console.warn('Warning message')
	console.error('Error message')
	console.info('Info message')

	// Already using Logger (should not be transformed)
	Logger.log('Already using Logger')

	// Mixed usage
	function processUser(id: number) {
		console.log(`Processing user ${id}`)
		// ... processing logic
		Logger.log('Processing completed')
	}

	return processUser
}
