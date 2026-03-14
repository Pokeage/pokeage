/** Jest config: ts-jest over engine tests in tests/ and SDK tests in sdk/tests.
    @solana/web3.js pulls a transitive uuid that ships ESM, so uuid is excluded
    from transformIgnorePatterns and compiled by ts-jest (allowJs). */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/sdk/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@pokeage/engine$': '<rootDir>/src/index.ts',
    '^@pokeage/engine/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: {
          strict: false,
          esModuleInterop: true,
          allowJs: true,
          isolatedModules: true,
        },
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!.*uuid)'],
};
