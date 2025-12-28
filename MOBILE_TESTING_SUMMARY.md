# Mobile Testing Summary

## Automated Tests Created

### 1. Sidebar Component Tests
**File**: `ui/src/app/sidebar/sidebar.test.tsx`
**Test Count**: 15 tests
**Coverage Areas**:
- Desktop sidebar behavior
- Mobile hamburger menu functionality
- Menu toggle interactions
- Overlay backdrop clicks
- Keyboard navigation (Escape key)
- Icon state changes
- Navigation auto-close
- Accessibility (aria-labels)

### 2. Mobile Utilities Tests
**File**: `ui/src/app/shared/styles/mobile.test.ts`
**Test Count**: 20+ tests
**Coverage Areas**:
- Breakpoint validations
- Touch target size compliance
- Sidebar dimension calculations
- Responsive behavior logic
- Layout width calculations
- Form input sizing
- Grid layout mathematics
- Performance optimizations

### 3. Viewport Integration Tests
**File**: `ui/src/app/__tests__/mobile-viewport.integration.test.tsx`
**Test Count**: 25+ tests
**Coverage Areas**:
- Media query detection across viewports
- Common mobile devices (iPhone, Android)
- Common tablet devices (iPad)
- Landscape orientation handling
- Breakpoint boundaries
- Edge cases (320px - 4K displays)
- Grid column calculations
- WCAG accessibility compliance

## Running the Tests

### Install Dependencies First
```bash
cd /home/user/argo-cd/ui
yarn install
```

### Run Individual Test Suites
```bash
# Sidebar tests
yarn test sidebar.test.tsx

# Mobile utilities tests
yarn test mobile.test.ts

# Viewport integration tests
yarn test mobile-viewport.integration.test.tsx
```

### Run All Tests
```bash
yarn test
```

### Run with Coverage
```bash
yarn test --coverage
```

### Watch Mode (for development)
```bash
yarn test --watch
```

## Required Additional Dependencies

The tests use `@testing-library/react` and `@testing-library/jest-dom`. Verify these are in `package.json`:

```json
{
  "devDependencies": {
    "@testing-library/react": "^12.1.5",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3"
  }
}
```

If missing, install:
```bash
cd ui
yarn add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Manual Testing Quick Start

### Using Chrome DevTools (Fastest)

1. Open ArgoCD in Chrome
2. Press `F12` to open DevTools
3. Press `Ctrl+Shift+M` (or click device icon) to enable Device Mode
4. Select device from dropdown (e.g., "iPhone 12 Pro")
5. Refresh page and test

### Recommended Test Devices in DevTools
- iPhone SE (375px) - Smallest modern phone
- iPhone 12 Pro (390px) - Standard phone
- iPad Mini (768px) - Tablet
- Desktop (1920px) - Desktop baseline

### Quick Smoke Test Checklist

**Mobile (390px)**:
- [ ] Hamburger menu appears in top-left
- [ ] Clicking hamburger opens sidebar with overlay
- [ ] Clicking overlay closes menu
- [ ] Applications list shows single column
- [ ] Search bar is full-width and touch-friendly
- [ ] No horizontal scrolling

**Desktop (1920px)**:
- [ ] No hamburger menu visible
- [ ] Sidebar is expanded by default
- [ ] Sidebar collapse button works
- [ ] Content adjusts when sidebar collapses
- [ ] Applications grid shows multiple columns

## Test Files Added

```
ui/src/app/
├── sidebar/
│   └── sidebar.test.tsx                    (NEW - 15 tests)
├── shared/
│   └── styles/
│       └── mobile.test.ts                   (NEW - 20+ tests)
└── __tests__/
    └── mobile-viewport.integration.test.tsx (NEW - 25+ tests)
```

## Expected Test Results

When all tests pass, you should see output like:

```
PASS  src/app/sidebar/sidebar.test.tsx
  Sidebar Component
    Desktop Behavior
      ✓ renders sidebar with navigation items (45ms)
      ✓ renders version number (32ms)
      ✓ applies collapsed class when hideSidebar is true (28ms)
    Mobile Menu Behavior
      ✓ renders mobile hamburger menu button (22ms)
      ✓ toggles mobile menu when hamburger button is clicked (35ms)
      ✓ closes mobile menu when overlay is clicked (29ms)
      ✓ closes mobile menu when Escape key is pressed (31ms)
      ✓ changes hamburger icon when menu is open (27ms)
      ✓ mobile menu overrides hideSidebar preference (33ms)
    Navigation Behavior
      ✓ closes mobile menu when navigation occurs (38ms)
      ✓ highlights active navigation item (24ms)
    Accessibility
      ✓ hamburger button has aria-label (19ms)
      ✓ keyboard navigation works with Escape key (31ms)

PASS  src/app/shared/styles/mobile.test.ts
  Mobile Breakpoints and Constants
    ✓ all breakpoint tests pass (45ms)
  Mobile Layout Calculations
    ✓ all calculation tests pass (32ms)

PASS  src/app/__tests__/mobile-viewport.integration.test.tsx
  Mobile Viewport Integration Tests
    ✓ all viewport tests pass (52ms)

Test Suites: 3 passed, 3 total
Tests:       60+ passed, 60+ total
Snapshots:   0 total
Time:        4.532 s
```

## Troubleshooting

### If tests fail to import dependencies:
```bash
cd ui
yarn install
```

### If tests fail due to missing mocks:
Check that `__mocks__/fileMock.js` exists and is configured in `jest.config.js`

### If React/testing-library errors occur:
Ensure dependencies are installed:
```bash
yarn add -D @testing-library/react@^12.1.5 @testing-library/jest-dom@^5.16.5
```

### If SCSS import errors occur:
Jest config should already have SCSS mocked. Verify in `jest.config.js`:
```javascript
moduleNameMapper: {
  '.+\\.(css|styl|less|sass|scss)$': '<rootDir>/__mocks__/fileMock.js',
}
```

## Next Steps After Tests Pass

1. **Run tests locally**: `yarn test`
2. **Verify coverage**: `yarn test --coverage` (aim for >80%)
3. **Manual testing**: Follow `MOBILE_TESTING_PLAN.md`
4. **Real device testing**: Test on actual iPhone and Android device
5. **Performance check**: Use Lighthouse for mobile performance audit
6. **Accessibility audit**: Use axe DevTools

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run UI Tests
  run: |
    cd ui
    yarn install
    yarn test --coverage
    yarn lint
```

## Success Criteria

✅ All automated tests pass
✅ Test coverage > 80% for new code
✅ No console errors in tests
✅ Manual testing checklist complete
✅ Tests run successfully in CI/CD

---

**Created**: 2025-12-27
**Total Tests**: 60+ automated tests
**Test Files**: 3 new files
**Manual Test Cases**: 18 comprehensive scenarios
