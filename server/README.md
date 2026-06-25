# server

Standalone Bun API server. Hosts the same `/api/v1/*` endpoints as the Next.js
client, backed by the same Mongoose schemas — the controllers, models, and
validators are copied verbatim from `client/Utils/api`. Only the framework glue
differs: `next/server` and `next/headers` are replaced by small shims (`shims/`)
and a native `Bun.serve` router (`index.ts`).

## Setup

```bash
bun install
cp .env.example .env   # then fill in real values
```

## Run

```bash
bun start        # production
bun run dev      # watch mode
```

Listens on `PORT` (default `5000`).

## Endpoints

All routes mirror the client one-to-one:

- `GET/POST/PATCH/PUT/DELETE /api/v1/assignment`
- `GET/POST /api/v1/assignment/custom`
- `POST /api/v1/assignment/fetch`, `/fetch-candidates`
- `GET /api/v1/assignment/get-attempted`, `/get-candidates-by-months`, `/get-names`
- `POST /api/v1/contact-us`
- `POST /api/v1/generate-test`, `/submit-test`, `/suggest-subtopics`
- `POST /api/v1/jd-generator/parse|generate|approve|regenerate`, `PATCH /api/v1/jd-generator/set/:id`
- `GET /api/v1/users`
- `POST /api/v1/users/login|register|generate-otp|reset-pass|send-registration-otp`
- `GET/PATCH /api/v1/users/profile`

## How it works

- `shims/next-server.ts` — `NextResponse`/`NextRequest` over the Web Fetch API.
- `shims/next-headers.ts` — `headers()`/`cookies()` backed by `AsyncLocalStorage`,
  populated per request. Outgoing `cookies().set/.delete` are flushed to
  `Set-Cookie` headers by the router.
- `tsconfig.json` `paths` redirect `next/server` and `next/headers` to the shims
  and map `@/*` to the project root, so the copied code needs zero edits.
