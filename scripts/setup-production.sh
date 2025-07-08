#!/bin/bash
set -e

echo "🚀 Setting up Scorpius Enterprise Production Environment"

# Check prerequisites
command -v kubectl >/dev/null 2>&1 || { echo "kubectl is required but not installed. Aborting." >&2; exit 1; }
command -v helm >/dev/null 2>&1 || { echo "helm is required but not installed. Aborting." >&2; exit 1; }

# Configuration
NAMESPACE="scorpius-production"
RELEASE_NAME="scorpius"

# Create namespace
echo "📦 Creating namespace: $NAMESPACE"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Create secrets
echo "🔐 Setting up secrets..."
if [ -f ".env.production" ]; then
    source .env.production
    kubectl create secret generic scorpius-secrets \
        --from-literal=database-url="$DATABASE_URL" \
        --from-literal=redis-url="$REDIS_URL" \
        --from-literal=jwt-secret="$JWT_SECRET" \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
else
    echo "⚠️  .env.production file not found. Please create it with required secrets."
    exit 1
fi

# Deploy monitoring stack
echo "📊 Deploying monitoring stack..."
kubectl apply -f monitoring/kubernetes/ -n $NAMESPACE

# Deploy application
echo "🚀 Deploying Scorpius application..."
kubectl apply -f deploy/kubernetes/ -n $NAMESPACE

# Wait for deployments
echo "⏳ Waiting for deployments to be ready..."
kubectl rollout status deployment/api-gateway -n $NAMESPACE --timeout=300s
kubectl rollout status deployment/prometheus -n $NAMESPACE --timeout=300s

# Setup ingress
echo "🌐 Setting up ingress..."
kubectl apply -f deploy/kubernetes/ingress.yaml -n $NAMESPACE

# Verify deployment
echo "✅ Verifying deployment..."
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE

echo "🎉 Scorpius Enterprise deployed successfully!"
echo "📊 Monitoring: http://grafana.scorpius.local"
echo "🔍 Metrics: http://prometheus.scorpius.local"
echo "🚀 API: https://api.scorpius.local"