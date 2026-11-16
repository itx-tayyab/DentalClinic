# Dental Clinic Dashboard

Read-only dashboard for the clinic doctor. It shows **today's appointments** — how many, who, what
service, and what time — plus a date switcher. Booking, cancelling and rescheduling stay in the n8n
WhatsApp workflow; this app has no write actions.

- Frontend only: Next.js 16 (App Router, TypeScript, Tailwind CSS) in `/client`.
- Appointments come from Google Calendar through an n8n webhook.
- One Next.js route handler proxies the webhook so `N8N_DASHBOARD_KEY` never reaches the browser.
- A password gate (signed, HttpOnly cookie) protects patient data.

See [AUDIT.md](./AUDIT.md) for the file audit, decisions and security notes.

## Environment variables

All values are **server-only**. Never prefix them with `NEXT_PUBLIC_`.

| Variable | Required | Where the value comes from |
| --- | --- | --- |
| `N8N_APPOINTMENTS_URL` | yes (unless fixtures) | The n8n Webhook node URL that returns today's Google Calendar events. |
| `N8N_DASHBOARD_KEY` | yes (unless fixtures) | Shared secret configured in n8n; sent as the `x-dashboard-key` header. |
| `DASHBOARD_PASSWORD` | yes | Password the doctor types at the login gate. |
| `DASHBOARD_TIMEZONE` | yes | IANA zone for “today” and displayed times, e.g. `Asia/Karachi`. |
| `DASHBOARD_USE_FIXTURES` | no | `true` uses `fixtures/appointments.json` instead of n8n. Never use in production. |

Copy `client/.env.example` to `client/.env.local` and fill it in. `.env.local` is git-ignored.

## Run locally

```bash
cd client
cp .env.example .env.local      # fill in the values
npm ci
npm run dev                     # http://localhost:3000
```

Use fixtures while n8n is not wired up:

```bash
# in .env.local
DASHBOARD_USE_FIXTURES="true"
```

The fixture file contains fake names and phone numbers only. Real patient data must never be committed.

Checks:

```bash
cd client
npm run lint
npm run typecheck
npm test
npm run build
```

## n8n webhook contract

`GET /api/appointments?date=YYYY-MM-DD` (server-side) calls:

```text
GET {N8N_APPOINTMENTS_URL}?date=YYYY-MM-DD
x-dashboard-key: {N8N_DASHBOARD_KEY}
```

The handler accepts an array of Google Calendar events or an object wrapping them under
`events`, `items`, `appointments`, `data` or `body` (including n8n `{ json: ... }` items). Each event
should have `id`, `summary`, `description`, `start.dateTime` and `end.dateTime`.

Event summaries are parsed as:

```text
Name - phone (service)
```

The phone is preferred from `description`; the summary phone is the fallback. All-day events without a
`dateTime` are ignored. The browser receives only:

```json
{
  "date": "2026-11-16",
  "timeZone": "Asia/Karachi",
  "source": "n8n",
  "appointments": [
    {
      "id": "event-id",
      "start": "2026-11-16T04:00:00.000Z",
      "end": "2026-11-16T04:30:00.000Z",
      "patientName": "Ayesha Khan",
      "phone": "+92 300 0000001",
      "service": "Dental cleaning",
      "status": "past"
    }
  ]
}
```

`status` is computed from the start/end time: `upcoming`, `now` or `past`.

## Access control

`client/src/proxy.ts` is the Next.js 16 request gate (the file convention formerly called
middleware). It checks an HMAC-signed, HttpOnly, SameSite=Lax cookie before any page or API route is
served. The cookie is issued by `POST /api/auth/login` after comparing `DASHBOARD_PASSWORD`, expires
after 12 hours and is signed with a key derived from that password (changing the password revokes all
sessions). Unauthenticated API calls receive `401`; pages redirect to `/login`.

## Deployment notes

- Set the variables in the hosting provider’s server environment, not in client-side build variables.
- Serve over HTTPS. The session cookie is marked `Secure` when `NODE_ENV=production`.
- Keep `DASHBOARD_USE_FIXTURES` unset/false in production.
- No database of this app exists; the n8n workflow and its Postgres chat history are untouched.
