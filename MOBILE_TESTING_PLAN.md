# ArgoCD Mobile Responsive Design - Testing Plan

## Overview

This document outlines the comprehensive testing strategy for validating the mobile responsive design implementation in ArgoCD UI. It covers automated tests, manual testing procedures, and acceptance criteria.

## Test Environment Setup

### Required Devices/Viewports

#### Mobile Devices (< 640px)
- **iPhone SE** (375x667) - Smallest modern iPhone
- **iPhone 12/13** (390x844) - Standard iPhone
- **iPhone 12/13 Pro Max** (428x926) - Largest iPhone
- **Samsung Galaxy S21** (360x800) - Common Android
- **Google Pixel 5** (393x851) - Reference Android

#### Tablet Devices (640px - 1023px)
- **iPad Mini** (768x1024)
- **iPad Air** (820x1180)
- **iPad Pro 11"** (834x1194)

#### Desktop (≥ 1024px)
- **1920x1080** - Standard desktop
- **2560x1440** - QHD
- **3840x2160** - 4K

### Browsers to Test
- **Mobile**: Safari (iOS), Chrome (Android), Firefox Mobile
- **Desktop**: Chrome, Firefox, Safari, Edge

## Automated Tests

### Unit Tests

#### 1. Sidebar Component Tests (`sidebar.test.tsx`)

**Location**: `/ui/src/app/sidebar/sidebar.test.tsx`

**Test Cases**:
- ✅ Renders sidebar with navigation items
- ✅ Renders version number
- ✅ Applies collapsed class when hideSidebar is true
- ✅ Renders mobile hamburger menu button
- ✅ Toggles mobile menu when hamburger button is clicked
- ✅ Closes mobile menu when overlay is clicked
- ✅ Closes mobile menu when Escape key is pressed
- ✅ Changes hamburger icon when menu is open/closed
- ✅ Mobile menu overrides hideSidebar preference
- ✅ Closes mobile menu when navigation occurs
- ✅ Highlights active navigation item
- ✅ Hamburger button has proper aria-label for accessibility

**Run Command**:
```bash
cd ui && yarn test sidebar.test.tsx
```

#### 2. Mobile Utilities Tests (`mobile.test.ts`)

**Location**: `/ui/src/app/shared/styles/mobile.test.ts`

**Test Cases**:
- ✅ Mobile breakpoint matches Foundation Sites
- ✅ Mobile breakpoint is suitable for phone screens
- ✅ Touch target size meets accessibility standards (44px)
- ✅ Sidebar dimensions are appropriate
- ✅ Responsive behavior logic for different viewports
- ✅ Layout calculations for mobile, tablet, desktop
- ✅ Form input sizes prevent iOS zoom (16px min)
- ✅ Grid layouts adapt correctly
- ✅ Performance considerations (transform, fixed positioning)

**Run Command**:
```bash
cd ui && yarn test mobile.test.ts
```

#### 3. Viewport Integration Tests (`mobile-viewport.integration.test.tsx`)

**Location**: `/ui/src/app/__tests__/mobile-viewport.integration.test.tsx`

**Test Cases**:
- ✅ Detects mobile viewports correctly (375px, 390px, 428px)
- ✅ Detects tablet viewports correctly (768px+)
- ✅ Detects desktop viewports correctly (1024px+)
- ✅ Tests all common mobile devices
- ✅ Tests all common tablet devices
- ✅ Handles landscape orientation
- ✅ Tests breakpoint boundaries (639px, 640px)
- ✅ Edge cases (320px old phones, 2560px 4K displays)
- ✅ Content width calculations
- ✅ Grid column calculations
- ✅ WCAG accessibility compliance

**Run Command**:
```bash
cd ui && yarn test mobile-viewport.integration.test.tsx
```

### Running All Tests

```bash
cd ui
yarn test
```

### Test Coverage

Generate coverage report:
```bash
cd ui
yarn test --coverage
```

**Target Coverage**:
- Sidebar component: > 80%
- Mobile utilities: > 90%
- Integration tests: > 70%

## Manual Testing Checklist

### Phase 1: Mobile Sidebar & Navigation

#### Test 1.1: Hamburger Menu Functionality (Mobile)
**Viewport**: iPhone 12 (390px)

**Steps**:
1. Open ArgoCD on mobile browser (or use Chrome DevTools device emulation)
2. Verify hamburger menu button appears in top-left corner
3. Verify hamburger icon shows three horizontal bars (☰)
4. Click hamburger menu button
5. Verify sidebar slides in from left with smooth animation
6. Verify dark overlay appears behind sidebar
7. Verify hamburger icon changes to X (✕)
8. Click overlay
9. Verify sidebar slides out and menu closes
10. Open menu again, press Escape key
11. Verify menu closes

**Expected Results**:
- ✅ Hamburger button is visible and tappable (minimum 44px)
- ✅ Sidebar slides in smoothly (300ms transition)
- ✅ Overlay has semi-transparent dark background
- ✅ Menu closes on overlay click or Escape key
- ✅ Icon changes between bars and X

**Status**: [ ] Pass [ ] Fail

---

#### Test 1.2: Sidebar Content on Mobile
**Viewport**: iPhone SE (375px)

**Steps**:
1. Open hamburger menu
2. Verify all navigation items are visible
3. Verify Argo logo is displayed
4. Verify version number is shown
5. Tap "Applications" nav item
6. Verify navigation occurs
7. Verify menu auto-closes after navigation

**Expected Results**:
- ✅ All nav items visible and readable
- ✅ Nav items are touch-friendly (44px min height)
- ✅ Logo and version render correctly
- ✅ Tapping nav item navigates and closes menu
- ✅ Active nav item is highlighted

**Status**: [ ] Pass [ ] Fail

---

#### Test 1.3: Desktop Sidebar Behavior
**Viewport**: Desktop 1920x1080

**Steps**:
1. Open ArgoCD on desktop browser
2. Verify hamburger menu is NOT visible
3. Verify sidebar is expanded (230px) by default
4. Verify content area starts after sidebar (left: 230px)
5. Click sidebar collapse arrow
6. Verify sidebar collapses to 60px (icon-only mode)
7. Verify content area adjusts (left: 60px)
8. Click expand arrow
9. Verify sidebar expands back to 230px

**Expected Results**:
- ✅ No hamburger menu on desktop
- ✅ Sidebar is always visible (not overlay)
- ✅ Collapse/expand works smoothly
- ✅ Content area adjusts appropriately
- ✅ Icons remain visible in collapsed state

**Status**: [ ] Pass [ ] Fail

---

### Phase 2: Applications List Mobile View

#### Test 2.1: Applications List Layout (Mobile)
**Viewport**: iPhone 12 (390px)

**Steps**:
1. Navigate to Applications list
2. Verify page content doesn't overflow horizontally
3. Verify no horizontal scrollbar appears
4. Verify application tiles display in single column
5. Verify each tile is readable without zooming
6. Scroll through list
7. Verify smooth scrolling

**Expected Results**:
- ✅ Single column layout on mobile
- ✅ No horizontal scroll
- ✅ Tiles span full width minus padding
- ✅ Content is readable
- ✅ Smooth vertical scrolling

**Status**: [ ] Pass [ ] Fail

---

#### Test 2.2: Search Bar (Mobile)
**Viewport**: iPhone SE (375px)

**Steps**:
1. Navigate to Applications list
2. Verify search bar is visible
3. Verify search bar spans full width
4. Tap search input
5. Verify keyboard appears
6. Verify page doesn't zoom (16px font minimum)
7. Type search query
8. Verify search works correctly

**Expected Results**:
- ✅ Search bar is full width
- ✅ Search bar is 44px tall (touch-friendly)
- ✅ Tapping input doesn't trigger iOS zoom
- ✅ Keyboard interaction works smoothly
- ✅ Search functionality works

**Status**: [ ] Pass [ ] Fail

---

#### Test 2.3: Filter Controls (Mobile)
**Viewport**: iPhone 12 (390px)

**Steps**:
1. Navigate to Applications list
2. Verify filter controls are accessible
3. Tap filter buttons
4. Verify filters open and are usable
5. Apply filters
6. Verify results update correctly

**Expected Results**:
- ✅ Filter buttons are touch-friendly
- ✅ Filter panel is usable on mobile
- ✅ Filters don't cause horizontal scroll
- ✅ Filter interaction works smoothly

**Status**: [ ] Pass [ ] Fail

---

#### Test 2.4: Application Tiles Grid (Tablet)
**Viewport**: iPad Mini (768px)

**Steps**:
1. Navigate to Applications list
2. Verify tiles display in 2 columns
3. Verify tiles are ~280px minimum width
4. Resize window from tablet to mobile
5. Verify grid changes to single column at 640px

**Expected Results**:
- ✅ 2-column grid on tablet
- ✅ Tiles sized appropriately
- ✅ Responsive breakpoint works correctly

**Status**: [ ] Pass [ ] Fail

---

### Phase 3: Touch Interactions

#### Test 3.1: Button Touch Targets
**Viewport**: iPhone 12 (390px)

**Steps**:
1. Navigate through various pages
2. Attempt to tap buttons with finger (not stylus)
3. Verify all buttons are easily tappable
4. Check sync, refresh, delete buttons
5. Verify adequate spacing between buttons

**Expected Results**:
- ✅ All buttons are minimum 44x44px
- ✅ Buttons are easily tapped with finger
- ✅ No accidental taps on adjacent buttons
- ✅ Adequate spacing between interactive elements

**Status**: [ ] Pass [ ] Fail

---

#### Test 3.2: Form Inputs
**Viewport**: iPhone SE (375px)

**Steps**:
1. Navigate to Settings or any form
2. Tap text inputs
3. Verify iOS doesn't zoom the page
4. Verify inputs are at least 44px tall
5. Type in various inputs
6. Verify keyboard interaction works

**Expected Results**:
- ✅ Text inputs use 16px font minimum
- ✅ No zoom when focusing inputs
- ✅ Inputs are touch-friendly height
- ✅ Keyboard doesn't obscure submit buttons

**Status**: [ ] Pass [ ] Fail

---

#### Test 3.3: Dropdown/Select Menus
**Viewport**: iPhone 12 (390px)

**Steps**:
1. Find dropdown menus throughout app
2. Tap to open dropdown
3. Verify dropdown is readable and usable
4. Select an option
5. Verify selection works

**Expected Results**:
- ✅ Dropdowns open properly on mobile
- ✅ Options are touch-friendly
- ✅ No overflow issues
- ✅ Selection works correctly

**Status**: [ ] Pass [ ] Fail

---

### Phase 4: Different Orientations

#### Test 4.1: Portrait to Landscape Rotation
**Viewport**: iPhone 12 (390x844 → 844x390)

**Steps**:
1. Open app in portrait mode
2. Rotate device to landscape
3. Verify layout adapts correctly
4. Verify sidebar behavior in landscape
5. Rotate back to portrait
6. Verify no visual bugs

**Expected Results**:
- ✅ Layout adapts to landscape (844px > 640px, shows desktop layout)
- ✅ Content remains accessible
- ✅ No visual glitches during rotation

**Status**: [ ] Pass [ ] Fail

---

### Phase 5: Cross-Browser Testing

#### Test 5.1: Safari (iOS)
**Device**: iPhone 12, iOS Safari

**Steps**:
1. Test all functionality from Tests 1-4
2. Verify CSS animations work
3. Verify touch events work
4. Check for Safari-specific issues

**Expected Results**:
- ✅ All features work on Safari
- ✅ No vendor-specific bugs
- ✅ Animations are smooth

**Status**: [ ] Pass [ ] Fail

---

#### Test 5.2: Chrome (Android)
**Device**: Samsung Galaxy S21, Chrome

**Steps**:
1. Test all functionality from Tests 1-4
2. Verify responsive breakpoints
3. Check touch interactions
4. Verify no Android-specific issues

**Expected Results**:
- ✅ All features work on Chrome Android
- ✅ Material Design interactions feel natural
- ✅ No rendering issues

**Status**: [ ] Pass [ ] Fail

---

#### Test 5.3: Desktop Chrome DevTools
**Viewport**: Chrome DevTools Device Mode

**Steps**:
1. Open Chrome DevTools (F12)
2. Enable Device Toolbar (Ctrl+Shift+M)
3. Test various device presets:
   - iPhone SE
   - iPhone 12 Pro
   - iPad
   - Galaxy S21
4. Verify responsive behavior at each breakpoint

**Expected Results**:
- ✅ Layout adapts correctly for each device
- ✅ No console errors
- ✅ All breakpoints work as expected

**Status**: [ ] Pass [ ] Fail

---

### Phase 6: Accessibility (A11y)

#### Test 6.1: Screen Reader (Mobile)
**Tool**: VoiceOver (iOS) or TalkBack (Android)

**Steps**:
1. Enable screen reader
2. Navigate through mobile interface
3. Verify hamburger button has descriptive label
4. Verify nav items are announced correctly
5. Verify interactive elements are accessible

**Expected Results**:
- ✅ Hamburger button announces "Toggle menu"
- ✅ All nav items have proper labels
- ✅ Interactive elements are keyboard/screen reader accessible

**Status**: [ ] Pass [ ] Fail

---

#### Test 6.2: Keyboard Navigation
**Viewport**: Desktop 1920x1080

**Steps**:
1. Navigate using Tab key only
2. Verify focus indicators are visible
3. Verify all interactive elements are reachable
4. Test Escape key to close modals/menus

**Expected Results**:
- ✅ Clear focus indicators
- ✅ Logical tab order
- ✅ All elements keyboard-accessible
- ✅ Escape key closes overlays

**Status**: [ ] Pass [ ] Fail

---

## Performance Testing

### Test P1: Mobile Page Load Time
**Viewport**: iPhone 12 on 3G connection (throttled)

**Steps**:
1. Open Chrome DevTools Network tab
2. Enable "Slow 3G" throttling
3. Load ArgoCD applications list
4. Measure page load time

**Target**: < 3 seconds on 3G

**Status**: [ ] Pass [ ] Fail

---

### Test P2: Animation Performance
**Viewport**: iPhone SE (375px)

**Steps**:
1. Open Chrome DevTools Performance tab
2. Start recording
3. Open/close sidebar multiple times
4. Stop recording
5. Check for frame drops (should maintain 60 FPS)

**Target**: Maintain 60 FPS during animations

**Status**: [ ] Pass [ ] Fail

---

## Regression Testing

### Critical Desktop Functionality

Ensure mobile changes don't break desktop:

- [ ] Desktop sidebar collapse/expand works
- [ ] Application list grid displays correctly
- [ ] All existing keyboard shortcuts work
- [ ] Settings pages render correctly
- [ ] Application details view works
- [ ] Sync/refresh operations work
- [ ] No visual regressions on desktop

## Bug Reporting Template

When filing bugs, use this template:

```markdown
**Title**: [Mobile] Brief description of issue

**Environment**:
- Device: iPhone 12
- Viewport: 390x844
- Browser: Safari 15.0
- OS: iOS 15.0

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Behavior**:
What should happen

**Actual Behavior**:
What actually happens

**Screenshots**:
[Attach screenshots]

**Severity**: Critical / High / Medium / Low
```

## Acceptance Criteria

Phase 1 is considered complete when:

- ✅ All automated tests pass (100%)
- ✅ All manual test cases pass on iOS Safari and Chrome Android
- ✅ No horizontal scrolling on mobile viewports
- ✅ All interactive elements meet 44px touch target minimum
- ✅ Text inputs don't trigger iOS zoom (16px font minimum)
- ✅ Sidebar hamburger menu works flawlessly
- ✅ No visual regressions on desktop
- ✅ Page load time < 3s on 3G
- ✅ Animations maintain 60 FPS
- ✅ WCAG 2.1 AA accessibility compliance

## Test Execution Schedule

### Pre-Commit
- Run unit tests locally
- Manual spot check on Chrome DevTools mobile emulation

### Pre-PR
- Run full test suite
- Manual testing on at least 2 real mobile devices
- Cross-browser testing (Safari, Chrome)

### Pre-Merge
- Code review
- Full manual testing checklist completion
- Performance testing
- Accessibility audit

### Post-Merge
- Monitor for user-reported issues
- Analytics tracking for mobile usage patterns

## Tools & Resources

### Testing Tools
- **Chrome DevTools**: Device emulation, performance profiling
- **BrowserStack**: Real device cloud testing
- **Lighthouse**: Mobile performance auditing
- **axe DevTools**: Accessibility testing
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Apple Human Interface Guidelines - iOS](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design - Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)
- [MDN - Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

## Notes

- Test on real devices whenever possible (emulators don't capture all issues)
- Pay special attention to form interactions on iOS (zoom prevention)
- Touch targets should feel natural - if you miss taps frequently, they're too small
- Test in both light and dark modes
- Test with slow network connections
- Consider testing with reduced motion preferences enabled

---

**Last Updated**: 2025-12-27
**Phase**: 1 - Core Mobile Support
**Status**: Ready for Testing
