# Deployment Guide

## Docker Compose

1. Create environment:

```sh
cp server/.env.example server/.env
```

2. Edit `server/.env`:

- `JWT_SECRET`
- `CORS_ORIGIN`
- `DATA_FILE`
- `DATABASE_URL` if using PostgreSQL
- `REDIS_URL` if using Redis
- `S3_BUCKET` if using object storage

3. Build and run:

```sh
docker compose up --build
```

The Nginx gateway serves the client and proxies `/api` to the server.
The compose file mounts durable volumes for uploaded files and the JSON data store.

## Kubernetes

1. Build and push images with `infrastructure/scripts/deploy.sh`.
2. Create the secret:

```sh
kubectl create secret generic kujuatime-secrets --from-literal=jwt-secret='replace-me'
```

3. Apply manifests:

```sh
kubectl apply -f infrastructure/kubernetes/
```

Update image names and host names before applying to a real cluster.

## Health Checks

- `GET /health` returns service, environment, and timestamp.
- `GET /api/health` returns a compact API health response.
