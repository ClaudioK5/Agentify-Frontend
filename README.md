# Agentify (Pulse web)

Web client for Pulse / Agentify — separate from the mobile Expo app in `../pulse`.

## Requirements

- Node.js 18+
- Google Cloud **Web application** OAuth client (same as mobile `googleWebClientId`)
- Pulse API base URL (same as mobile `pulseApiUrl`)

## Environment variables

Copy `.env.example` to `.env.local` (or `.env`) and set:

| Variable | Description |
|----------|-------------|
| `VITE_PULSE_API_URL` | Pulse API host, no trailing slash (e.g. `https://klaudioc.pythonanywhere.com`) |
| `VITE_GOOGLE_WEB_CLIENT_ID` | Google OAuth Web client ID (`*.apps.googleusercontent.com`) |
| `VITE_AGENTS_API_URL` | Agents API host (default `https://claudiok.pythonanywhere.com`) |

`NEXT_PUBLIC_*` variants are also supported for compatibility.

## Google Cloud Console (fix “no registered origin”)

Open [Credentials](https://console.cloud.google.com/apis/credentials) → your **Web application** client  
(`775066197644-…apps.googleusercontent.com`).

Under **Authorized JavaScript origins**, add **exactly** (no path, no trailing slash):

```
http://localhost:5173
```

Do **not** use `http://localhost:5173/` — Google stores origins without a trailing slash.

`npm run dev` is configured to always use `http://localhost:5173` (not `127.0.0.1`). Open that URL in the browser after saving in Google Console (changes can take 1–2 minutes).

**Authorized redirect URIs** are not required for the current Google Sign-In button (ID token) flow.

For production, add your live origin the same way, e.g. `https://app.example.com`.

## Auth flow (matches mobile `AuthProvider.registerPulseAccount`)

1. User picks a Google account → `@react-oauth/google` returns an **ID token** (JWT).
2. Web app `POST`s to `{VITE_PULSE_API_URL}/auth/google` (default `https://klaudioc.pythonanywhere.com`):
   - Headers: `Content-Type: application/json`, `Accept: application/json`
   - Body: `{ "id_token": "<google id token>" }`
3. On `200`, response `{ "token": "<pulse JWT>", "user": { "id", "email", "name?" } }`.
4. Session JSON (`pulseToken`, `user`, optional `idToken`) → `localStorage` key `@pulse/auth-session-persisted`.
5. Future API calls: `pulseAuthorizedFetch` adds `Authorization: Bearer <pulseToken>`.

No client secret in the frontend. `/account` only reads `useAuth()` — it never calls Google or `/auth/google`.

## CORS (PythonAnywhere / Flask)

If the browser shows **Failed to fetch** or a CORS error on sign-in, configure the Pulse API to allow your web origin, for example:

- `Access-Control-Allow-Origin: http://localhost:5173` (and your production domain)
- Allow `POST` on `/auth/google`
- Allow request header `Content-Type: application/json`

Without this, Google sign-in succeeds locally but `fetch` to PythonAnywhere is blocked before the server runs.

## My Agents API

The **My agents** page (`/agents`) calls the agents Flask API (default `https://claudiok.pythonanywhere.com`):

| Endpoint | Method | Body |
|----------|--------|------|
| `/get-agents` | POST | `{ "user_email": "<signed-in email>" }` |
| `/run-agent` | POST | `{ "workflow_id": "..." }` |
| `/delete-agent` | POST | `{ "workflow_id": "..." }` |

All requests send `Authorization: Bearer <pulseToken>` when signed in.

The agents API must also allow CORS from `http://localhost:5173` (and your production origin) for `POST` with `Content-Type: application/json`.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Project layout

- `src/auth/` — `AuthProvider`, session storage, `pulseClient`, Pulse `/auth/google`
- `src/components/` — `AuthRequiredModal`, `AccountMenu`, theme/language toggles
- `src/pages/` — Create agent, My agents, Account, Settings

## API helpers

```ts
import { getPulseJwt, pulseAuthorizedFetch } from "./auth/pulseClient";

const jwt = getPulseJwt();
const res = await pulseAuthorizedFetch("/some-endpoint", { method: "GET" });
```
