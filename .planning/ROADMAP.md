# Kanban Board Visual Enhancement Roadmap

**Project:** Glassmorphism Kanban Board Visual Improvements
**Location:** `C:\Users\user\.claude\0 ProEKTi\KanbanBoard`
**Goal:** Enhance visual design and animations of existing kanban board

---

## Overview

The kanban board is functional with Supabase backend, Redux state, and @dnd-kit drag-and-drop. Glassmorphism styles are partially applied. This roadmap focuses on visual polish and animation improvements.

**Current State:**
- ✅ Glass styles defined in `globals.css` (`glass-card`, `glass-dark`, `glass-hover`)
- ✅ TaskCard uses glassmorphism
- ✅ Column uses glassmorphism
- ✅ @dnd-kit drag-and-drop working
- ✅ Drag preview has purple glow effect
- ✅ Drop zone pulse animation on hover
- ✅ Spring physics for drop animation
- ✅ Atmospheric background with animated gradient and glow orbs

---

## Phases

### Phase 01: Drag & Drop Visual Feedback ✅ COMPLETE
**Goal:** Add polished visual feedback during drag operations

**Status:** All 4 plans executed

**Delivered:**
- ✅ Glowing drag preview with purple glow effect
- ✅ Drop zone pulse animation on hover
- ✅ Spring physics for drop animation (cubic-bezier bounce)
- ✅ Touch device optimization (250ms long press)

---

### Phase 02: Board Background Atmosphere ✅ COMPLETE
**Goal:** Create atmospheric background with depth and life

**Status:** All 3 plans executed

**Delivered:**
- ✅ AnimatedGradient: 30s purple-blue-pink gradient shift
- ✅ NoiseTexture: Subtle SVG grain overlay (0.03 opacity)
- ✅ GlowOrb: Configurable ambient light orbs with entrance animation
- ✅ MouseParallax: Spring-physics mouse tracking with proper cleanup
- ✅ BoardBackground: Combined wrapper with 4 staggered orbs
- ✅ Integrated into Board.tsx

**Components created:**
- `src/shared/ui/background/AnimatedGradient.tsx`
- `src/shared/ui/background/NoiseTexture.tsx`
- `src/shared/ui/background/GlowOrb.tsx`
- `src/shared/ui/background/MouseParallax.tsx`
- `src/widgets/board/ui/BoardBackground.tsx`

---

### Phase 03: Task Card Animations
**Goal:** Add delightful micro-interactions to task cards

**Deliverables:**
- Staggered entrance animations on load
- Add/remove animations with AnimatePresence
- Parallax depth effect on hover
- Priority glow enhancements

---

### Phase 04: Polish & Performance
**Goal:** Final polish and ensure smooth 60fps performance

**Deliverables:**
- Reduced motion accessibility support
- GPU optimization verification
- Cross-browser testing
- Performance audit

---

### Phase 05: Testing System Modernization 📋 PLANNED
**Goal:** Build robust test system to catch bugs before production

**Trigger:** Multiple bugs found by user that tests failed to catch:
- Modal z-index issues (Export button window behind columns)
- TypeScript syntax errors passing through
- React 19 + Framer Motion incompatibility

**Research:** Complete - see `phases/05-testing-research/05-RESEARCH.md`

**Plans Created:**
- 05-01: Foundation - Vitest + TypeScript Pre-commit
- 05-02: E2E Testing with Playwright
- 05-03: CI/CD Integration & Coverage Reporting
- 05-04: Component Testing for Critical Paths
- 05-05: Test Documentation & Maintenance Guide

**Planned Deliverables:**
- Vitest setup with React 19 compatibility
- Playwright E2E tests with visual regression
- Pre-commit hooks (Husky + lint-staged)
- TypeScript checking in CI
- Component tests for critical paths

**Expected Outcomes:**
- 70-80% bug prevention rate
- 15-20 hour investment
- Catch z-index, syntax, and compatibility issues automatically

---

## Success Criteria

- [x] All drag operations have clear visual feedback
- [x] Background has depth and atmosphere
- [ ] Transitions feel smooth and springy
- [ ] 60fps performance on desktop
- [ ] Accessible with `prefers-reduced-motion`

---

## Dependencies

- **Existing:** TaskCard.tsx, Column.tsx, Board.tsx
- **Existing:** globals.css with glass styles
- **Existing:** @dnd-kit/core integration
- **Existing:** Framer Motion available

---

**Roadmap created:** 2026-02-01
**Last updated:** 2026-02-02 (Phase 05 plans created)
