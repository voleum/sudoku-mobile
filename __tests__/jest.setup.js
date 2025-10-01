/**
 * Setup file for integration tests
 * Mocks React Native modules that need to be available before component imports
 */

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: () => ({ width: 375, height: 812 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock PixelRatio - MUST be mocked before StyleSheet is used
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  get: () => 2,
  getFontScale: () => 1,
  getPixelSizeForLayoutSize: (size: number) => size * 2,
  roundToNearestPixel: (size: number) => Math.round(size),
}));

// Mock MMKV storage
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    getAllKeys: jest.fn(() => []),
    clearAll: jest.fn(),
  })),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock SQLite
const mockExecuteSql = jest.fn((sql, params, successCallback) => {
  if (successCallback) {
    successCallback(null, { rows: { length: 0, item: () => ({}) } });
  }
});

jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn((callback) => {
      callback({ executeSql: mockExecuteSql });
    }),
    executeSql: mockExecuteSql,
  })),
  enablePromise: jest.fn(),
}));
