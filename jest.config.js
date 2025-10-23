module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  roots: ['<rootDir>/packages/core'],

  testMatch: ['**/*.spec.ts'],

  moduleNameMapper: {
    '^@wikiweave/core$': '<rootDir>/packages/core/src',
  },

  collectCoverageFrom: [
    'packages/core/src/**/*.ts',
    '!packages/core/src/**/*.d.ts',
    '!packages/core/src/**/*.spec.ts',
    '!packages/core/src/types/**',
  ],

  coverageDirectory: 'coverage',

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
