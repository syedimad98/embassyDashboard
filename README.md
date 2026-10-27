# Embassy Media Report

Responsive audience-delivery dashboard organized into separate `frontend/` and `backend/` source folders. The React/Vite app is in `frontend/`; the Express API, report data, and Netlify Functions are in `backend/`.

## Run locally

```sh
npm install
npm run dev:full
```

Open the Vite URL printed in the terminal. The API runs on port 3002 and Vite proxies `/api` requests to it. If the default frontend port is already in use, Vite automatically selects the next available port.

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
| GET | `/api/ad-ops/campaigns` | Ad-ops (own campaigns); Admin (all Ad-ops campaigns) |
| POST | `/api/ad-ops/campaigns` | Ad-ops |
| PUT | `/api/ad-ops/campaigns/:id` | Ad-ops (own campaigns) |
| GET | `/api/ad-ops/campaigns/template.xlsx` | Ad-ops (download the approved Excel template) |
| POST | `/api/ad-ops/campaigns/bulk-upload` | Ad-ops (upload the approved Excel template, up to 1,000 rows) |
| GET | `/api/admin/user-access` | Admin |
| PUT | `/api/admin/user-access/:userId` | Admin |
| GET | `/api/ad-ops/clients` | Ad-ops (assigned clients); Admin (all clients) |

Report endpoints accept `page`, `pageSize`, `search`, and (for day-wise and Video OTT) `date`. CSV exports are available at `/api/admin/reports/:type/export.csv`, where `type` is `summary`, `video-ott`, `daywise`, `sitewise`, `genderwise`, or `agewise`.

## API

- `GET /api/health` reports server health.
- The legacy `GET /api/reports` and `GET /api/reports/export.csv` routes remain available for the existing dashboard.
- Ad-ops campaign data is stored separately in `adOpsCampaigns`. Admin report views can read this data; Ad-ops users can only read and update their own records.
- Ad-ops users can select a report type to enter and submit its corresponding fields. Report-specific records are stored in the same owner-scoped Ad-ops campaign API and included in CSV exports.
- Ad-ops bulk uploads use the generated `.xlsx` template only. The `Upload Data` sheet has a separate section and field headings for each report type; add rows below the headings in the matching section. Up to 1,000 rows and 5 MB are accepted per upload.
- Admins can grant Ad-ops accounts access to selected clients or all clients. Client login responses include the matching client name when the account email matches a saved client record.

## Checks

```sh
npm run build
npm run lint
npm test
```