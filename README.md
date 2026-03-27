# AppointBot — Frontend

React + Vite dashboard for AppointBot.

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

## Deploy
Recommended: **Vercel** (connect GitHub repo, zero config needed).

## API
Set the backend URL in `vite.config.js` proxy for local dev, or set `VITE_API_URL` for production.

## Implemented Product Areas
- Dashboard insights: revenue/no-show/repeat rate + lead attribution analytics.
- CRM: customer list, profile drawer/page, notes and history.
- Campaigns: create/send/schedule/template campaigns, delivery summary, failure drilldown and CSV export.
