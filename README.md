# Embassy Media Report

Responsive audience-delivery dashboard with a React/Vite frontend and an Express API. Report data is currently held in `server/reportData.js` and matches the sample values shown in the supplied reference.

## Run locally

```sh
npm install
npm run dev:full
```

Open the Vite URL printed in the terminal. The API runs on port 3001 and Vite proxies `/api` requests to it. If the default frontend port is already in use, Vite automatically selects the next available port.

Run the frontend alone with `npm run dev` or the API alone with `npm run server`.

## Deploy to Netlify

The Netlify build configuration publishes the Vite `dist` directory and deploys the report endpoints as Netlify Functions. Connect the Git repository to Netlify and deploy using the included `netlify.toml`; `/api/reports`, `/api/reports/export.csv`, and `/api/health` are routed to their matching functions.

## API

- `GET /api/health` reports server health.
- `GET /api/reports` returns report rows, summary totals, and filter options. Optional query parameters: `campaign`, `geo`, `status`, and `search`.
- `GET /api/reports/export.csv` downloads the rows matching those same filters.

## Checks

```sh
npm run build
npm run lint
```