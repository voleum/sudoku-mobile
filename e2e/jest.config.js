/**
 * Jest Configuration for E2E Tests (Detox)
 * Согласно 2.3.4-testing-strategy.md
 */

module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.ts', '<rootDir>/e2e/**/*.test.tsx'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};
