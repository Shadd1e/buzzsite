# Buzz website (frontend only)

Static site: `index.html` is the whole thing. Pages switch by URL hash (`/#riders`).

## Deploy on Vercel
1. Push this folder to GitHub (or run `npx vercel` inside it).
2. In Vercel: Add New > Project > import it. Framework preset: **Other**. No build command, no output directory.
3. Deploy.

## Current behaviour (no database yet)
Forms, order tracking, careers and the admin view run in "preview mode": data is saved only in the visitor's own browser, and the admin password is `demo`. Nothing reaches your team yet.

## Later
`_later-backend/server.js` is the original Node server (not used by Vercel). When you are ready for a database, the site already calls `/api/submit/*`, `/api/jobs`, `/api/track` and `/api/admin/*`, so you can add Vercel functions in an `/api` folder backed by a database and the frontend will switch to live mode automatically.
