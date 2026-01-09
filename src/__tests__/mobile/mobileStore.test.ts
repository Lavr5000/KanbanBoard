/**
 * Tests for Mobile UI Store (Zustand)
 * Тестирование хранилища состояния мобильного UI
 */

import { useMobileUIStore, isMobileOnboardingCompleted, resetMobileOnboarding } from '@/entities/ui/model/mobileStore';

describe('useMobileUIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMobileUIStore.setState({
      isLeftDrawerOpen: false,
      isRightDrawerOpen: false,
      isFabMenuOpen: false,
      activeColumnIndex: 0,
      isMobileOnboardingActive: false,
      mobileOnboardingStep: 0,
    });

    // Clear localStorage mock
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    (localStorage.removeItem as jest.Mock).mockClear();
  });

  describe('Left Drawer', () => {
    it('should open left drawer and close other drawers', () => {
      const store = useMobileUIStore.getState();

      // Set right drawer as open first
      useMobileUIStore.setState({ isRightDrawerOpen: true });

      store.openLeftDrawer();

      const newState = useMobileUIStore.getState();
      expect(newState.isLeftDrawerOpen).toBe(true);
      expect(newState.isRightDrawerOpen).toBe(false);
      expect(newState.isFabMenuOpen).toBe(false);
    });

    it('should close left drawer', () => {
      useMobileUIStore.setState({ isLeftDrawerOpen: true });

      useMobileUIStore.getState().closeLeftDrawer();

      expect(useMobileUIStore.getState().isLeftDrawerOpen).toBe(false);
    });

    it('should toggle left drawer', () => {
      const store = useMobileUIStore.getState();

      expect(useMobileUIStore.getState().isLeftDrawerOpen).toBe(false);

      store.toggleLeftDrawer();
      expect(useMobileUIStore.getState().isLeftDrawerOpen).toBe(true);

      store.toggleLeftDrawer();
      expect(useMobileUIStore.getState().isLeftDrawerOpen).toBe(false);
    });
  });

  describe('Right Drawer', () => {
    it('should open right drawer and close other drawers', () => {
      const store = useMobileUIStore.getState();

      // Set left drawer as open first
      useMobileUIStore.setState({ isLeftDrawerOpen: true, isFabMenuOpen: true });

      store.openRightDrawer();

      const newState = useMobileUIStore.getState();
      expect(newState.isRightDrawerOpen).toBe(true);
      expect(newState.isLeftDrawerOpen).toBe(false);
      expect(newState.isFabMenuOpen).toBe(false);
    });

    it('should toggle right drawer', () => {
      const store = useMobileUIStore.getState();

      store.toggleRightDrawer();
      expect(useMobileUIStore.getState().isRightDrawerOpen).toBe(true);

      store.toggleRightDrawer();
      expect(useMobileUIStore.getState().isRightDrawerOpen).toBe(false);
    });
  });

  describe('FAB Menu', () => {
    it('should open FAB menu', () => {
      useMobileUIStore.getState().openFabMenu();
      expect(useMobileUIStore.getState().isFabMenuOpen).toBe(true);
    });

    it('should close FAB menu', () => {
      useMobileUIStore.setState({ isFabMenuOpen: true });
      useMobileUIStore.getState().closeFabMenu();
      expect(useMobileUIStore.getState().isFabMenuOpen).toBe(false);
    });

    it('should toggle FAB menu', () => {
      const store = useMobileUIStore.getState();

      store.toggleFabMenu();
      expect(useMobileUIStore.getState().isFabMenuOpen).toBe(true);

      store.toggleFabMenu();
      expect(useMobileUIStore.getState().isFabMenuOpen).toBe(false);
    });
  });

  describe('Column Navigation', () => {
    it('should set active column index', () => {
      useMobileUIStore.getState().setActiveColumnIndex(2);
      expect(useMobileUIStore.getState().activeColumnIndex).toBe(2);
    });

    it('should navigate to next column', () => {
      useMobileUIStore.setState({ activeColumnIndex: 0 });

      useMobileUIStore.getState().nextColumn(5); // 5 total columns
      expect(useMobileUIStore.getState().activeColumnIndex).toBe(1);

      useMobileUIStore.getState().nextColumn(5);
      expect(useMobileUIStore.getState().activeColumnIndex).toBe(2);
    });

    it('should not exceed maximum column index', () => {
      useMobileUIStore.setState({ activeColumnIndex: 4 });

      useMobileUIStore.getState().nextColumn(5); // 5 columns, max index is 4
      expect(useMobileUIStore.getState().activeColumnIndex).toBe(4);
    });

    it('should navigate to previous column', () => {
      useMobileUIStore.setState({ activeColumnIndex: 2 });

      useMobileUIStore.getState().prevColumn();
      expect(useMobileUIStore.getState().activeColumnIndex).toBe(1);
    });

    it('should not go below zero index', () => {
      useMobileUIStore.setState({ activeColumnIndex: 0 });

      useMobileUIStore.getState().prevColumn();
      expect(useMobileUIStore.getState().activeColumnIndex).toBe(0);
    });
  });

  describe('Mobile Onboarding', () => {
    it('should start mobile onboarding', () => {
      useMobileUIStore.getState().startMobileOnboarding();

      const state = useMobileUIStore.getState();
      expect(state.isMobileOnboardingActive).toBe(true);
      expect(state.mobileOnboardingStep).toBe(0);
    });

    it('should navigate to next onboarding step', () => {
      useMobileUIStore.setState({ isMobileOnboardingActive: true, mobileOnboardingStep: 0 });

      useMobileUIStore.getState().nextOnboardingStep();
      expect(useMobileUIStore.getState().mobileOnboardingStep).toBe(1);

      useMobileUIStore.getState().nextOnboardingStep();
      expect(useMobileUIStore.getState().mobileOnboardingStep).toBe(2);
    });

    it('should navigate to previous onboarding step', () => {
      useMobileUIStore.setState({ isMobileOnboardingActive: true, mobileOnboardingStep: 2 });

      useMobileUIStore.getState().prevOnboardingStep();
      expect(useMobileUIStore.getState().mobileOnboardingStep).toBe(1);
    });

    it('should not go below step 0', () => {
      useMobileUIStore.setState({ isMobileOnboardingActive: true, mobileOnboardingStep: 0 });

      useMobileUIStore.getState().prevOnboardingStep();
      expect(useMobileUIStore.getState().mobileOnboardingStep).toBe(0);
    });

    it('should complete mobile onboarding and save to localStorage', () => {
      useMobileUIStore.setState({ isMobileOnboardingActive: true, mobileOnboardingStep: 3 });

      useMobileUIStore.getState().completeMobileOnboarding();

      const state = useMobileUIStore.getState();
      expect(state.isMobileOnboardingActive).toBe(false);
      expect(state.mobileOnboardingStep).toBe(0);
      expect(localStorage.setItem).toHaveBeenCalledWith('mobile_onboarding_completed', 'true');
    });

    it('should skip mobile onboarding', () => {
      useMobileUIStore.setState({ isMobileOnboardingActive: true, mobileOnboardingStep: 2 });

      useMobileUIStore.getState().skipMobileOnboarding();

      const state = useMobileUIStore.getState();
      expect(state.isMobileOnboardingActive).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith('mobile_onboarding_completed', 'true');
    });
  });

  describe('Helper Functions', () => {
    it('isMobileOnboardingCompleted should return true when completed', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('true');

      expect(isMobileOnboardingCompleted()).toBe(true);
    });

    it('isMobileOnboardingCompleted should return false when not completed', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      expect(isMobileOnboardingCompleted()).toBe(false);
    });

    it('resetMobileOnboarding should remove localStorage item', () => {
      resetMobileOnboarding();

      expect(localStorage.removeItem).toHaveBeenCalledWith('mobile_onboarding_completed');
    });
  });
});
