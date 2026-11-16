# Audit — Read-only dental clinic dashboard

Date: 2026-11-16
Branch: `cleanup-and-dashboard`

## Scope

The WhatsApp bot lives entirely in n8n (workflow "Clinic WhatsApp Assistant v3.1"). This repository is
being reduced to a read-only Next.js dashboard that proxies one n8n webhook. There is **no backend** in
this repo: appointments are Google Calendar events fetched through n8n.

Audit evidence: `git ls-files` (78 tracked files), `find` excluding `node_modules`/`.git`/build output,
imports and package scripts. No deleted file is listed as used by anything else.

**Not present in this repo:** the n8n workflow JSON, any SQL/schema for the `n8n_chat_histories`
messages table, and any Docker scripts beyond the files listed below. Therefore there is nothing to
move into `/n8n/`. The messages table exists only in the external n8n Postgres database.

## Decisions

| Path | Decision | Reason |
| --- | --- | --- |
| `.env.example` | REMOVE | Docker Compose/backend-only (`POSTGRES_PASSWORD`, JWT secrets); no Docker or server will remain. |
| `.gitignore` | KEEP | Still needed; will be updated for the new local env file. |
| `AUDIT.md` | KEEP | This report. |
| `README.md` | KEEP | Will be rewritten for the dashboard-only setup. |
| `docker-compose.yml` | REMOVE | Docker is explicitly removed; it also defined the deleted Postgres/server/client services. |
| `client/Dockerfile` | REMOVE | Docker is explicitly removed. |
| `client/.dockerignore` | REMOVE | Docker-only. |
| `client/.env.example` | KEEP | Kept, rewritten with the new server-only dashboard variables. |
| `client/.gitignore` | KEEP | Ignores `.next`, `node_modules`, `.env*`. |
| `client/README.md` | REMOVE | Stale create-next-app boilerplate; superseded by the root README. Not referenced anywhere. |
| `client/next.config.ts` | KEEP | Used by the Next build. The `output: "standalone"` option is Docker-only and is dropped during cleanup. |
| `client/package.json` | KEEP | Client manifest; scripts/dependencies updated in later phases. |
| `client/package-lock.json` | KEEP | The single npm lockfile for the client. |
| `client/postcss.config.mjs` | KEEP | Required by Tailwind CSS v4. |
| `client/eslint.config.mjs` | KEEP | Used by `npm run lint`. |
| `client/tsconfig.json` | KEEP | Used by typecheck/build. |
| `client/src/app/api/health/route.ts` | REMOVE | Existed only for the removed Docker health check; nothing else calls it. |
| `client/src/app/api/proxy/[...path]/route.ts` | REMOVE | Generic proxy for the deleted NestJS API; replaced by the dedicated `/api/appointments` handler. |
| `client/src/app/(auth)/signin/page.tsx` | REMOVE | Calls the deleted `/auth/signin` backend; replaced by the password gate. |
| `client/src/app/(auth)/signup/page.tsx` | REMOVE | Calls the deleted `/auth/signup` backend; no signup is needed for a single doctor dashboard. |
| `client/src/app/dashboard/admin/page.tsx` | REMOVE | Backend user-management page; `/server` is being deleted and the new app has no user admin. |
| `client/src/app/dashboard/moderator/page.tsx` | REMOVE | Same: depends on the deleted users API. |
| `client/src/app/dashboard/user/page.tsx` | REMOVE | Same: localStorage profile page for the deleted auth flow. |
| `client/src/app/dashboard/page.tsx` | KEEP | The dashboard entry point; rewritten to fetch `/api/appointments`. |
| `client/src/app/favicon.ico` | KEEP | Served by the App Router. |
| `client/src/app/globals.css` | KEEP | Tailwind entry, imported by `layout.tsx`. |
| `client/src/app/layout.tsx` | KEEP | Root layout; metadata updated. |
| `client/src/app/page.tsx` | KEEP | Redirects to `/dashboard`; still the root route. |
| `client/src/components/appointments-dashboard.tsx` | KEEP | The dashboard UI component; adapted to the new normalized API shape. |
| `client/src/lib/api.ts` | KEEP | Shared appointment types/helpers; rewritten for the new handler. |
| `server/Dockerfile` | REMOVE | Docker and the backend are removed. |
| `server/.dockerignore` | REMOVE | Docker-only. |
| `server/.env.example` | REMOVE | Backend-only environment (database URL, JWT secrets). |
| `server/.gitignore` | REMOVE | No server remains. |
| `server/.prettierrc` | REMOVE | Server tooling only. |
| `server/README.md` | REMOVE | NestJS starter documentation for a removed package. |
| `server/eslint.config.mjs` | REMOVE | Server tooling only. |
| `server/nest-cli.json` | REMOVE | NestJS CLI config for the removed backend. |
| `server/package.json` | REMOVE | Backend manifest. |
| `server/package-lock.json` | REMOVE | Backend lockfile. |
| `server/tsconfig.json` | REMOVE | Backend TypeScript config. |
| `server/tsconfig.build.json` | REMOVE | Backend build config. |
| `server/prisma/schema.prisma` | REMOVE | ORM schema for the deleted backend; describes `User`/`Appointment`, not the n8n messages table. |
| `server/prisma/migrations/migration_lock.toml` | REMOVE | ORM migration metadata. |
| `server/prisma/migrations/20251117195222_init/migration.sql` | REMOVE | Backend auth migration; not a messages-table schema. |
| `server/prisma/migrations/20261116120000_add_appointments/migration.sql` | REMOVE | Backend appointments table, now superseded by Google Calendar via n8n. |
| `server/prisma/migrations/20261116130000_add_doctor_role/migration.sql` | REMOVE | Backend role migration. |
| `server/prisma/seed.ts` | REMOVE | Backend seed data. |
| `server/src/app.controller.spec.ts` | REMOVE | Backend unit test. |
| `server/src/app.controller.ts` | REMOVE | NestJS controller. |
| `server/src/app.module.ts` | REMOVE | NestJS module. |
| `server/src/app.service.ts` | REMOVE | NestJS service. |
| `server/src/appointments/appointments.controller.spec.ts` | REMOVE | Backend unit test. |
| `server/src/appointments/appointments.controller.ts` | REMOVE | Backend read endpoint; replaced by the Next route handler. |
| `server/src/appointments/appointments.module.ts` | REMOVE | NestJS module. |
| `server/src/appointments/appointments.service.spec.ts` | REMOVE | Backend unit test. |
| `server/src/appointments/appointments.service.ts` | REMOVE | Backend Prisma service. |
| `server/src/auth/auth.controller.spec.ts` | REMOVE | Backend unit test. |
| `server/src/auth/auth.controller.ts` | REMOVE | NestJS auth controller. |
| `server/src/auth/auth.module.ts` | REMOVE | NestJS auth module. |
| `server/src/auth/auth.service.spec.ts` | REMOVE | Backend unit test. |
| `server/src/auth/auth.service.ts` | REMOVE | Backend auth service. |
| `server/src/auth/DTO/signin.dto.ts` | REMOVE | Backend DTO. |
| `server/src/auth/DTO/signup.dto.ts` | REMOVE | Backend DTO. |
| `server/src/auth/jwt.startegy.ts` | REMOVE | Backend JWT strategy. |
| `server/src/main.ts` | REMOVE | NestJS bootstrap. |
| `server/src/prisma/prisma.module.ts` | REMOVE | Prisma module. |
| `server/src/prisma/prisma.service.spec.ts` | REMOVE | Backend unit test. |
| `server/src/prisma/prisma.service.ts` | REMOVE | Prisma client wrapper. |
| `server/src/user/roles.decorator.ts` | REMOVE | Backend RBAC decorator. |
| `server/src/user/roles.guard.ts` | REMOVE | Backend RBAC guard. |
| `server/src/user/user.controller.spec.ts` | REMOVE | Backend unit test. |
| `server/src/user/user.controller.ts` | REMOVE | Backend user controller. |
| `server/src/user/user.module.ts` | REMOVE | NestJS module. |
| `server/src/user/user.service.spec.ts` | REMOVE | Backend unit test. |
| `server/src/user/user.service.ts` | REMOVE | Backend user service. |
| `server/test/app.e2e-spec.ts` | REMOVE | Backend e2e test. |
| `server/test/jest-e2e.json` | REMOVE | Backend Jest config. |

## Untracked / ignored artifacts removed with their parent

These are not committed, but are removed with `/server` so no stale secrets or build output remain:

- `server/.env` (local database/JWT values; contents never printed)
- `server/node_modules/`, `server/dist/`, `server/tsconfig.build.tsbuildinfo`
- root `.env` (local Compose/database values; contents never printed)

`client/node_modules/` and `client/.next/` are ignored build/install output and are kept for local
verification; they are not committed.

## REVIEW

There are no tracked files that could not be proven unused. Every KEEP above is either imported by the
running app, required by the build tooling, or explicitly required by the task (README, audit, env
example). The external n8n workflow and its Postgres messages table are out of this repo's control and
were not touched.

## Secrets

- No real secret is present in the current tracked files. All `.env.example` values are placeholders.
- The ignored local `server/.env` and root `.env` contain development values and are deleted with the
  backend. Their values are not reproduced here.
- **Rotate the old JWT fallback secret.** A hardcoded JWT fallback was committed in an earlier state of
  this repo and the repository has a GitHub remote, so treat it as pushed. It is no longer in the
  working tree, but it remains in git history. Deleting `/server` does not remove git history.
- The new dashboard secrets (`N8N_DASHBOARD_KEY`, `DASHBOARD_PASSWORD`) were never committed and are
  read only from server-side environment variables.

## Dependency check (Phase 2)

`npx depcheck` in `/client` reports **no unused runtime dependencies** and no missing imports.
Its dev-dependency flags (`tailwindcss`, `@tailwindcss/postcss`, `@types/node`, `@types/react-dom`) are
false positives: Tailwind v4 is loaded by `postcss.config.mjs`, and the `@types` packages supply the
ambient types used by the Next.js config and React DOM. Nothing was removed.

## Package updates (Phase 3)

The client was already on current stable versions from the previous cleanup. `npm-check-updates`
reported only one remaining major:

| Package | Latest | Decision |
| --- | --- | --- |
| TypeScript | 7.0.2 | **Pinned to 6.0.3.** TypeScript 7 is the new native compiler. `eslint-config-next@16.4.6` depends on `typescript-eslint@8.72.2`, whose peer range is `>=4.8.4 <6.1.0`. Upgrading would break linting. |

Everything else is at the latest stable: Next.js 16.4.6, React/React DOM 19.3.1, ESLint 10.15.0,
`eslint-config-next` 16.4.6, Tailwind CSS 4.1.16, `@types/node` 26.6.6.

Added for the dashboard: `@date-fns/tz` (fixture local-time conversion) and `tsx` (development test
runner). `engines.node` is `>=26.13.1` (current LTS) and `.nvmrc` contains `26.13.1`.

Verification of this phase ran `lint`, `typecheck`, `test` and `build` after installation. The host
that ran the checks has Node 24.16; the package engines target Node 26 LTS. The code uses only APIs
available in both.

## Dashboard implementation (Phase 4)

Files added for the frontend-only design:

| Path | Purpose |
| --- | --- |
| `client/src/app/api/appointments/route.ts` | Server-only GET handler; reads `N8N_APPOINTMENTS_URL` / `N8N_DASHBOARD_KEY`, forwards `date`, normalizes events, or serves fixtures. |
| `client/src/lib/appointments.ts` | Pure parsing/normalization: `Name - phone (service)` summaries, description phone, event wrappers, status calculation, fixture builder. |
| `client/src/lib/api.ts` | Shared types, response validation, date/time helpers. |
| `client/src/lib/session.ts` | HMAC-SHA256 signed session value (Web Crypto). |
| `client/src/proxy.ts` | Next.js 16 request gate (formerly `middleware.ts`); redirects pages to `/login`, returns 401 for APIs. |
| `client/src/app/api/auth/login/route.ts` | Constant-time password check, sets HttpOnly/SameSite cookie. |
| `client/src/app/api/auth/logout/route.ts` | Clears the cookie. |
| `client/src/app/login/page.tsx` | Password form with error state. |
| `client/fixtures/appointments.json` | Fake sample appointments only. |
| `client/src/lib/appointments.test.ts`, `session.test.ts` | Node test runner tests for parsing, dates and cookie signing. |

No `NEXT_PUBLIC_` variable exists, so the webhook URL and key cannot leak into browser code. The
appointments route is GET-only; there are no booking, cancel, reschedule or other write handlers.

## Verification (Phase 5)

- `npm run lint`, `npm run typecheck`, `npm test` (10 tests) and `npm run build` all pass.
- With `DASHBOARD_USE_FIXTURES=true`: unauthenticated `/` redirects to `/login`, unauthenticated
  `/api/appointments` returns 401, a wrong password shows the error, the correct password sets the
  cookie and renders 9 fixtures, the date switcher refetches, sign-out returns to `/login`, and the
  browser console has no errors.
- Mobile (390 px) and desktop (1280 px) layouts were screenshotted and checked.
- With fixtures disabled and an unreachable n8n URL, `/api/appointments` returns 502 and the UI shows
  its error state.
- The live n8n webhook was **not** tested; no URL or key is available in this repo.
- The empty state is implemented but fixtures always return sample rows; it is exercised when n8n
  returns an empty event list.
