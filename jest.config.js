module.exports = {
  // ===========================
  // Jest Configuration for React Native + Expo
  // ===========================

  preset: 'react-native',
  testEnvironment: 'node',

  // ===========================
  // Setup Files
  // ===========================
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts',
  ],

  // ===========================
  // Module Paths & Aliases
  // ===========================
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@constants/(.*)$': '<rootDir>/constants/$1',
    '^@types/(.*)$': '<rootDir>/services/types/$1',
    '^@fixtures/(.*)$': '<rootDir>/tests/fixtures/$1',
  },

  // ===========================
  // Module File Extensions
  // ===========================
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
  ],

  // ===========================
  // Transform Files
  // ===========================
  transform: {
    '^.+\\.(ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      },
    ],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // ===========================
  // Test Match Patterns
  // ===========================
  testMatch: [
    '<rootDir>/tests/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/tests/**/*.{spec,test}.{ts,tsx}',
    '<rootDir>/e2e/**/*.{spec,test}.{ts,tsx}',
  ],

  // ===========================
  // Coverage Configuration
  // ===========================
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/e2e/**',
    '!**/dist/**',
  ],

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/e2e/',
  ],

  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // ===========================
  // Test Timeout
  // ===========================
  testTimeout: 10000,

  // ===========================
  // Globals Configuration
  // ===========================
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },

  // ===========================
  // Ignore Patterns
  // ===========================
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.expo/',
  ],

  // ===========================
  // Watch Plugins
  // ===========================
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  // ===========================
  // Verbose Output
  // ===========================
  verbose: true,

  // ===========================
  // Additional Configuration
  // ===========================
  maxWorkers: '50%',
  bail: false,
  clearMocks: true,
};
