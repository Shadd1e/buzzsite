# Buzz Website — Dependencies and Decisions Register

## Production integrations

| Dependency | Needed for | Current status |
|---|---|---|
| Waitlist endpoint + CRM/database | Waitlist registration | Not supplied |
| Contact/support routing | Contact forms | Not supplied |
| Logistics tracking API | Package lookup and timeline | Not supplied |
| Logistics coverage data | Coverage page and lookup | Not supplied |
| Partner application backend | Nine-step submission, files, review | Not supplied |
| Partner authentication | Partner login, recovery, sessions | Not supplied |
| Partner authorization/data APIs | Dashboard, staff and deliveries | Not supplied |
| SunPay approved integration/role statement | Payments and payment terms | Not supplied; confirm legal/commercial relationship |
| Approved policy texts | Privacy, terms, cookies, safety, community, marketplace, logistics and payment terms | Not supplied |
| Analytics provider and consent requirements | Conversion/event measurement | Not supplied |
| Official app store URLs | Download CTAs | Not supplied |
| Domain and social URLs | SEO, canonical URLs and footer | Not supplied |

## Brand and media

- Official logo/wordmark and variants: missing.
- Brand fonts: missing/unconfirmed.
- Separate design reference screenshots: not attached in this conversation.
- Real Buzz app screenshots/screen recordings: missing.
- Logistics/partner dashboard screenshots: missing.
- Photography licensing/commissioning approvals: missing.

## Application ZIP integrity dependencies (separate from website integrations)

- Missing `voice/` modules imported by current source.
- Missing `assets/images/matthew-icon.png` and chat doodle wallpaper images referenced by source.
- Root `App.tsx` imports absent `src/*` files (not the configured Expo Router entry, but a static project integrity issue).
- `components/new.tsx` has relative imports that resolve outside the project root; confirm obsolete status or repair.
- No npm lockfile or installed dependency tree in supplied archive.
- Nested `app/status.zip` is a duplicate/older snapshot; avoid overlaying it onto the current source.

## Decisions that do not block Pass 2

1. Use a separate website project rather than modifying the Expo app.
2. Use the brief's palette as working tokens until official brand assets confirm final values.
3. Use an editable text-based Buzz wordmark placeholder until the official logo is supplied.
4. Use licensed/commissioned contemporary African editorial photography; do not present generated or stock device UI as real Buzz screens.
5. Build UI states for unavailable integrations, but never show false success, tracking records, payment states, authentication or analytics.
6. Keep legal content in draft status pending review by the appropriate policy/legal owner.
