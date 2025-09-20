const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    minifierConfig: {
      mangle: { keep_fnames: true },
      output: { comments: false },
    },
  },
  resolver: {
    alias: {
      '@': './src',
      '@components': './src/presentation/components',
      '@screens': './src/presentation/screens',
      '@services': './src/infrastructure/services',
      '@domain': './src/domain',
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
