module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/__tests__/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/presentation/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/presentation/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/infrastructure/services/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*)/)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
  ],
  // Coverage configuration (согласно 2.3.4-testing-strategy.md)
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Критические компоненты требуют высокого покрытия
    './src/infrastructure/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/application/usecases/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/coverage/',
  ],
};
