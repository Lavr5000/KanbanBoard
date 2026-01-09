/**
 * Tests for Mobile Onboarding Storage
 * Тестирование хранения состояния мобильного онбординга
 */

import {
  isMobileOnboardingCompleted,
  setMobileOnboardingCompleted,
  saveMobileOnboardingProgress,
  getMobileOnboardingProgress,
  clearMobileOnboardingProgress,
} from '@/features/mobile-onboarding/lib/mobileStorage';

describe('Mobile Onboarding Storage', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    (localStorage.removeItem as jest.Mock).mockClear();
  });

  describe('isMobileOnboardingCompleted', () => {
    it('should return true when localStorage has "true"', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('true');

      expect(isMobileOnboardingCompleted()).toBe(true);
      expect(localStorage.getItem).toHaveBeenCalledWith('mobile_onboarding_completed');
    });

    it('should return false when localStorage has null', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      expect(isMobileOnboardingCompleted()).toBe(false);
    });

    it('should return false when localStorage has "false"', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('false');

      expect(isMobileOnboardingCompleted()).toBe(false);
    });

    it('should return false when localStorage throws error', () => {
      (localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      expect(isMobileOnboardingCompleted()).toBe(false);
    });
  });

  describe('setMobileOnboardingCompleted', () => {
    it('should set "true" in localStorage when completed', () => {
      setMobileOnboardingCompleted(true);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mobile_onboarding_completed',
        'true'
      );
    });

    it('should set "false" in localStorage when not completed', () => {
      setMobileOnboardingCompleted(false);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mobile_onboarding_completed',
        'false'
      );
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => setMobileOnboardingCompleted(true)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      (localStorage.setItem as jest.Mock).mockReset();
    });
  });

  describe('saveMobileOnboardingProgress', () => {
    it('should save step number to localStorage', () => {
      saveMobileOnboardingProgress(3);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mobile_onboarding_current_step',
        '3'
      );
    });

    it('should save step 0', () => {
      saveMobileOnboardingProgress(0);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mobile_onboarding_current_step',
        '0'
      );
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('Storage full');
      });

      expect(() => saveMobileOnboardingProgress(5)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      (localStorage.setItem as jest.Mock).mockReset();
    });
  });

  describe('getMobileOnboardingProgress', () => {
    it('should return saved step number', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('4');

      expect(getMobileOnboardingProgress()).toBe(4);
      expect(localStorage.getItem).toHaveBeenCalledWith('mobile_onboarding_current_step');
    });

    it('should return 0 when no progress saved', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      expect(getMobileOnboardingProgress()).toBe(0);
    });

    it('should return 0 when localStorage throws error', () => {
      (localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('Access denied');
      });

      expect(getMobileOnboardingProgress()).toBe(0);
    });

    it('should handle invalid stored values', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('invalid');

      const result = getMobileOnboardingProgress();
      expect(result).toBe(NaN); // parseInt returns NaN for invalid input
    });
  });

  describe('clearMobileOnboardingProgress', () => {
    it('should remove both localStorage keys', () => {
      clearMobileOnboardingProgress();

      expect(localStorage.removeItem).toHaveBeenCalledWith('mobile_onboarding_completed');
      expect(localStorage.removeItem).toHaveBeenCalledWith('mobile_onboarding_current_step');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (localStorage.removeItem as jest.Mock).mockImplementation(() => {
        throw new Error('Access denied');
      });

      expect(() => clearMobileOnboardingProgress()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      (localStorage.removeItem as jest.Mock).mockReset();
    });
  });
});

describe('Mobile Onboarding Storage - Edge Cases', () => {
  beforeEach(() => {
    (localStorage.setItem as jest.Mock).mockClear();
  });

  it('should handle concurrent access', () => {
    // Simulate concurrent writes
    setMobileOnboardingCompleted(true);
    saveMobileOnboardingProgress(2);
    setMobileOnboardingCompleted(true);
    saveMobileOnboardingProgress(3);

    expect(localStorage.setItem).toHaveBeenCalledTimes(4);
  });

  it('should handle rapid progress updates', () => {
    (localStorage.setItem as jest.Mock).mockClear();

    for (let i = 0; i < 10; i++) {
      saveMobileOnboardingProgress(i);
    }

    expect(localStorage.setItem).toHaveBeenCalledTimes(10);
  });
});
