# BUILD-GUIDE.md: building Buzz with Claude Code, Impeccable and frontend-design

This guide takes you from an empty folder to a premium, non-generic Buzz front end. Follow it in order. Prompts you can paste into Claude Code are in `> quote blocks`.

---

## 1. What you're building (for now)

**One project, everything linked.** You'll split it into subdomains later.

| Area | Route | Register |
|---|---|---|
| Marketing site | `/` | brand |
| Logistics public | `/logistics` | brand |
| Partner portal | `/logistics/portal` | product |
| Admin console | `/admin` | product |
| Buzz Web | `/web` | product |

Front end only. All data comes from `test-data/` through a mock data layer.

---

## 2. Recommended stack

| Need | Pick | Why |
|---|---|---|
| Framework | **Next.js (latest, App Router) + TypeScript** | One codebase for brand pages and app-like screens. Static pages for SEO, client pages for the portal, admin and web. Easy to split into subdomains later using route groups. |
| Styling | **Tailwind CSS v4** with DESIGN.md tokens as CSS variables in `@theme` | Tokens in one place, so no hard-coded hex values |
| Accessible primitives | **Radix UI primitives** (Dialog, Popover, Tabs, Accordion, Toast, DropdownMenu) | Accessibility without a look. Style them yourself. **Don't install a stock component theme** (e.g. default shadcn styling): that's where the generic look comes from. |
| Motion | **Motion** (motion.dev) for React interactions + **CSS scroll-driven animations**; **GSAP ScrollTrigger** only for the complex scroll scenes (feature stage, escrow rail) | The right tool per job |
| Icons | **Lucide** (until Buzz icons arrive) | Clean stroke icons, tree-shakeable |
| QR | **qrcode.react** (generate) + **html5-qrcode** (camera scan on the tracking page) | Labels, Buzz Web pairing, scan-to-track |
| Dates | **react-day-picker** | Partner meeting booking, filters |
| Charts (admin/portal) | **Recharts**, styled with DESIGN.md tokens | Small trend lines and bars only |
| Maps | **Custom SVG** route/city diagrams for now (MapLibre later if real maps are needed) | Abstract maps protect rider privacy and stay light on data |
| Fonts | System stack (DESIGN.md §3) | Gives SF Pro on Apple. No font download. |

### Claude Code add-ons

| Tool | What it does for you | Install |
|---|---|---|
| **Impeccable** | Design context, 23 design commands, and an anti-slop detector | `npx impeccable install --providers=claude --scope=project` (or `/plugin marketplace add pbakaus/impeccable`) |
| **frontend-design** (Anthropic) | Pushes Claude toward distinctive, intentional visual choices | Find it in `/plugin`, in Anthropic's official plugin marketplace, and install it for this project |
| **Playwright MCP** | Lets Claude open the site, take screenshots and check its own work | `claude mcp add playwright -- npx @playwright/mcp@latest` |
| **Context7 MCP** | Up-to-date library docs (Next.js, Tailwind v4, Motion) so Claude doesn't use outdated APIs | `claude mcp add context7 -- npx -y @upstash/context7-mcp` |

Reload Claude Code after installing.

---

## 3. Set up the project

```bash
npx create-next-app@latest buzz --ts --tailwind --app --src-dir --eslint
cd buzz
git init   # if not already
```

Copy this kit's contents into the project root:

```
buzz/
├── CLAUDE.md          ← from this kit
├── PRODUCT.md         ← from this kit
├── DESIGN.md          ← from this kit
├── BUILD-GUIDE.md     ← this file
├── reference/         ← homepage template PNG
├── test-data/         ← JSON fixtures
└── public/images/     ← put photos from assets/photos here
```

---

## 4. Initialise Impeccable

Run:

```
/impeccable init
```

When it asks questions, answer from the files. Paste this first:

> PRODUCT.md and DESIGN.md already exist in the project root and are the source of truth. Read both fully. Only ask me about things they don't cover. Don't overwrite them. If you need to write your own context files, copy from these. Register: **brand** for `/` and `/logistics` public pages, **product** for `/logistics/portal`, `/admin` and `/web`. The deliberate exceptions in DESIGN.md §1 (system font stack for SF Pro, blue/cyan live gradients, weight-300 headlines, chat bubbles on every hero, navy footer) are intentional. Don't flag or change them.

If init generates its own DESIGN.md anyway, compare it with ours and keep ours.

---

## 5. Build order

Build the foundations once, then page by page. **Don't ask Claude to build the whole site in one go.**

### Phase A: foundations
> Read CLAUDE.md, PRODUCT.md and DESIGN.md. Set up the foundations only, no pages yet:
> 1. Tailwind v4 `@theme` with every token in DESIGN.md §2–§6 (colours, type scale, spacing, radii, shadows, easing, durations).
> 2. Global CSS: font stack, focus ring, reduced-motion rule, live-gradient utility (`.aurora`) exactly as DESIGN.md §6.3.
> 3. Shared components from DESIGN.md §8: Logo (placeholder wordmark with variants), Nav, Footer, Button, Chip, Input, Field, Code (with copy), StatusPill, Toast, EmptyState, TestDataRibbon, PhoneFrame, and the full chat bubble system from §5 (Bubble in/out/system/alert, Avatar with initials colours, Typing, Convo with staggered pop-in).
> 4. A mock data layer in `src/lib/data/` that reads `test-data/*.json` through async functions named like a future API (`getParcel(trackingId)`, `listRiders(companyId)`, …).
> 5. A `/dev/components` page showing every component in every state.
> Use Context7 for current Next.js, Tailwind v4 and Motion APIs. Then take Playwright screenshots of `/dev/components` at 1440px and 390px and fix anything off.

Then run:
```
/impeccable critique  /dev/components
/impeccable audit     /dev/components
```

### Phase B: marketing site (brand)
Build one page per prompt, in this order: Home → The App → Pro → Depot → Payments → Safety → About → Help → Contact → Waitlist → Careers → Legal.

> Use the frontend-design skill. Build **[PAGE]** exactly as specified in DESIGN.md §9.[N], using the shared components. Respect the card policy (§8.2) and the single orchestrated moment for this page. For Home, match `reference/homepage-template.png`. Use photos from `public/images` and visible `[placeholders]` where content is pending. Don't invent stats, logos or testimonials (PRODUCT.md truth rules). When done, screenshot at 1440 and 390 with Playwright, compare against the spec, and fix differences.

After each page:
```
/impeccable critique  [route]
/impeccable audit     [route]
npx impeccable detect src/app/[route]
```

### Phase C: logistics public site (brand)
Build in this order: Logistics home → How it works → Track (all states) → Coverage → Partners → Apply (guided, 7 steps) → Partner sign in.

Added 2026-11-25 (individual riders): Sign in with account type choice → Apply for both types (company 7 steps, individual rider 6 steps) → Review status page → Parcels → Batches → Individual rider portal. One screen per task.

> Build **[PAGE]** from DESIGN.md §10.1. Data comes from the mock layer (`test-data/logistics`). For Track, make every state in the spec reachable with a real test tracking ID, and list those IDs on `/dev/test-ids`. Rider privacy rules in PRODUCT.md are strict: never show a rider's name, phone or live location on public pages.

### Phase D: partner portal (product)
> Build the partner portal shell (sidebar, top bar with company code, bell, TestDataRibbon) from DESIGN.md §10.2, then each screen in table order. Use company `BZL-C-1042` (Swiftline Logistics) as the signed-in partner. Every list needs empty, loading, error and no-results states. Product register: dense, calm, 1px borders, no decorative motion.

Run `/impeccable harden` on the portal when done (edge cases, long names, overflow).

### Phase E: admin console (product)
> Build the admin console from DESIGN.md §10.3 with the navy sidebar. Use admin user `Ifeoma Okafor (super admin)`. The applications pipeline board, disputes queue with 5-day countdowns, and custom rates editor are the priority screens. Every money or destructive action needs a confirm dialog and an audit-log entry in the mock layer.

### Phase F: Buzz Web (product)
> Build Buzz Web from DESIGN.md §11 using `test-data/web/chats.json`: pairing screen with refreshing QR, then the three-pane chat layout, with order cards in chats, the priority delivery notification bell, and light/dark themes. Simulate "scan success" with a button labelled "Simulate phone scan (test)".

### Phase G: polish
```
/impeccable polish   (each area)
/impeccable adapt    (mobile pass on brand pages)
/impeccable optimize (images, bundle, Lighthouse)
```

---

## 6. The loop for every page

```
/impeccable shape [page]       → plan the UX before code (approve or adjust)
build with frontend-design     → the prompt from the phase above
Playwright screenshots          → 1440px + 390px, compare to DESIGN.md
/impeccable critique [page]    → hierarchy, clarity, feel
/impeccable audit [page]       → a11y, performance, responsive
npx impeccable detect [path]   → anti-slop scan
DESIGN.md §12 checklist        → every box ticked
```

Useful single commands when something feels off:
- Too plain → `/impeccable bolder` (it still has to obey DESIGN.md)
- Too busy → `/impeccable quieter` or `/impeccable distill`
- Type feels wrong → `/impeccable typeset`
- Spacing/rhythm off → `/impeccable layout`
- Copy feels generic → `/impeccable clarify`
- Missing empty/error states → `/impeccable harden` / `/impeccable onboard`
- Motion missing or overdone → `/impeccable animate` (one moment per page)

**When the skills disagree:** DESIGN.md wins, then PRODUCT.md, then Impeccable, then frontend-design.

---

## 7. Test data

- Lives in `test-data/` (see `test-data/README.md` for every entity and the IDs that hit each state).
- **Never** import JSON directly into components. Always go through `src/lib/data/*`, so a real backend replaces it later without touching UI.
- Product surfaces show the **Test data** ribbon.
- All phone numbers are `+234 800 000 ....` (fake) and all names are fictional.

---

## 8. Definition of done (per page)

- Matches its DESIGN.md spec (sections, moment, card policy)
- DESIGN.md §12 checklist all ticked
- `/impeccable audit` has no critical issues. `npx impeccable detect` shows only §1 exceptions.
- Looks right at 360, 390, 768, 1024, 1440 and 1920px
- Keyboard-only navigation works, focus is always visible
- Reduced motion tested
- No console errors

---

## 9. Later: splitting into subdomains

Route groups make this a move, not a rewrite: `(site)`, `(logistics)`, `(admin)`, `(web)`. Extract shared tokens and components into a package, and deploy each group as its own app at buzz.com, logistics.buzz.com, admin.buzz.com and web.buzz.com.
