#!/usr/bin/env sh
set -eu

IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-ghcr.io/your-org}"

docker build -f infrastructure/docker/Dockerfile.server -t "$REGISTRY/kujuatime-server:$IMAGE_TAG" .
docker build -f infrastructure/docker/Dockerfile.client -t "$REGISTRY/kujuatime-client:$IMAGE_TAG" .
docker build -f infrastructure/docker/Dockerfile.nginx -t "$REGISTRY/kujuatime-nginx:$IMAGE_TAG" .

docker push "$REGISTRY/kujuatime-server:$IMAGE_TAG"
docker push "$REGISTRY/kujuatime-client:$IMAGE_TAG"
docker push "$REGISTRY/kujuatime-nginx:$IMAGE_TAG"

kubectl apply -f infrastructure/kubernetes/
