module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/presentation/components',
          '@screens': './src/presentation/screens',
          '@services': './src/infrastructure/services',
          '@domain': './src/domain',
        },
      },
    ],
  ],
};
