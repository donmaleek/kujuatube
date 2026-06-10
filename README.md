# KujuaTime

KujuaTime is a deployable video sharing MVP with a Vite React client, Express API, SQL schema, Docker/Nginx deployment assets, CI/CD workflows, and smoke tests.

## Project Layout

- `client/` - frontend application
- `server/` - backend API
- `database/` - migrations, seeders, and schema
- `storage/` - local development upload/video storage
- `infrastructure/` - Docker, Nginx, Kubernetes, and deployment scripts
- `docs/` - project documentation
- `tests/` - unit, integration, and end-to-end tests

## Local Development

```sh
npm run install:all
npm run dev:server
npm run dev:client
```

The API runs on `http://localhost:5000` and the client runs on `http://localhost:3000`.

Demo users:

- `demo@kujuatime.com` / `Password123!`
- `admin@kujuatime.com` / `Password123!`

## Docker Deployment

```sh
cp server/.env.example server/.env
docker compose up --build
```

The reverse-proxied app is served on `http://localhost`.

## Test

```sh
npm test --prefix server
```

## Production Notes

- Replace `JWT_SECRET` before production.
- Set `CORS_ORIGIN` to the public origin.
- `DATA_FILE` persists the local JSON-backed MVP store; mount it to durable storage in Docker.
- Point `DATABASE_URL`, `REDIS_URL`, and `S3_BUCKET` at managed services when moving beyond the JSON-backed MVP backend.
- Review `docs/DEPLOYMENT_GUIDE.md` before publishing.
