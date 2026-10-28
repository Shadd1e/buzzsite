# Buzz website

Public site, forms and admin view in one small project. No dependencies, Node 18+.

## Run it
```
ADMIN_PASSWORD="choose-a-long-password" node server.js
```
Open http://localhost:3000. Team login is the "Team login" link in the footer (`/#admin`).

## What is in it
- `index.html`: every page (home, features, safety, Buzz Pro, waitlist, riders, feedback, careers, about, privacy summary, admin). Pages switch by URL hash, e.g. `/#riders`.
- `server.js`: saves form submissions to `data/db.json`, serves open jobs, and protects the admin view with a password.
- Without the server (for example opened as a plain file or a preview), the site switches to preview mode: forms save in that browser only and the admin password is `demo`.
- Orders for "Track my product" are created in the admin Orders tab (the app checkout is not connected to the site yet). Lost-phone requests appear in the admin "Lost phones" tab and are reviewed by a person; nothing is suspended automatically. To automate verification and suspension, connect `POST /api/submit/suspend` to your Buzz account backend and an OTP/face-verification provider.

## Deploying
Host it anywhere that runs Node (Render, Railway, Fly.io, a VPS). Set `ADMIN_PASSWORD`, serve over HTTPS, and keep the `data/` folder on a persistent disk and back it up. Set `DATA_DIR` to change where data lives.

## Before launch
- Replace the privacy and terms summary with your lawyer-approved text.
- Replace the placeholder "B" mark when you have a logo.
- Point the waitlist copy at store links when the app is live.
# buzzsite
