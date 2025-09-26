module.exports = {
  root: true,
  extends: ['@react-native'],
  overrides: [
    {
      files: ['jest.setup.js', '**/__tests__/**/*', '**/*.test.js', '**/*.test.ts', '**/*.test.tsx'],
      env: {
        jest: true,
      },
    },
  ],
};
