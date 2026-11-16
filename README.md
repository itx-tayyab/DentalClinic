# Dental Clinic Dashboard

Read-only dashboard for the clinic doctor: today's appointments (time, patient, service, status).
Booking happens in the separate WhatsApp bot; this app does not create, edit or delete appointments.

- `/server` — NestJS 12 + Prisma 6 + PostgreSQL API (JWT auth).
- `/client` — Next.js 16 (App Router, TypeScript, Tailwind CSS) dashboard.
- `docker-compose.yml` — PostgreSQL + server + client with health checks.

> This repo started life as a generic NestJS auth/user scaffold. See [AUDIT.md](./AUDIT.md) for the
> audit, every file decision and the security findings.

## Environment variables

Copy the examples and fill in real values (never commit them):

- Root `.env` (Docker Compose): `POSTGRES_PASSWORD`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`,
  `CLINIC_TIMEZONE`, `CLIENT_ORIGIN`.
- `server/.env` (local development): `DATABASE_URL`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`,
  `PORT`, `CORS_ORIGIN`, `CLINIC_TIMEZONE`.
- `client/.env.local` (local development): `API_BASE_URL`, `CLINIC_TIMEZONE`, `PORT`.

Generate secrets with `openssl rand -hex 32`.

## Run with Docker (recommended)

```bash
cp .env.example .env          # then fill in the values
docker compose up --build -d
docker compose ps             # all three services must be healthy
```

The API is on <http://localhost:8000>, the dashboard on <http://localhost:3000>.
On a fresh database the appointment list is empty; load development data only:

```bash
docker compose --profile tools run --rm seed
```

Create a staff account and promote it to `DOCTOR` (self-signup always creates `USER`):

```bash
curl -X POST http://localhost:8000/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"name":"Dr Ayesha","email":"doctor@clinic.test","password":"change-me-please"}'

docker compose exec db psql -U dental -d dental_clinic \
  -c "UPDATE \"User\" SET role='DOCTOR' WHERE email='doctor@clinic.test';"
```

Then sign in at <http://localhost:3000/signin>.

Useful endpoints:

```bash
curl http://localhost:8000/health
curl http://localhost:3000/api/health
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/appointments?date=$(date +%F)"
```

Stop the stack with `docker compose down` (keeps the database volume).

## Run locally without Docker for the app

Requires Node.js 24.9+ (Node 26 LTS is used in the images) and a PostgreSQL 17 database.

```bash
# 1. A development database
docker run -d --name dental-db \
  -e POSTGRES_PASSWORD=devpassword -e POSTGRES_DB=dental_clinic \
  -p 5433:5432 postgres:17.12-alpine

# 2. Server
cd server
cp .env.example .env          # set DATABASE_URL=postgresql://postgres:devpassword@localhost:5433/dental_clinic
npm ci
npx prisma migrate deploy
npm run db:seed               # optional development data
npm run start:dev

# 3. Client (separate terminal)
cd client
cp .env.example .env.local
npm ci
npm run dev
```

Open <http://localhost:3000>. The date switcher defaults to today in `CLINIC_TIMEZONE`.

## Checks

```bash
cd server && npm run lint && npm test && npm run build
cd client && npm run lint && npm run build
```

Server tests need `NODE_OPTIONS=--experimental-vm-modules` on Node 26 because NestJS 12 ships ESM-only
packages; the `npm test` scripts already set it.

## API

`GET /appointments?date=YYYY-MM-DD` — requires a bearer token with role `DOCTOR` or `ADMIN`.
Returns `{ date, timeZone, appointments: [{ id, patientName, service, startsAt, durationMinutes,
status }] }`, ordered by start time. There are no write endpoints. Seed data is never loaded in
production; run the seed profile/script only in development.
