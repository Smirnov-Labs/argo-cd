# ArgoCD UI Test Suite

This directory contains comprehensive test utilities, mock data, and integration tests for the ArgoCD UI, with special focus on mobile responsive design.

## Directory Structure

```
__tests__/
├── README.md                           # This file
├── mock-data.ts                        # Mock applications, preferences, nav items
├── test-utils.tsx                      # Testing utilities and helpers
└── mobile-viewport.integration.test.tsx # Viewport responsiveness tests
```

## Quick Start

### Running Tests

```bash
# From the ui directory
cd /home/user/argo-cd/ui

# Run all tests
yarn test

# Run specific test file
yarn test sidebar.test.tsx

# Run with coverage
yarn test --coverage

# Watch mode (auto-rerun on changes)
yarn test --watch
```

### Using Mock Data

```typescript
import {mockApplications, mockNavItems, mockViewPreferences} from './__tests__/mock-data';

// Create a single application
const app = mockApplications.createApplication();

// Create app list with various states
const apps = mockApplications.createApplicationList(10);

// Create specific health status apps
const healthyApp = mockApplications.createHealthyApplication();
const degradedApp = mockApplications.createDegradedApplication();
const progressingApp = mockApplications.createProgressingApplication();

// Use mock nav items
const navItems = mockNavItems;

// Use mock view preferences
const prefs = mockViewPreferences.default;
const collapsedPrefs = mockViewPreferences.sidebarCollapsed;
const darkMode = mockViewPreferences.darkMode;
```

### Using Test Utilities

```typescript
import {
    renderWithContext,
    setViewportSize,
    VIEWPORTS,
    mockMatchMedia,
    isTouchFriendly,
    screen,
    fireEvent,
    waitFor
} from './__tests__/test-utils';

// Render component with ArgoCD context
const {container} = renderWithContext(<YourComponent />);

// Test at specific viewport
setViewportSize(VIEWPORTS.MOBILE.IPHONE_12.width, VIEWPORTS.MOBILE.IPHONE_12.height);

// Check touch target size
const button = screen.getByRole('button');
expect(isTouchFriendly(button)).toBe(true); // >= 44px
```

## Common Testing Patterns

### 1. Testing Mobile vs Desktop Behavior

```typescript
import {setViewportSize, VIEWPORTS} from './__tests__/test-utils';

describe('Responsive Behavior', () => {
    test('shows hamburger menu on mobile', () => {
        setViewportSize(VIEWPORTS.MOBILE.IPHONE_12.width, VIEWPORTS.MOBILE.IPHONE_12.height);

        render(<Component />);

        const hamburger = screen.getByLabelText('Toggle menu');
        expect(hamburger).toBeInTheDocument();
    });

    test('hides hamburger menu on desktop', () => {
        setViewportSize(VIEWPORTS.DESKTOP.HD.width, VIEWPORTS.DESKTOP.HD.height);

        render(<Component />);

        expect(screen.queryByLabelText('Toggle menu')).not.toBeInTheDocument();
    });
});
```

### 2. Testing with Mock Applications

```typescript
import {mockApplications} from './__tests__/mock-data';

test('displays application list', () => {
    const apps = mockApplications.createApplicationList(5);

    render(<ApplicationsList applications={apps} />);

    expect(screen.getAllByRole('article')).toHaveLength(5);
});

test('shows healthy status', () => {
    const app = mockApplications.createHealthyApplication('test-app');

    render(<ApplicationTile application={app} />);

    expect(screen.getByText('Healthy')).toBeInTheDocument();
});
```

### 3. Testing Touch Interactions

```typescript
import {isTouchFriendly, simulateTouch} from './__tests__/test-utils';

test('buttons are touch-friendly on mobile', () => {
    setViewportSize(375, 667); // iPhone SE

    render(<ButtonGroup />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
        expect(isTouchFriendly(button)).toBe(true);
    });
});
```

### 4. Testing Sidebar Mobile Menu

```typescript
import {mockRouterContext, mockNavItems, mockViewPreferences} from './__tests__/mock-data';
import {renderWithContext} from './__tests__/test-utils';

test('mobile menu toggles correctly', () => {
    const {container} = renderWithContext(
        <Sidebar navItems={mockNavItems} pref={mockViewPreferences.default} />
    );

    const hamburger = screen.getByLabelText('Toggle menu');
    const overlay = container.querySelector('.sidebar-overlay');

    // Open menu
    fireEvent.click(hamburger);
    expect(overlay).toHaveClass('sidebar-overlay--visible');

    // Close menu
    fireEvent.click(overlay);
    expect(overlay).not.toHaveClass('sidebar-overlay--visible');
});
```

## Mock Data Reference

### mockApplications

| Method | Description | Example |
|--------|-------------|---------|
| `createApplication(overrides?)` | Create single app | `mockApplications.createApplication({metadata: {name: 'my-app'}})` |
| `createApplicationList(count)` | Create app list | `mockApplications.createApplicationList(10)` |
| `createHealthyApplication(name?)` | Create healthy app | `mockApplications.createHealthyApplication()` |
| `createDegradedApplication(name?)` | Create degraded app | `mockApplications.createDegradedApplication()` |
| `createProgressingApplication(name?)` | Create progressing app | `mockApplications.createProgressingApplication()` |

### mockNavItems

Array of navigation items for sidebar:
- Applications
- Settings
- Help

### mockViewPreferences

| Preset | Description |
|--------|-------------|
| `default` | Sidebar expanded, light theme |
| `sidebarCollapsed` | Sidebar collapsed, light theme |
| `darkMode` | Dark theme enabled |

### mockVersion

Version info object with Version, BuildDate, GitCommit, etc.

### mockRouterContext

React Router context mock with history, location, match

## Viewport Constants

All common device sizes are available in `VIEWPORTS`:

```typescript
// Mobile (< 640px)
VIEWPORTS.MOBILE.IPHONE_SE          // 375x667
VIEWPORTS.MOBILE.IPHONE_12          // 390x844
VIEWPORTS.MOBILE.IPHONE_12_PRO_MAX  // 428x926
VIEWPORTS.MOBILE.GALAXY_S21         // 360x800
VIEWPORTS.MOBILE.PIXEL_5            // 393x851

// Tablet (640px - 1023px)
VIEWPORTS.TABLET.IPAD_MINI          // 768x1024
VIEWPORTS.TABLET.IPAD_AIR           // 820x1180
VIEWPORTS.TABLET.IPAD_PRO_11        // 834x1194

// Desktop (≥ 1024px)
VIEWPORTS.DESKTOP.HD                // 1920x1080
VIEWPORTS.DESKTOP.QHD               // 2560x1440
VIEWPORTS.DESKTOP.UHD               // 3840x2160
```

## Test Utilities Reference

### Rendering

- `renderWithContext(ui, options)` - Render with ArgoCD Context provider
- `screen` - Re-exported from @testing-library/react
- `fireEvent` - Re-exported from @testing-library/react
- `waitFor` - Re-exported from @testing-library/react
- `userEvent` - Re-exported from @testing-library/user-event

### Viewport

- `setViewportSize(width, height)` - Set window dimensions
- `mockMatchMedia(width)` - Mock window.matchMedia for viewport
- `VIEWPORTS` - Constants for common device sizes

### Touch

- `simulateTouch(element, type)` - Simulate touch events
- `isTouchFriendly(element)` - Check if element is ≥44px

### Services

- `createMockServices()` - Create mock ArgoCD services

### Helpers

- `waitForAsync()` - Wait for async updates
- `testAtViewport(name, viewport, testFn)` - Run test at specific viewport

## Examples

### Complete Component Test Example

```typescript
import {mockApplications, mockViewPreferences} from './__tests__/mock-data';
import {renderWithContext, setViewportSize, VIEWPORTS, screen, fireEvent} from './__tests__/test-utils';
import {ApplicationsList} from './applications-list';

describe('ApplicationsList - Mobile Responsive', () => {
    beforeEach(() => {
        // Set mobile viewport before each test
        setViewportSize(VIEWPORTS.MOBILE.IPHONE_12.width, VIEWPORTS.MOBILE.IPHONE_12.height);
    });

    test('displays single column grid on mobile', () => {
        const apps = mockApplications.createApplicationList(5);

        const {container} = renderWithContext(
            <ApplicationsList applications={apps} viewPrefs={mockViewPreferences.default} />
        );

        const grid = container.querySelector('.applications-tiles');
        const gridStyle = window.getComputedStyle(grid);

        // Should be single column on mobile
        expect(gridStyle.gridTemplateColumns).toContain('1fr');
    });

    test('search bar is full width and touch-friendly', () => {
        renderWithContext(<ApplicationsList applications={[]} />);

        const searchInput = screen.getByPlaceholderText('Search applications...');
        const searchBar = searchInput.closest('.applications-list__search');

        const rect = searchBar.getBoundingClientRect();

        // Full width (minus padding)
        expect(rect.width).toBeGreaterThan(300);

        // Touch-friendly height
        expect(rect.height).toBeGreaterThanOrEqual(44);
    });
});
```

## Best Practices

1. **Always set viewport before mobile tests**
   ```typescript
   beforeEach(() => {
       setViewportSize(VIEWPORTS.MOBILE.IPHONE_12.width, VIEWPORTS.MOBILE.IPHONE_12.height);
   });
   ```

2. **Use mock data instead of creating objects inline**
   ```typescript
   // Good
   const app = mockApplications.createHealthyApplication();

   // Avoid
   const app = { metadata: {...}, spec: {...}, status: {...} };
   ```

3. **Test both mobile and desktop behavior**
   ```typescript
   describe('Responsive', () => {
       test('mobile behavior', () => { setViewportSize(390, 844); ... });
       test('desktop behavior', () => { setViewportSize(1920, 1080); ... });
   });
   ```

4. **Validate touch targets on mobile**
   ```typescript
   const button = screen.getByRole('button');
   expect(isTouchFriendly(button)).toBe(true);
   ```

5. **Use data-testid for complex queries**
   ```typescript
   <div data-testid="app-tile-healthy">{...}</div>

   expect(screen.getByTestId('app-tile-healthy')).toBeInTheDocument();
   ```

## Troubleshooting

### Tests fail with "Cannot find module"

```bash
cd ui
yarn install
```

### matchMedia is not defined

```typescript
import {mockMatchMedia} from './__tests__/test-utils';

beforeAll(() => {
    mockMatchMedia(375); // or your desired width
});
```

### "Act" warnings

Use `waitFor` for async updates:

```typescript
await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

## Contributing

When adding new tests:

1. Use existing mock data when possible
2. Add new mocks to `mock-data.ts` if needed
3. Add new utilities to `test-utils.tsx` if reusable
4. Follow naming convention: `component-name.test.tsx`
5. Group related tests in `describe` blocks
6. Add comments for complex test logic

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Mobile Testing Plan](/MOBILE_TESTING_PLAN.md)
- [Mobile Testing Summary](/MOBILE_TESTING_SUMMARY.md)

---

**Last Updated**: 2025-12-27
**Related**: Phase 1 Mobile Responsive Design Implementation
