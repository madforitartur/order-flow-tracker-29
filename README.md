# Order Flow Tracker 29

Monorepo with a Vite + React + TypeScript frontend and a Fastify + PostgreSQL backend.

## Structure

- `apps/web` - Vite + React UI
- `apps/api` - Fastify API
- `packages/shared` - Shared schemas/types

## Quick start

```bash
npm install
npm run dev:web
npm run dev:api
```

Set `VITE_API_URL` in `apps/web` or use the default `http://localhost:4000`.

## API

Health check: `GET /health`

Uploads: `POST /api/imports`
