/**
 * Jest Setup File for Apartment Auditor
 *
 * This file is executed before any test suite runs.
 * Use it to configure mocks, set environment variables, and initialize test utilities.
 */

// ===========================
// Mock AsyncStorage
// ===========================
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiSet: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve()),
}));

// ===========================
// Mock Expo Router
// ===========================
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  useSegments: () => [],
  Stack: {
    Screen: jest.fn(() => null),
    Navigator: jest.fn(({ children }) => children),
  },
  Tabs: {
    Screen: jest.fn(() => null),
    Navigator: jest.fn(({ children }) => children),
  },
  Link: jest.fn(({ children }) => children),
}));

// ===========================
// Mock Image Picker
// ===========================
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      assets: [
        {
          uri: 'file://mock-image.jpg',
          width: 800,
          height: 600,
          fileName: 'mock-image.jpg',
          type: 'image',
        },
      ],
      cancelled: false,
    })
  ),
  launchCameraAsync: jest.fn(() =>
    Promise.resolve({
      assets: [
        {
          uri: 'file://mock-photo.jpg',
          width: 1024,
          height: 768,
          fileName: 'mock-photo.jpg',
          type: 'image',
        },
      ],
      cancelled: false,
    })
  ),
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true, status: 'granted' })
  ),
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true, status: 'granted' })
  ),
  MediaTypeOptions: {
    Images: 'Images',
    Videos: 'Videos',
    All: 'All',
  },
}));

// ===========================
// Mock Expo Print
// ===========================
jest.mock('expo-print', () => ({
  printAsync: jest.fn(() => Promise.resolve()),
}));

// ===========================
// Mock Expo Sharing
// ===========================
jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// ===========================
// Mock React Native Contacts
// ===========================
jest.mock('react-native-contacts', () => ({
  getAll: jest.fn(() =>
    Promise.resolve([
      {
        recordID: '1',
        name: 'John Doe',
        phoneNumbers: [{ label: 'mobile', number: '+1234567890' }],
        emailAddresses: [{ label: 'work', email: 'john@example.com' }],
      },
    ])
  ),
  openContactPicker: jest.fn(() =>
    Promise.resolve({
      recordID: '1',
      name: 'John Doe',
      phoneNumbers: [{ label: 'mobile', number: '+1234567890' }],
    })
  ),
}));

// ===========================
// Mock Expo File System
// ===========================
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock-docs/',
  cacheDirectory: '/mock-cache/',
  copyAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() =>
    Promise.resolve({
      exists: true,
      isDirectory: false,
      modificationTime: Date.now(),
      size: 1024,
    })
  ),
}));

// ===========================
// Mock Safe Area Context
// ===========================
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

// ===========================
// Mock Gesture Handler
// ===========================
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  Swipeable: ({ children }: { children: React.ReactNode }) => children,
  PanGestureHandler: ({ children }: { children: React.ReactNode }) => children,
}));

// ===========================
// Mock Expo Constants
// ===========================
jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'Apartment Auditor',
    slug: 'apartment-auditor',
  },
  manifest: {},
  manifest2: {},
}));

// ===========================
// Global Test Utilities
// ===========================

// Define React Native globals for tests
(global as any).__DEV__ = true;

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// ===========================
// Setup Timers
// ===========================
jest.useFakeTimers();

// ===========================
// Zustand Store Management
// ===========================
import { resetAllStores } from './helpers/zustandHelper';

// ===========================
// Reset Mocks Before Each Test
// ===========================
beforeEach(() => {
  // Reset all Zustand stores first
  resetAllStores();

  jest.clearAllMocks();
  jest.runAllTimers(); // Clear any pending timers
});

// ===========================
// Cleanup After Each Test
// ===========================
afterEach(() => {
  jest.clearAllTimers();
});

// ===========================
// Global Error Handler
// ===========================
(global as any).onUnhandledRejection = jest.fn();

export {};
