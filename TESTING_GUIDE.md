# Mobile Responsive Design - Complete Testing Guide

This guide explains how to test the mobile responsive features both manually and programmatically.

## Quick Testing (No K8s Required!)

The mobile responsive design is **pure frontend (CSS + React state)**, so you can test it without any backend or Kubernetes!

### Option 1: Dev Server (Fastest - RECOMMENDED)

```bash
# Navigate to UI directory
cd /home/user/argo-cd/ui

# Install dependencies (first time only)
yarn install

# Start dev server
yarn start
```

The server will start at `http://localhost:4000` (or similar port shown in output).

**What works without backend**:
- ✅ All mobile responsive layouts
- ✅ Hamburger menu and sidebar overlay
- ✅ Single column application grids
- ✅ Touch-friendly button sizing
- ✅ Search bar responsive behavior
- ✅ All CSS media queries

**What doesn't work** (expected):
- ❌ Real application data (API calls fail)
- ❌ Authentication

But that's OK! Layout testing doesn't need real data.

### Option 2: Chrome DevTools (No Server Needed!)

If you already have ArgoCD running somewhere, just open it in Chrome:

```bash
# Open your ArgoCD instance
# Example: https://your-argocd.example.com

# Press F12 (open DevTools)
# Press Ctrl+Shift+M (toggle device toolbar)
# Select device: "iPhone 12 Pro"
```

Test checklist:
- [ ] Hamburger menu appears in top-left
- [ ] Clicking hamburger opens sidebar with dark overlay
- [ ] Clicking overlay closes menu
- [ ] Applications show in single column
- [ ] Search bar is full width
- [ ] No horizontal scrolling

### Option 3: Real Device Testing

Test on your actual iPhone/Android:

```bash
# Find your local IP
hostname -I | awk '{print $1}'
# Example: 192.168.1.100

# Start dev server (if not already running)
cd /home/user/argo-cd/ui
yarn start

# On your phone's browser:
# Navigate to: http://192.168.1.100:4000
```

Make sure your phone is on the same WiFi network!

## Automated Testing

### Run All Tests

```bash
cd /home/user/argo-cd/ui

# Run all tests
yarn test

# Run with coverage
yarn test --coverage

# Watch mode (auto-rerun on changes)
yarn test --watch
```

### Run Specific Test Suites

```bash
# Sidebar mobile menu tests
yarn test sidebar.test.tsx

# Mobile utilities tests
yarn test mobile.test.ts

# Viewport integration tests
yarn test mobile-viewport.integration.test.tsx
```

### Expected Output

```
PASS  src/app/sidebar/sidebar.test.tsx
  Sidebar Component
    Desktop Behavior
      ✓ renders sidebar with navigation items (32ms)
      ✓ renders version number (45ms)
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

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```

## Manual Testing Checklist

### Mobile (iPhone 12 - 390px)

**Sidebar & Navigation**:
- [ ] Hamburger menu button visible in top-left
- [ ] Hamburger button is at least 44px (touch-friendly)
- [ ] Clicking hamburger opens sidebar from left
- [ ] Dark overlay appears behind sidebar
- [ ] Clicking overlay closes menu
- [ ] Pressing Escape closes menu
- [ ] Menu auto-closes after navigation
- [ ] Icon changes between bars (☰) and X (✕)

**Applications List**:
- [ ] Applications display in single column
- [ ] No horizontal scrolling
- [ ] Search bar is full width
- [ ] Search bar is 44px tall (touch-friendly)
- [ ] Tiles/cards are readable without zooming
- [ ] Smooth scrolling

**Form Inputs**:
- [ ] Tapping text inputs doesn't trigger iOS zoom
- [ ] Inputs are at least 44px tall
- [ ] Keyboard doesn't obscure important buttons

**General**:
- [ ] All buttons are easily tappable (≥44px)
- [ ] Adequate spacing between interactive elements
- [ ] No text is cut off
- [ ] Content fits within viewport

### Tablet (iPad Mini - 768px)

- [ ] No hamburger menu (sidebar always visible)
- [ ] Applications display in 2 columns
- [ ] Search bar adapts to wider screen
- [ ] All desktop features available

### Desktop (1920x1080)

- [ ] No hamburger menu
- [ ] Sidebar expanded by default (230px)
- [ ] Sidebar collapse button works
- [ ] Content adjusts when sidebar collapses
- [ ] Applications display in 4+ columns
- [ ] No visual regressions from desktop version

### Cross-Browser

**Safari (iOS)**:
- [ ] All features work
- [ ] CSS animations smooth
- [ ] Touch events responsive
- [ ] No vendor-specific bugs

**Chrome (Android)**:
- [ ] All features work
- [ ] Material Design feel maintained
- [ ] No rendering issues

## Testing Different Viewports in DevTools

| Device | Resolution | What to Test |
|--------|-----------|--------------|
| iPhone SE | 375x667 | Smallest modern phone |
| iPhone 12 | 390x844 | Standard phone size |
| iPhone 12 Pro Max | 428x926 | Largest phone |
| iPad Mini | 768x1024 | Small tablet |
| iPad Air | 820x1180 | Standard tablet |
| Desktop | 1920x1080 | Standard desktop |

## Performance Testing

### Page Load Time

```bash
# Open Chrome DevTools
# Network tab → Throttling → "Slow 3G"
# Load applications page
# Target: < 3 seconds
```

### Animation Performance

```bash
# Open Chrome DevTools
# Performance tab → Record
# Open/close sidebar 5 times
# Stop recording
# Check: Maintain 60 FPS (green in timeline)
```

## Common Issues & Solutions

### Issue: Hamburger menu not visible

**Check**:
- Viewport width < 640px?
- CSS loaded correctly?
- z-index conflicts?

**Fix**:
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Issue: Sidebar doesn't slide in

**Check**:
- JavaScript errors in console?
- React state updating?

**Fix**:
```bash
# Check console for errors
# Verify no TypeScript compilation errors
```

### Issue: Tests failing

**Common causes**:
```bash
# Dependencies not installed
cd ui && yarn install

# Stale cache
yarn test --clearCache

# Wrong Node version
nvm use 22
```

## Integration with CI/CD

Add to your pipeline:

```yaml
test-ui:
  script:
    - cd ui
    - yarn install
    - yarn test --coverage
    - yarn lint
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
```

## Accessibility Testing

### Screen Reader (iOS VoiceOver)

1. Enable VoiceOver: Settings → Accessibility → VoiceOver
2. Navigate with swipe gestures
3. Verify:
   - [ ] Hamburger announces "Toggle menu"
   - [ ] Nav items have proper labels
   - [ ] All interactive elements accessible

### Keyboard Navigation

1. Use Tab key to navigate
2. Verify:
   - [ ] Clear focus indicators
   - [ ] Logical tab order
   - [ ] Escape closes overlays

## Troubleshooting

### Dev server won't start

```bash
# Check if port is in use
lsof -i :4000

# Kill process if needed
kill -9 <PID>

# Try different port
PORT=3000 yarn start
```

### Dependencies won't install

```bash
# Clear yarn cache
yarn cache clean

# Remove node_modules and reinstall
rm -rf node_modules
yarn install
```

### Tests are slow

```bash
# Run tests in parallel (if supported)
yarn test --maxWorkers=4

# Run only changed tests
yarn test --onlyChanged
```

## Next Steps

1. **Run automated tests**: `yarn test`
2. **Manual smoke test**: Use Chrome DevTools mobile emulation
3. **Real device test**: Test on your actual phone
4. **Performance check**: Run Lighthouse mobile audit
5. **Accessibility audit**: Use axe DevTools extension

## Resources

- **Test Utilities**: `/ui/src/app/__tests__/README.md`
- **Mock Data**: `/ui/src/app/__tests__/mock-data.ts`
- **Manual Test Plan**: `/MOBILE_TESTING_PLAN.md`
- **Testing Summary**: `/MOBILE_TESTING_SUMMARY.md`

---

## Playwright Visual Testing with mkcert

For automated visual testing with Playwright, you can set up trusted SSL certificates using mkcert to avoid certificate warnings.

### Prerequisites

```bash
# Install mkcert (macOS)
brew install mkcert

# Install local CA (requires sudo)
mkcert -install

# Generate certificates for localhost
mkdir -p certs
cd certs
mkcert localhost 127.0.0.1 ::1
```

This creates:
- `localhost+2.pem` - Certificate
- `localhost+2-key.pem` - Private key

### Configure ArgoCD with mkcert Certificates

```bash
# Create TLS secret in ArgoCD namespace
kubectl -n argocd delete secret argocd-server-tls --ignore-not-found
kubectl -n argocd create secret tls argocd-server-tls \
  --cert=certs/localhost+2.pem \
  --key=certs/localhost+2-key.pem

# Restart ArgoCD server to pick up new certificate
kubectl -n argocd rollout restart deployment argocd-server
kubectl -n argocd rollout status deployment argocd-server
```

### Port Forwarding for Testing

```bash
# For HTTP access (TLS disabled in server)
kubectl -n argocd port-forward svc/argocd-server 8080:80

# For HTTPS access (if TLS enabled)
kubectl -n argocd port-forward svc/argocd-server 8443:443
```

### Playwright Testing Examples

```typescript
// Navigate to ArgoCD
await page.goto('http://localhost:8080');

// Login
await page.fill('input[name="username"]', 'admin');
await page.fill('input[name="password"]', 'TestTest123');
await page.click('button[type="submit"]');

// Test mobile viewport (iPhone 14 Pro Max)
await page.setViewportSize({ width: 430, height: 932 });

// Take screenshot
await page.screenshot({ path: 'mobile-view.png' });

// Test filter dropdown z-index
await page.click('.filter:has-text("CLUSTERS")');
await page.screenshot({ path: 'clusters-filter.png' });
```

### Using Playwright MCP Tool

If using Claude Code with Playwright MCP:

```
# Navigate to ArgoCD
mcp__playwright__playwright_navigate url=http://localhost:8080

# Login
mcp__playwright__playwright_fill selector=input[name="username"] value=admin
mcp__playwright__playwright_fill selector=input[name="password"] value=TestTest123
mcp__playwright__playwright_click selector=button[type="submit"]

# Take screenshot
mcp__playwright__playwright_screenshot name=desktop-view width=1280 height=720

# Mobile viewport (iPhone 14 Pro Max)
# Note: Resize by navigating with new dimensions
mcp__playwright__playwright_navigate url=http://localhost:8080/applications width=430 height=932
mcp__playwright__playwright_screenshot name=mobile-view width=430 height=932
```

### Troubleshooting

**Certificate errors in browser:**
- Ensure mkcert CA is installed: `mkcert -install`
- Check certificate was generated: `ls certs/`
- Verify TLS secret exists: `kubectl -n argocd get secret argocd-server-tls`

**Port forward connection issues:**
- Kill existing port-forwards: `pkill -f "kubectl.*port-forward.*argocd"`
- Check pod is running: `kubectl -n argocd get pods`
- Check server logs: `kubectl -n argocd logs -l app.kubernetes.io/name=argocd-server`

**ArgoCD running in HTTP mode:**
- Check logs for "tls: false" - this means TLS is disabled at server level
- Use port 80 for HTTP access instead of 443

---

**Last Updated**: 2025-12-27
**Status**: Ready for Testing
**Phase**: 1 - Core Mobile Support
