module.exports = {
  preset: 'react-native',
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
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
  ],
};
