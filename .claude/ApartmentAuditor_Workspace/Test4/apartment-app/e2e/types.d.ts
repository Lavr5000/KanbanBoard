// Global types for Detox E2E tests

declare global {
  var device: {
    launchApp: () => Promise<void>;
    reloadReactNative: () => Promise<void>;
    takeScreenshot: (name?: string) => Promise<void>;
  };

  var element: (by: any) => any;
  var by: {
    id: (id: string) => any;
    text: (text: string) => any;
    label: (label: string) => any;
    type: (type: string) => any;
    traits: (traits: string) => any;
  };

  var expect: (actual: any) => {
    toBeVisible: () => Promise<void>;
    toExist: () => Promise<void>;
    toHaveText: (text: string) => Promise<void>;
    toBeNotVisible: () => Promise<void>;
    toNotExist: () => Promise<void>;
    toBeChecked: () => Promise<void>;
    toBeNotChecked: () => Promise<void>;
    toHaveValue: (value: string) => Promise<void>;
    toBeEnabled: () => Promise<void>;
    toBeDisabled: () => Promise<void>;
  };

  var waitFor: (element: any) => {
    toBeVisible: () => Promise<void>;
    toExist: () => Promise<void>;
    withTimeout: (timeout: number) => {
      toBeVisible: () => Promise<void>;
      toExist: () => Promise<void>;
    };
  };

  var describe: (name: string, fn: () => void) => void;
  var it: (name: string, fn: () => Promise<void>) => void;
  var beforeAll: (fn: () => Promise<void>) => void;
  var beforeEach: (fn: () => Promise<void>) => void;
  var afterAll: (fn: () => Promise<void>) => void;
  var afterEach: (fn: () => Promise<void>) => void;
}

export {};