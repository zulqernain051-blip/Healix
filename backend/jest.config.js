module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/scripts/dev/jest-isolation.cjs'],
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
};
