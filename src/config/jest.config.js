module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['../__tests__'],
	testMatch: ['**/__tests__/**/*.ts?(x)'],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
