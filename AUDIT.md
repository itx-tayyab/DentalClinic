# Repo Audit — DentalClinic

Date: 2026-11-16
Branch: `cleanup-and-frontend`

## Repo identity check (important)

This repository is **not yet** a dental-clinic WhatsApp-assistant dashboard. It contains:

- `/server`: a NestJS 11 starter with JWT sign-in/sign-up, Prisma + PostgreSQL, and role-based user
  administration (`USER` / `MODERATOR` / `ADMIN`). No appointment, patient, or WhatsApp code exists.
- `/client`: a create-next-app (Next.js 16) app with sign-in/sign-up pages and three user-management
  dashboards that call `http://localhost:8000` directly.

There is no connection to the WhatsApp bot in this repo. The bot's database (`clinic_bot`, table
`n8n_chat_histories`) is served by a separate, pre-existing `clinic-db` container and was not touched.

Scope was therefore adjusted as follows: keep the existing Next.js framework and the existing auth
flow (out of scope to rewrite), and add the read-only "today's appointments" dashboard that the
product brief asks for, using the existing NestJS + Prisma stack. Booking endpoints are not added.

## Evidence used

- `git ls-files` (62 tracked files), `git status --ignored`
- `grep` for imports/requires, route decorators, `process.env`, Docker references
- `package.json` scripts, `docker-compose.yml`, both Dockerfiles
- `npx depcheck` in `/client` and `/server`
- Baseline runs: server `npm run build` passes; server tests 4/6 suites fail (missing test providers);
  client `npm run build` fails on a TypeScript error in `dashboard/admin/page.tsx`; client lint has
  3 errors and 5 warnings.
- No `node_modules`, `dist`, `.next`, logs, `.DS_Store`, editor files, `.env`, keys or certificates
  are tracked. No yarn/pnpm lockfiles exist.

## Decisions

| Path | Decision | Reason |
| --- | --- | --- |
| `docker-compose.yml` | KEEP | Used to run the stack, but broken today: references missing `Dockerfile.dev`, has an unused Redis service, and no database. Rebuilt in Phase 5. |
| `client/.gitignore` | KEEP | Ignores `.next`, `node_modules`, `.env*`. |
| `client/Dockerfile` | KEEP | Only client image definition; rewritten in Phase 3/5 (Node 18 is EOL, dev-only CMD). |
| `client/README.md` | KEEP | Documentation, stale create-next-app text. Harmless. |
| `client/eslint.config.mjs` | KEEP | Used by `npm run lint`. |
| `client/next.config.ts` | KEEP | Enables React Compiler; consumed by `next build`. |
| `client/package-lock.json` | KEEP | Only npm lockfile for this package. |
| `client/package.json` | KEEP | Manifest and scripts. |
| `client/postcss.config.mjs` | KEEP | Required by Tailwind CSS v4. |
| `client/tsconfig.json` | KEEP | Used by `next build`; duplicate `.next\\dev/types` include entries cleaned up. |
| `client/public/file.svg` | REMOVE | Zero references anywhere in the repo. |
| `client/public/globe.svg` | REMOVE | Zero references anywhere in the repo. |
| `client/public/window.svg` | REMOVE | Zero references anywhere in the repo. |
| `client/public/next.svg` | REMOVE | Only referenced by the create-next-app demo page that is being replaced; removed with it in Phase 4. |
| `client/public/vercel.svg` | REMOVE | Only referenced by the create-next-app demo page that is being replaced; removed with it in Phase 4. |
| `client/src/app/favicon.ico` | KEEP | Served by the App Router metadata. |
| `client/src/app/globals.css` | KEEP | Tailwind entry, imported by `layout.tsx`. |
| `client/src/app/layout.tsx` | KEEP | Root layout; metadata updated in Phase 4. |
| `client/src/app/page.tsx` | REMOVE | create-next-app demo landing page with no product links; replaced by a redirect to `/dashboard` in Phase 4. |
| `client/src/app/(auth)/signin/page.tsx` | REVIEW | Auth flow, reaches `/auth/signin`; hardcodes `http://localhost:8000`; token in `localStorage`; references a missing `/google.svg`; dead `console.log`. |
| `client/src/app/(auth)/signup/page.tsx` | REVIEW | Auth flow, reaches `/auth/signup`; hardcodes the API URL. |
| `client/src/app/dashboard/admin/page.tsx` | REVIEW | Auth + user PII; has the type error that currently breaks `next build`. |
| `client/src/app/dashboard/moderator/page.tsx` | REVIEW | Auth + user PII; lint errors. |
| `client/src/app/dashboard/user/page.tsx` | REVIEW | Auth; lint errors. |
| `server/.gitignore` | KEEP | Ignores `dist`, `node_modules`, `.env`. |
| `server/.prettierrc` | KEEP | Used by `format` and ESLint Prettier plugin. |
| `server/Dockerfile` | KEEP | Only server image definition; rewritten in Phase 3/5 (Node 18 is EOL, dev-only CMD). |
| `server/README.md` | KEEP | Documentation, generic NestJS text. Harmless. |
| `server/eslint.config.mjs` | KEEP | Used by `npm run lint`. |
| `server/nest-cli.json` | KEEP | Used by `nest build` / `nest start`. |
| `server/package-lock.json` | KEEP | Only npm lockfile for this package. |
| `server/package.json` | KEEP | Manifest, scripts, Jest config. |
| `server/prisma/schema.prisma` | REVIEW | Data model; no appointment model yet; drift with the init migration (`role` is `TEXT` in SQL but an enum in schema). Additive change only. |
| `server/prisma/migrations/migration_lock.toml` | REVIEW | Migration metadata; may already have been applied. Not edited. |
| `server/prisma/migrations/20251117195222_init/migration.sql` | REVIEW | May have run in an environment; never edited or re-run. |
| `server/src/main.ts` | KEEP | Nest bootstrap; hardcoded CORS origin/port moved to env in Phase 4/5. |
| `server/src/app.module.ts` | KEEP | Root module; double registration of `UserController`/`UserService` cleaned up (they are also in `UserModule`). |
| `server/src/app.controller.ts` | KEEP | Serves `GET /`; gains `GET /health` in Phase 5. |
| `server/src/app.controller.spec.ts` | KEEP | Only test suite that passes today. |
| `server/src/app.service.ts` | KEEP | Used by `AppController`. |
| `server/src/auth/auth.controller.ts` | REVIEW | Auth (`POST /auth/signup`, `POST /auth/signin`). |
| `server/src/auth/auth.controller.spec.ts` | REVIEW | Placeholder test that cannot compile (missing `AuthService`/`JwtService` providers); fixed in Phase 4. |
| `server/src/auth/auth.module.ts` | REVIEW | Auth; contains a large commented-out duplicate module and a weak `defaultSecret` fallback. |
| `server/src/auth/auth.service.ts` | REVIEW | Auth; contains a commented-out duplicate implementation; signs access tokens with a different secret than the JWT strategy verifies with; `signup` returns the bcrypt hash. Security fixes in Phase 2. |
| `server/src/auth/auth.service.spec.ts` | REVIEW | Placeholder test that cannot compile (missing providers). |
| `server/src/auth/jwt.startegy.ts` | REVIEW | Auth; contains a hardcoded fallback signing secret and logs JWT payloads. Security fixes in Phase 2. |
| `server/src/auth/DTO/signin.dto.ts` | REVIEW | Auth DTO. |
| `server/src/auth/DTO/signup.dto.ts` | REVIEW | Auth DTO. |
| `server/src/prisma/prisma.module.ts` | KEEP | Global DB module used by `AuthModule`/`UserService`. |
| `server/src/prisma/prisma.service.ts` | KEEP | Prisma client lifecycle; reused by the new appointments route. |
| `server/src/prisma/prisma.service.spec.ts` | REVIEW | Placeholder test that opens a real DB connection; would fail without a database. |
| `server/src/user/roles.decorator.ts` | KEEP | Used by `UserController`. |
| `server/src/user/roles.guard.ts` | KEEP | Used by `UserController`; debug `console.log` calls removed. |
| `server/src/user/user.controller.ts` | REVIEW | Guarded user PII + role mutation endpoints. |
| `server/src/user/user.controller.spec.ts` | REVIEW | Placeholder test that cannot compile (missing `UserService`). |
| `server/src/user/user.module.ts` | KEEP | Imported by `AppModule` (currently empty). |
| `server/src/user/user.service.ts` | REVIEW | Reads/updates user PII. |
| `server/src/user/user.service.spec.ts` | REVIEW | Placeholder test that cannot compile (missing `PrismaService`). |
| `server/test/app.e2e-spec.ts` | REVIEW | E2E test; needs a live PostgreSQL database. Kept and run against the Docker DB. |
| `server/test/jest-e2e.json` | KEEP | Config for `test:e2e`. |
| `server/tsconfig.build.json` | KEEP | Excludes specs/tests from `nest build`. |
| `server/tsconfig.json` | KEEP | TypeScript config for build, lint, tests. |

## Dead code inside kept/REVIEW files (removed in Phase 2)

- `server/src/auth/auth.service.ts`: ~57 lines of commented-out original implementation.
- `server/src/auth/auth.module.ts`: ~43 lines of commented-out module definition.
- `server/src/auth/jwt.startegy.ts`, `server/src/user/roles.guard.ts`: debug `console.log` of user/JWT data.
- `server/tsconfig.json`: duplicate `.next\\dev/types/**/*.ts` entries.

## Secrets and credentials

No `.env`, key, token or certificate file is committed. However:

1. `server/src/auth/jwt.startegy.ts` contains a **hardcoded fallback JWT signing secret** (a 128-character
   hex string). It is committed in git history and the repo has a GitHub remote, so treat it as leaked.
2. `server/src/auth/auth.module.ts` falls back to the literal secret `defaultSecret` when
   `ACCESS_TOKEN_SECRET` is missing.
3. `docker-compose.yml` reads `DATABASE_URL` from the host environment; no value is committed.

Action taken: both fallbacks removed, secrets read only from environment variables, `server/.env.example`
added with placeholders, and a root `.gitignore` added. The values are never printed in this report.

**Rotate the leaked JWT secret** (and any real value used for `DATABASE_URL`, `ACCESS_TOKEN_SECRET`,
`REFRESH_TOKEN_SECRET`) because the fallback secret exists in pushed history. Rotating invalidates old
tokens; it does not rewrite history.

## Unused dependencies

`depcheck` plus manual verification (some flags are false positives required by tooling):

- `server`: `@eslint/eslintrc`, `@types/bcrypt`, `ts-loader`, `source-map-support` — no imports and not
  referenced by any script/config. `@nestjs/schematics` is only used by `nest generate`; kept because the
  Nest CLI advertises it and removing it breaks scaffolding. `@types/jest`, `@types/express`,
  `@types/jsonwebtoken`, `tsconfig-paths` are ambient/indirect but required by the test/tooling chain.
- `client`: none. `tailwindcss`, `@tailwindcss/postcss`, `@types/node`, `@types/react-dom` and
  `babel-plugin-react-compiler` are flagged by depcheck but are required by PostCSS/TypeScript/React
  Compiler respectively.

## Lockfiles

Only `client/package-lock.json` and `server/package-lock.json` exist; no yarn/pnpm/bun lockfiles. Nothing
to delete.

## REVIEW items left untouched

All `REVIEW` rows above, plus: the auth flow, the user/PII endpoints, the existing Prisma migration, and
the admin/moderator/user dashboard pages. Migrations are additive only; nothing is dropped.
