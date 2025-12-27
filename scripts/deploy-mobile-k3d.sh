#!/bin/bash
# Build and Deploy ArgoCD with Mobile Responsive UI to k3d
# This script builds a custom ArgoCD image with mobile UI changes and deploys it to k3d

set -e

echo "🚀 ArgoCD Mobile UI - Build & Deploy Script"
echo "==========================================="

# Configuration
CLUSTER_NAME="${CLUSTER_NAME:-argocd-mobile-test}"
IMAGE_NAME="${IMAGE_NAME:-argocd-mobile}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"
ARGOCD_PORT="${ARGOCD_PORT:-9080}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build the UI
echo -e "\n${GREEN}Step 1: Building UI...${NC}"
cd ui
echo "Installing dependencies..."
yarn install

echo "Building production UI bundle..."
yarn build

echo "Running linter..."
yarn lint || echo -e "${YELLOW}Warning: Linter found issues (continuing anyway)${NC}"

cd ..

# Step 2: Build Docker image
echo -e "\n${GREEN}Step 2: Building Docker image...${NC}"
echo "Building: ${FULL_IMAGE}"

# Use the existing Dockerfile from the repo
docker build -t "${FULL_IMAGE}" .

echo -e "${GREEN}✓ Image built successfully${NC}"

# Step 3: Create k3d cluster (if it doesn't exist)
echo -e "\n${GREEN}Step 3: Setting up k3d cluster...${NC}"

if k3d cluster list | grep -q "${CLUSTER_NAME}"; then
    echo "Cluster '${CLUSTER_NAME}' already exists"
else
    echo "Creating k3d cluster: ${CLUSTER_NAME}"
    k3d cluster create "${CLUSTER_NAME}" \
        --api-port 6550 \
        --port "${ARGOCD_PORT}:80@loadbalancer" \
        --port "9443:443@loadbalancer"

    echo -e "${GREEN}✓ Cluster created${NC}"
fi

# Wait for cluster to be ready
echo "Waiting for cluster to be ready..."
kubectl cluster-info
kubectl wait --for=condition=Ready nodes --all --timeout=60s

# Step 4: Load image into k3d
echo -e "\n${GREEN}Step 4: Loading image into k3d...${NC}"
k3d image import "${FULL_IMAGE}" -c "${CLUSTER_NAME}"
echo -e "${GREEN}✓ Image loaded into cluster${NC}"

# Step 5: Install ArgoCD
echo -e "\n${GREEN}Step 5: Installing ArgoCD...${NC}"

# Create namespace
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

# Install ArgoCD manifests
echo "Applying ArgoCD manifests..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for deployments to be created
echo "Waiting for ArgoCD deployments..."
sleep 10

# Step 6: Patch argocd-server to use custom image
echo -e "\n${GREEN}Step 6: Patching argocd-server with custom image...${NC}"

kubectl patch deployment argocd-server -n argocd \
  --type='json' \
  -p="[{
    \"op\": \"replace\",
    \"path\": \"/spec/template/spec/containers/0/image\",
    \"value\": \"${FULL_IMAGE}\"
  },{
    \"op\": \"replace\",
    \"path\": \"/spec/template/spec/containers/0/imagePullPolicy\",
    \"value\": \"Never\"
  }]"

echo -e "${GREEN}✓ Deployment patched${NC}"

# Also patch repo-server if you want the full image everywhere
kubectl patch deployment argocd-repo-server -n argocd \
  --type='json' \
  -p="[{
    \"op\": \"replace\",
    \"path\": \"/spec/template/spec/containers/0/image\",
    \"value\": \"${FULL_IMAGE}\"
  },{
    \"op\": \"replace\",
    \"path\": \"/spec/template/spec/containers/0/imagePullPolicy\",
    \"value\": \"Never\"
  }]" || echo "Repo server patch optional"

# Step 7: Wait for rollout
echo -e "\n${GREEN}Step 7: Waiting for rollout to complete...${NC}"
kubectl rollout status deployment/argocd-server -n argocd --timeout=5m

# Step 8: Get admin password
echo -e "\n${GREEN}Step 8: Retrieving admin password...${NC}"
ADMIN_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

# Step 9: Port forward
echo -e "\n${GREEN}Step 9: Setting up port forwarding...${NC}"
echo "Starting port-forward in background..."

# Kill any existing port-forward on the target port
lsof -ti:${ARGOCD_PORT} | xargs kill -9 2>/dev/null || true

kubectl port-forward svc/argocd-server -n argocd ${ARGOCD_PORT}:443 > /dev/null 2>&1 &
PORT_FORWARD_PID=$!

# Wait for port-forward to be ready
sleep 3

# Step 10: Success!
echo -e "\n${GREEN}========================================="
echo "✅ ArgoCD Mobile UI Deployed Successfully!"
echo "==========================================${NC}"
echo ""
echo "📱 Access ArgoCD:"
echo "   URL: https://localhost:${ARGOCD_PORT}"
echo "   Username: admin"
echo "   Password: ${ADMIN_PASSWORD}"
echo ""
echo "🔧 Useful Commands:"
echo "   # View pods"
echo "   kubectl get pods -n argocd"
echo ""
echo "   # View logs"
echo "   kubectl logs -n argocd deployment/argocd-server -f"
echo ""
echo "   # Restart deployment (to reload changes)"
echo "   kubectl rollout restart deployment/argocd-server -n argocd"
echo ""
echo "   # Delete cluster when done"
echo "   k3d cluster delete ${CLUSTER_NAME}"
echo ""
echo "📱 Mobile Testing:"
echo "   1. Open https://localhost:${ARGOCD_PORT} in Chrome"
echo "   2. Press F12 → Ctrl+Shift+M (device mode)"
echo "   3. Select 'iPhone 12 Pro'"
echo "   4. Login and test mobile features!"
echo ""
echo "Port-forward PID: ${PORT_FORWARD_PID}"
echo "To stop port-forward: kill ${PORT_FORWARD_PID}"
echo ""
echo -e "${YELLOW}Note: Accept the self-signed certificate warning in your browser${NC}"
