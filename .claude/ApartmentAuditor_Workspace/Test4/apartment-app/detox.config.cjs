/** @type {import('@wix/detox').DetoxConfig} */
module.exports = {
  // ===========================
  // Detox Configuration for Apartment Auditor
  // ===========================

  testRunner: 'jest',

  // ===========================
  // Build Configurations
  // ===========================
  configurations: {
    'ios.sim.debug': {
      device: {
        type: 'ios.simulator',
        device: {
          type: 'iPhone 15',
        },
      },
      app: 'ios.debug',
    },

    'ios.sim.release': {
      device: {
        type: 'ios.simulator',
        device: {
          type: 'iPhone 15',
        },
      },
      app: 'ios.release',
    },

    'android.emu.debug': {
      device: {
        type: 'android.emulator',
        device: {
          avdName: 'Pixel_4_API_31',
        },
      },
      app: 'android.debug',
    },

    'android.emu.release': {
      device: {
        type: 'android.emulator',
        device: {
          avdName: 'Pixel_4_API_31',
        },
      },
      app: 'android.release',
    },
  },

  // ===========================
  // App Build Configurations
  // ===========================
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/ApartmentAuditor.app',
      build: 'xcodebuild -workspace ios/ApartmentAuditor.xcworkspace -scheme ApartmentAuditor -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
    },

    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/ApartmentAuditor.app',
      build: 'xcodebuild -workspace ios/ApartmentAuditor.xcworkspace -scheme ApartmentAuditor -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
    },

    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
    },

    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release'
    },
  },

  // ===========================
  // Test Runner Configuration
  // ===========================
  testRunner: 'jest',

  // ===========================
  // Jest Configuration
  // ===========================
  jestConfig: {
    testTimeout: 120000,
    testRegex: 'e2e/.*\\.e2e\\.ts$',
    reporters: [
      'default',
      [
        'jest-junit',
        {
          outputDirectory: './test-results',
          outputName: 'e2e-results.xml',
          uniqueOutputName: 'false',
          classNameTemplate: '{classname}',
          titleTemplate: '{title}',
          ancestorSeparator: ' › ',
          usePathAsClassName: 'true',
        },
      ],
    ],
  },

  // ===========================
  // Cleanup Configuration
  // ===========================
  behavior: {
    init: {
      exposeGlobals: true,
    },
    cleanup: {
      shutdownDevice: false,
    },
  },

  // ===========================
  // Artifacts Configuration
  // ===========================
  artifacts: {
    rootDir: '.artifacts',
    plugins: {
      video: {
        enabled: true,
        recordingFPS: 25,
      },
      screenshot: {
        enabled: true,
        shouldTakeAutomaticSnapshots: true,
        takeWhen: {
          testStart: false,
          testFailure: true,
          testDone: false,
        },
      },
      log: {
        enabled: true,
      },
      uiHierarchy: {
        enabled: true,
      },
      timeline: {
        enabled: false,
      },
    },
  },
};
