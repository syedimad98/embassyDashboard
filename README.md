# Embassy Media Report

Responsive audience-delivery dashboard organized into separate `frontend/` and `backend/` source folders. The React/Vite app is in `frontend/`; the Express API, report data, and Netlify Functions are in `backend/`.

## Run locally

```sh
npm install
npm run dev:full
```

Open the Vite URL printed in the terminal. The API runs on port 3001 and Vite proxies `/api` requests to it. If the default frontend port is already in use, Vite automatically selects the next available port.

Run the frontend alone with `npm run dev` or the API alone with `npm run server`.

## Deploy to Netlify

The Netlify build configuration publishes the Vite `dist` directory and deploys the report endpoints as Netlify Functions from `backend/netlify/functions`. Connect the Git repository to Netlify and deploy using the root `netlify.toml`; the auth, admin report, legacy report, CSV, and health routes are routed to their matching functions.

## MongoDB-backed APIs

Copy `.env.example` to `.env` and set `MONGODB_URI`, `MONGODB_DB`, and a `JWT_SECRET` with at least 32 bytes. These environment variables must also be configured for the deployed Express service or Netlify Functions. Do not commit `.env`.

Initialize the report snapshots in MongoDB with `npm run seed:reports`. This idempotently writes the campaign summary, Video OTT, day-wise, site-wise, gender-wise, and age-wise datasets to the `reportSnapshots` collection. User accounts are stored in the `users` collection; email is unique and passwords are bcrypt-hashed.

Public signup creates standard users only. After signup, an authorized operator can grant Admin access to an existing account with `npm run admin:promote -- user@example.com`. Admin report routes require `Authorization: Bearer <token>` from the login response.

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/signup` | Public; JSON `{ "email": "...", "password": "...", "registerAs": "user" }` |
| POST | `/api/auth/login` | Public; JSON `{ "email": "...", "password": "..." }` |
| GET | `/api/admin/campaign-summary` | Admin |
| GET | `/api/admin/reports/video-ott` | Admin |
| GET | `/api/admin/reports/daywise` | Admin |
| GET | `/api/admin/reports/sitewise` | Admin |
| GET | `/api/admin/reports/genderwise` | Admin |
| GET | `/api/admin/reports/agewise` | Admin |

Report endpoints accept `page`, `pageSize`, `search`, and (for day-wise and Video OTT) `date`. CSV exports are available at `/api/admin/reports/:type/export.csv`, where `type` is `summary`, `video-ott`, `daywise`, `sitewise`, `genderwise`, or `agewise`.

## API

- `GET /api/health` reports server health.
- The legacy `GET /api/reports` and `GET /api/reports/export.csv` routes remain available for the existing dashboard.

## Checks

```sh
npm run build
npm run lint
npm test
```