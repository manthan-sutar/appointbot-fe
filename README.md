# Booklyft — Frontend

React + Vite dashboard for Booklyft.

## Stack
- React 18
- Vite
- Tailwind CSS
- shadcn/ui

## Setup

```bash
npm install
npm run dev     # dev server on http://localhost:5173
npm run build   # production build → dist/
```

### Chat and API in local dev

Vite proxies `/api` and `/chat` to **`http://localhost:3000`** (see `vite.config.js`). Run the **backend** in a second terminal or you will see **`http proxy error` … `ECONNREFUSED`** when opening `/chat/...` or calling the API:

```bash
cd ../appointbot-be && npm run dev
```

Then use the dashboard at `http://localhost:5173` — chat links resolve via the proxy to the API.

## Deploy
Recommended: **Vercel** (connect GitHub repo, zero config needed).

## API
Set the backend URL in `vite.config.js` proxy for local dev, or set `VITE_API_URL` for production.

## Implemented Product Areas
- Dashboard insights: revenue/no-show/repeat rate + lead attribution analytics.
- CRM: customer list, profile drawer/page, notes and history.
- Campaigns: create/send/schedule/template campaigns, delivery summary, failure drilldown and CSV export.
