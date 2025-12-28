# Mobile UI Testing - Quick Start

**Goal**: Test ArgoCD's new mobile responsive design in < 5 minutes.

## Choose Your Method

### 🚀 Method 1: One-Command Deploy (EASIEST)

```bash
# From repo root
./scripts/deploy-mobile-k3d.sh
```

Then open https://localhost:8080 (credentials shown in output)

**Time**: ~3-5 minutes
**Requirements**: Docker, k3d, kubectl

---

### 💻 Method 2: Dev Server (NO K8S NEEDED)

```bash
cd ui
yarn install
yarn start
```

Then open http://localhost:4000 in Chrome

**Time**: ~2 minutes
**Requirements**: Node.js, Yarn
**Note**: Layout works perfectly, but API calls will fail (expected)

---

### 📱 Method 3: Chrome DevTools (NO BUILD)

If you already have ArgoCD running:

1. Open your ArgoCD instance
2. Press `F12` (DevTools)
3. Press `Ctrl+Shift+M` (device mode)
4. Select "iPhone 12 Pro"
5. Test mobile features!

**Time**: 30 seconds
**Requirements**: None (use existing ArgoCD)

---

## What to Test

Mobile checklist (< 640px viewport):

- [ ] **Hamburger menu** appears top-left
- [ ] Clicking hamburger **opens sidebar as overlay**
- [ ] **Dark backdrop** appears
- [ ] Clicking backdrop **closes menu**
- [ ] **Escape key** closes menu
- [ ] Applications show in **single column**
- [ ] Search bar is **full width**
- [ ] **No horizontal scrolling**
- [ ] All buttons are **touch-friendly** (≥44px)

Desktop checklist (≥ 1024px viewport):

- [ ] **No hamburger menu** (not needed)
- [ ] Sidebar **always visible** (230px)
- [ ] Collapse button works
- [ ] Applications show in **multiple columns**
- [ ] **No regressions** from original design

---

## Automated Tests

```bash
cd ui
yarn test
```

**Expected**: 60+ tests pass
**Time**: ~30 seconds

---

## Quick Commands Reference

```bash
# Build & deploy to k3d
./scripts/deploy-mobile-k3d.sh

# Run tests
cd ui && yarn test

# Start dev server
cd ui && yarn start

# Clean up k3d cluster
k3d cluster delete argocd-mobile-test

# View logs in cluster
kubectl logs -n argocd deployment/argocd-server -f

# Restart after changes
kubectl rollout restart deployment/argocd-server -n argocd
```

---

## For Contributors

```bash
# Clone and test
git clone https://github.com/Smirnov-Labs/argo-cd.git
cd argo-cd
git checkout claude/argocd-mobile-exploration-NDI56
./scripts/deploy-mobile-k3d.sh
```

Access at https://localhost:8080 with credentials from script output.

---

## Documentation

- **Full K8s Guide**: [K8S_DEPLOYMENT.md](./K8S_DEPLOYMENT.md)
- **Testing Guide**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Test Plan**: [MOBILE_TESTING_PLAN.md](./MOBILE_TESTING_PLAN.md)
- **Architecture**: [mobile_plan.md](./mobile_plan.md)

---

**Last Updated**: 2025-12-27
**Branch**: `claude/argocd-mobile-exploration-NDI56`
**Status**: ✅ Ready for Testing
