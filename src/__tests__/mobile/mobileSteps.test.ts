/**
 * Tests for Mobile Onboarding Steps
 * Тестирование шагов мобильного онбординга
 */

import { mobileOnboardingSteps } from '@/features/mobile-onboarding/lib/mobileSteps';

describe('Mobile Onboarding Steps', () => {
  it('should have 6 onboarding steps', () => {
    expect(mobileOnboardingSteps).toHaveLength(6);
  });

  describe('Step Structure', () => {
    it('each step should have required properties', () => {
      mobileOnboardingSteps.forEach((step, index) => {
        expect(step).toHaveProperty('element');
        expect(step).toHaveProperty('popover');
        expect(step.popover).toHaveProperty('title');
        expect(step.popover).toHaveProperty('description');
      });
    });

    it('each step should have a title', () => {
      mobileOnboardingSteps.forEach((step) => {
        expect(step.popover.title).toBeTruthy();
        expect(typeof step.popover.title).toBe('string');
      });
    });

    it('each step should have a description', () => {
      mobileOnboardingSteps.forEach((step) => {
        expect(step.popover.description).toBeTruthy();
        expect(typeof step.popover.description).toBe('string');
      });
    });
  });

  describe('Step Content', () => {
    it('first step should be welcome message', () => {
      const firstStep = mobileOnboardingSteps[0];
      expect(firstStep.popover.title).toContain('Добро пожаловать');
    });

    it('should have column filter step', () => {
      const columnFilterStep = mobileOnboardingSteps.find(
        (step) => step.element === '[data-mobile-tour="column-filter"]'
      );
      expect(columnFilterStep).toBeDefined();
      expect(columnFilterStep?.popover.title).toContain('Фильтр колонок');
    });

    it('should have task list step', () => {
      const taskListStep = mobileOnboardingSteps.find(
        (step) => step.element === '[data-mobile-tour="task-list"]'
      );
      expect(taskListStep).toBeDefined();
    });

    it('should have swipe task step', () => {
      const swipeStep = mobileOnboardingSteps.find(
        (step) => step.element === '[data-mobile-tour="swipe-task"]'
      );
      expect(swipeStep).toBeDefined();
      expect(swipeStep?.popover.title).toContain('Перемещение задач');
    });

    it('should have AI tab step', () => {
      const aiStep = mobileOnboardingSteps.find(
        (step) => step.element === '[data-mobile-tour="mobile-ai-tab"]'
      );
      expect(aiStep).toBeDefined();
      expect(aiStep?.popover.title).toContain('AI');
    });

    it('should have add task step', () => {
      const addTaskStep = mobileOnboardingSteps.find(
        (step) => step.element === '[data-mobile-tour="add-task-mobile"]'
      );
      expect(addTaskStep).toBeDefined();
      expect(addTaskStep?.popover.title).toContain('Создание задач');
    });
  });

  describe('Element Selectors', () => {
    it('should use data-mobile-tour attributes for targeting', () => {
      const elementsWithDataAttr = mobileOnboardingSteps.filter(
        (step) => step.element.includes('data-mobile-tour')
      );

      // All steps except the first (which targets 'body') should use data attributes
      expect(elementsWithDataAttr.length).toBeGreaterThanOrEqual(5);
    });

    it('first step should target body', () => {
      expect(mobileOnboardingSteps[0].element).toBe('body');
    });
  });

  describe('Popover Configuration', () => {
    it('should have bottom or top positioning', () => {
      mobileOnboardingSteps.forEach((step) => {
        if (step.popover.side) {
          expect(['bottom', 'top']).toContain(step.popover.side);
        }
      });
    });

    it('should have center alignment', () => {
      mobileOnboardingSteps.forEach((step) => {
        if (step.popover.align) {
          expect(step.popover.align).toBe('center');
        }
      });
    });
  });

  describe('Localization', () => {
    it('all step titles should be in Russian', () => {
      const russianPattern = /[а-яА-ЯёЁ]/;
      mobileOnboardingSteps.forEach((step) => {
        expect(russianPattern.test(step.popover.title)).toBe(true);
      });
    });

    it('all step descriptions should be in Russian', () => {
      const russianPattern = /[а-яА-ЯёЁ]/;
      mobileOnboardingSteps.forEach((step) => {
        expect(russianPattern.test(step.popover.description)).toBe(true);
      });
    });
  });

  describe('Step Order', () => {
    it('should start with welcome and end with add task', () => {
      const firstStep = mobileOnboardingSteps[0];
      const lastStep = mobileOnboardingSteps[mobileOnboardingSteps.length - 1];

      expect(firstStep.popover.title).toContain('Добро пожаловать');
      expect(lastStep.popover.title).toContain('Создание задач');
    });

    it('should follow logical UX flow', () => {
      // 1. Welcome -> 2. Column Filter -> 3. Task List -> 4. Swipe -> 5. AI -> 6. Add Task
      const expectedOrder = [
        'body',
        '[data-mobile-tour="column-filter"]',
        '[data-mobile-tour="task-list"]',
        '[data-mobile-tour="swipe-task"]',
        '[data-mobile-tour="mobile-ai-tab"]',
        '[data-mobile-tour="add-task-mobile"]',
      ];

      mobileOnboardingSteps.forEach((step, index) => {
        expect(step.element).toBe(expectedOrder[index]);
      });
    });
  });
});
