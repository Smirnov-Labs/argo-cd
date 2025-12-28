# Testing ArgoCD Mobile UI in Kubernetes

This guide shows how to build and deploy ArgoCD with the mobile responsive UI changes to a Kubernetes cluster for testing.

## Prerequisites

Install these tools:

```bash
# Docker
# https://docs.docker.com/get-docker/

# kubectl
# https://kubernetes.io/docs/tasks/tools/

# k3d (lightweight k8s in Docker)
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
```

## Quick Start (Automated)

Use the provided script to build and deploy everything automatically:

```bash
# From the argo-cd repository root
./scripts/deploy-mobile-k3d.sh
```

This script will:
1. ✅ Build the UI (`yarn build`)
2. ✅ Build Docker image with your changes
3. ✅ Create k3d cluster (if needed)
4. ✅ Load image into cluster
5. ✅ Install ArgoCD
6. ✅ Patch with custom image
7. ✅ Set up port-forwarding
8. ✅ Display login credentials

**Access**: https://localhost:8080 (username: `admin`, password shown in output)

## Manual Setup (Step by Step)

If you prefer to do it manually or need to customize:

### 1. Build the UI

```bash
cd ui
yarn install
yarn build
cd ..
```

### 2. Build Docker Image

```bash
# Build the image
docker build -t localhost:5000/argocd-mobile:latest .

# Or build with custom tag
docker build -t myregistry/argocd:mobile-v1 .
```

### 3. Create k3d Cluster

```bash
# Create cluster with registry
k3d cluster create argocd-mobile-test \
  --registry-create localhost:5000 \
  --api-port 6550 \
  --port "8080:80@loadbalancer" \
  --port "8443:443@loadbalancer"

# Verify cluster is running
kubectl cluster-info
```

### 4. Load Image into k3d

```bash
# Import your custom image
k3d image import localhost:5000/argocd-mobile:latest -c argocd-mobile-test

# Verify image is loaded
docker exec k3d-argocd-mobile-test-server-0 crictl images | grep argocd
```

### 5. Install ArgoCD

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be created
kubectl get pods -n argocd -w
```

### 6. Patch with Custom Image

```bash
# Update argocd-server to use your image
kubectl patch deployment argocd-server -n argocd \
  --type='json' \
  -p='[{
    "op": "replace",
    "path": "/spec/template/spec/containers/0/image",
    "value": "localhost:5000/argocd-mobile:latest"
  }]'

# Wait for rollout
kubectl rollout status deployment/argocd-server -n argocd
```

### 7. Access ArgoCD

```bash
# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d && echo

# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Open https://localhost:8080 in your browser.

## Testing the Mobile UI

### In Chrome DevTools

1. Open https://localhost:8080
2. Login (username: `admin`, password from step 7)
3. Press `F12` to open DevTools
4. Press `Ctrl+Shift+M` to toggle device toolbar
5. Select device: **iPhone 12 Pro**
6. Test mobile features:
   - ☑️ Hamburger menu appears
   - ☑️ Sidebar slides in as overlay
   - ☑️ Applications show in single column
   - ☑️ Search bar is full width
   - ☑️ No horizontal scrolling

### On Real Mobile Device

Find your machine's IP:

```bash
# Linux/Mac
hostname -I | awk '{print $1}'
# Example: 192.168.1.100

# Then on your phone's browser:
# https://192.168.1.100:8080
```

**Note**: Your phone must be on the same network, and you may need to accept the self-signed certificate.

## Rebuilding After Changes

If you make more UI changes:

```bash
# 1. Rebuild UI
cd ui
yarn build
cd ..

# 2. Rebuild Docker image
docker build -t localhost:5000/argocd-mobile:latest .

# 3. Reload image into k3d
k3d image import localhost:5000/argocd-mobile:latest -c argocd-mobile-test

# 4. Restart deployment
kubectl rollout restart deployment/argocd-server -n argocd

# 5. Wait for rollout
kubectl rollout status deployment/argocd-server -n argocd
```

## Troubleshooting

### Image Not Found

```bash
# List images in k3d
docker exec k3d-argocd-mobile-test-server-0 crictl images

# Re-import if needed
k3d image import localhost:5000/argocd-mobile:latest -c argocd-mobile-test
```

### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n argocd

# Check logs
kubectl logs -n argocd deployment/argocd-server

# Describe pod for events
kubectl describe pod -n argocd -l app.kubernetes.io/name=argocd-server
```

### Port Already in Use

```bash
# Find process using port 8080
lsof -ti:8080

# Kill it
lsof -ti:8080 | xargs kill -9

# Restart port-forward
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### UI Changes Not Showing

```bash
# Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
# Or open in incognito mode

# Verify image was rebuilt
docker images | grep argocd-mobile

# Check pod is using new image
kubectl get pod -n argocd -l app.kubernetes.io/name=argocd-server \
  -o jsonpath='{.items[0].spec.containers[0].image}'
```

## Cleanup

```bash
# Delete the k3d cluster
k3d cluster delete argocd-mobile-test

# Remove Docker image
docker rmi localhost:5000/argocd-mobile:latest
```

## For Other Contributors

Share these instructions for reproducibility:

### Quick Reproduction

```bash
# 1. Clone the repo and checkout the branch
git clone https://github.com/Smirnov-Labs/argo-cd.git
cd argo-cd
git checkout claude/argocd-mobile-exploration-NDI56

# 2. Run the deployment script
./scripts/deploy-mobile-k3d.sh

# 3. Access at https://localhost:8080
# Use credentials shown in script output
```

### Environment Variables

Customize the deployment:

```bash
# Use different cluster name
CLUSTER_NAME=my-test ./scripts/deploy-mobile-k3d.sh

# Use different image tag
IMAGE_TAG=mobile-v2 ./scripts/deploy-mobile-k3d.sh

# Use different registry
REGISTRY=myregistry.io IMAGE_NAME=argocd-mobile ./scripts/deploy-mobile-k3d.sh
```

## Architecture

```
┌─────────────────┐
│  Your Machine   │
│                 │
│  ┌───────────┐  │
│  │  Docker   │  │
│  │           │  │
│  │ ┌───────┐ │  │
│  │ │ k3d   │ │  │      ┌──────────────────┐
│  │ │       │ │  │      │   Browser        │
│  │ │ ArgoCD│◄─┼──┼──────┤   localhost:8080 │
│  │ │       │ │  │      │                  │
│  │ │ w/    │ │  │      │   Mobile DevTools│
│  │ │Mobile │ │  │      └──────────────────┘
│  │ │UI     │ │  │
│  │ └───────┘ │  │
│  └───────────┘  │
└─────────────────┘
```

## Production Deployment

**⚠️ For production clusters**, use a proper Docker registry:

```bash
# Build and tag
docker build -t myregistry.io/argocd:mobile-responsive .

# Push to registry
docker push myregistry.io/argocd:mobile-responsive

# Update ArgoCD in production
kubectl set image deployment/argocd-server \
  argocd-server=myregistry.io/argocd:mobile-responsive \
  -n argocd
```

## Performance Testing

Test performance in the k3d cluster:

```bash
# Install Lighthouse
npm install -g lighthouse

# Run Lighthouse against your cluster
lighthouse https://localhost:8080 \
  --chrome-flags="--ignore-certificate-errors" \
  --only-categories=performance,accessibility \
  --output=html \
  --output-path=./lighthouse-report.html
```

## Next Steps

After testing in k3d:
1. ✅ Verify all mobile features work
2. ✅ Test on real mobile device
3. ✅ Run Lighthouse audit
4. ✅ Create upstream PR to argoproj/argo-cd

---

**Related Files**:
- Build Script: `/scripts/deploy-mobile-k3d.sh`
- Testing Guide: `/TESTING_GUIDE.md`
- Mobile Plan: `/mobile_plan.md`
