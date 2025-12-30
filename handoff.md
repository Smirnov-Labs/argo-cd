# Mobile UI Improvements - Handoff Document

## Overview

This document summarizes the mobile responsive UI improvements made to the ArgoCD web interface. The changes focus on making the application details page more usable on mobile devices (< 640px viewport width).

## Branch

`llm-mobile` on `Smirnov-Labs/argo-cd`

## Key Changes

### 1. MobilePanel Component

**Location:** `ui/src/app/shared/components/mobile-panel/`

A new full-screen modal component designed for mobile devices, replacing the desktop `SlidingPanel` on mobile viewports.

**Features:**
- Full viewport coverage with white background
- Sticky header with title and close button
- Scrollable body content
- Optional sticky action buttons at bottom
- Touch-friendly interactions (44px minimum touch targets)
- Prevents body scroll when open
- Escape key to close
- Uses `ReactDOM.createPortal` to render above everything

**Usage:**
```tsx
import { MobilePanel } from '../../../shared/components';
import { useIsMobile } from '../../../shared/hooks/use-is-mobile';

const isMobile = useIsMobile();

{isMobile ? (
    <MobilePanel isShown={isVisible} onClose={onClose} title="Panel Title" actions={actionButtons}>
        {content}
    </MobilePanel>
) : (
    <SlidingPanel isShown={isVisible} onClose={onClose}>
        {content}
    </SlidingPanel>
)}
```

### 2. Integrated MobilePanel with Panels

**Sync Panel** (`ui/src/app/applications/components/application-sync-panel/`)
- Uses MobilePanel on mobile for the sync action
- Full-screen form with Cancel/Synchronize buttons at bottom

**Sync Status Panel** (`ui/src/app/applications/components/application-details/`)
- Operation state (More → Sync Status) now uses MobilePanel on mobile
- Compact layout with stacked labels and values

### 3. Mobile List View Improvements

**Location:** `ui/src/app/applications/components/application-details/application-details-mobile.scss`

Converted the resource table to compact cards using CSS Grid:
- 3-column layout: icon (32px) | name+namespace | status icons
- Hidden columns: Group/Kind, Sync Order, Created At
- Status shows only icons (no "Healthy", "Synced" text)
- 6px spacing between cards
- Subtle shadow and rounded corners

### 4. Operation State Mobile Styles

**Location:** `ui/src/app/applications/components/application-operation-state/application-operation-state.scss`

Added mobile-specific styles when rendered inside MobilePanel:
- Labels uppercase, teal-colored, stacked vertically above values
- Compact spacing with border separators
- Filter buttons wrap on mobile
- Result table converted to card-based layout
- Hidden less important columns (sync wave, kind, namespace, hook)

### 5. Debug Badge Fix

**Location:** `ui/src/app/applications/components/application-details/application-details.tsx`

Added `pointerEvents: 'none'` to the debug badge so it doesn't block the MobilePanel close button.

## Files Modified

| File | Changes |
|------|---------|
| `ui/src/app/shared/components/mobile-panel/mobile-panel.tsx` | New MobilePanel component |
| `ui/src/app/shared/components/mobile-panel/mobile-panel.scss` | MobilePanel styles |
| `ui/src/app/shared/components/index.ts` | Export MobilePanel |
| `ui/src/app/applications/components/application-sync-panel/application-sync-panel.tsx` | Integrate MobilePanel |
| `ui/src/app/applications/components/application-details/application-details.tsx` | Integrate MobilePanel for sync status, fix debug badge |
| `ui/src/app/applications/components/application-details/application-details-mobile.scss` | Compact list view cards |
| `ui/src/app/applications/components/application-operation-state/application-operation-state.scss` | Mobile styles for operation state |

## Screenshots

Screenshots are available in `ui/playwright-screenshots/pr-docs/`:

| Screenshot | Description |
|------------|-------------|
| `01-applications-list.png` | Applications list page |
| `02-app-details-tree.png` | Application details - Tree view |
| `03-app-details-list.png` | Application details - List view (compact cards) |
| `04-app-details-pods.png` | Application details - Pods view |
| `05-app-details-network.png` | Application details - Network view |
| `06-mobile-sidebar.png` | Mobile sidebar navigation |
| `07-list-view.png` | List view with bottom action bar |
| `07-more-menu.png` | More menu dropdown |
| `08-sync-status-panel.png` | Sync status MobilePanel (top) |
| `09-sync-status-results.png` | Sync status results table |
| `10-sync-panel.png` | Sync action MobilePanel |

## Playwright Tests

**Location:** `ui/tests/mobile-screenshots.spec.ts`

Added comprehensive mobile screenshot tests:
- Individual tests for each view (tree, list, pods, network)
- MobilePanel interaction tests (sync status, sync panel)
- Mobile sidebar test
- PR documentation screenshot generator

**Running Tests:**
```bash
cd ui
ARGOCD_URL=https://localhost:8080 \
ARGOCD_USERNAME=admin \
ARGOCD_PASSWORD=<password> \
npx playwright test mobile-screenshots.spec.ts --headed
```

## Testing Locally

### Prerequisites
1. k3d cluster running with ArgoCD installed
2. Port-forward to ArgoCD server: `kubectl port-forward svc/argocd-server -n argocd 8080:443`
3. Sample application deployed (e.g., guestbook)

### Development Server
```bash
cd ui
yarn start
```
Access at `http://localhost:4000` (proxies to ArgoCD at port 8080)

### Mobile Testing
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 or set width to 390px
4. Refresh page to trigger mobile detection

## Known Issues / Future Work

1. **Debug badge**: Currently shows "mobile=true width=Xpx" - this should be removed before production
2. **Close button visibility**: The MobilePanel close button is behind the debug badge visually (though clickable due to `pointer-events: none`)
3. **Filter panel**: The applications list filter panel could use mobile-specific styling
4. **Resource details**: Individual resource detail panels (when clicking on a resource) haven't been mobile-optimized yet

## Commits

1. `feat(ui): Improve mobile sync status and list view` - Main mobile UI improvements
2. `test(ui): Add comprehensive mobile screenshot tests` - Playwright tests
3. `docs: Add mobile UI screenshots for PR documentation` - Screenshots for PR

## Author

Claude Opus 4.5 (via Claude Code)
