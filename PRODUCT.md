# PRODUCT.md: Buzz

> Context file for `/impeccable init` and every later Impeccable command. Read this before designing or writing any copy. The visual system is in `DESIGN.md`.

<!-- impeccable:product-schema 1 -->

## Platform

web

## What Buzz is

Buzz is a Nigerian super app made by **Aether Jade Innovation**. Tagline: **"One HUB that plugs you to everything."** One app brings together:

| Feature | What it does (plain words) |
|---|---|
| **Chats** | One-to-one and group chats, voice notes, photos, video, stickers, GIFs. End-to-end encrypted. |
| **Buzz ID** | A handle (e.g. `@adaeze.buzz`) people share instead of their phone number. |
| **BuzzDrop** | Swap contacts in person by scanning a code. Neither side sees the other's phone number. |
| **Status / Updates** | Posts that disappear after 24 hours. **Security updates** sit in their own row in a distinct colour. |
| **Depot** | Marketplace: merchants sell products, landlords list houses, handymen offer services. Search by location, price, category. Prices can show in local currency. |
| **SunPay escrow** | Payments are held until the buyer confirms, or released automatically after **5 days** unless a dispute is opened. |
| **Pro Mode** | A switch inside Buzz. It gives a business a **Storefront**, a separate **Pro ID**, a **Business Centre** and **Showcase / Creator Toolbox**. Features differ by profession (lawyer, landlord, merchant, handyman…). Pro can be paused or switched off. |
| **Buzz Alerts** | Safety alerts from verified police and security agencies and from real users. Location-based, opt-in, push. |
| **Buzz Logistics** | Delivery for goods bought on Depot (Depot-only at launch, built to expand later). Run by partner logistics companies. |
| **Buzz Web** | Use Buzz chats on a computer by scanning a QR code with your phone. |

App views: **Lite** and **Creator** (Pro). The **Me** tab shows the person's own things. Orders appear at its top, and so does the **rider view** for registered riders.

## Positioning

No single claim leads. Three claims carry equal weight, and the story is that one app holds all three ("One HUB that plugs you to everything"):

1. **Number-free identity.** Buzz ID, BuzzDrop and Pro ID let you deal with people, buyers and sellers without giving out your phone number.
2. **Chat to checkout in one place.** The chat where people already talk is where they find things on Depot, pay through SunPay escrow and track delivery through Buzz Logistics.
3. **A trust layer for dealing with strangers.** Escrow, verified sellers and logistics partners, and Buzz Alerts from verified agencies.

Neighbouring products each hold one piece (WhatsApp has chat, Jiji and Jumia have listings, Instagram shops have discovery). None of them truthfully offers all three together. Surfaces should present the three as one connected system, not as a list of separate features.

## Surfaces (all in one project for now, separated into subdomains later)

| Area | Route prefix | Future home | Register |
|---|---|---|---|
| Marketing site | `/` | buzz.com | **Brand** |
| Logistics public site | `/logistics` | logistics.buzz.com | **Brand** (lighter) |
| Logistics portal (partners and individual riders) | `/logistics/portal` | logistics.buzz.com/portal | **Product** |
| Buzz admin console | `/admin` | admin.buzz.com (internal) | **Product** |
| Buzz Web (chat) | `/web` | web.buzz.com | **Product** |

Everything is **front end only** right now. Data comes from `/test-data` through a mock data layer that a real backend replaces later. The Next.js app lives at the repo root (`src/`, `public/`) and deploys to Vercel as a Next.js project. The earlier static HTML/JS review build was removed on 2026-11-20.

## Audience

- **Everyday Nigerians**, mostly on **Android phones**, often on slow or metered data. Ages 18–45. Comfortable with WhatsApp, Instagram and TikTok.
- **Sellers, landlords, handymen and professionals** who want customers without giving out their personal number.
- **Logistics companies** (domestic and international within Africa) that want Depot delivery volume.
- **Individual riders** who own a vehicle and want to deliver Depot orders on their own, without a company.
- **Buzz staff** (support, finance, partner managers) using the admin console.
- **Potential partners, investors and press**, who visit to understand who Buzz is.

## Operating Context

- **Consumers** reach the marketing site mostly on Android phones, often on slow or metered mobile data. They already know WhatsApp, Instagram and TikTok. The app isn't in the stores yet, so their only action is to join the waitlist.
- **Buyers tracking a parcel** use the logistics public site without the app. They come with a tracking ID, or scan a QR code with the camera.
- **Logistics partners** use the portal to onboard (a guided flow ending in a booked virtual meeting), register riders, print thermal QR labels, follow batches (mother QR) and track payouts. Their riders scan in the Buzz app, not on the website.
- **Individual riders** apply on the website, pass a vehicle inspection, then scan in the Buzz app. They use the portal on their phone or a computer to see their deliveries, batches, rates and payouts. The phone view is the main view for them; the computer view shows more detail.
- **Buzz staff** (support, finance, partner managers) use the admin console to approve partners, settle disputes and act on audit flags.
- **Buzz Web users** pair a computer by scanning a QR code with their phone, then chat on a larger screen.
- **Partners, investors and press** visit to understand who Buzz is.

## The job each surface does

- **Marketing site:** explain Buzz in under a minute, earn trust, get people onto the waitlist.
- **Logistics public:** let anyone track a parcel without the app, and show partners how to join.
- **Logistics portal:** let a logistics company manage riders, parcels, batches, rates and payouts quickly, and let an individual rider see their own deliveries, batches, rates and payouts.
- **Admin console:** let Buzz staff approve partners, resolve disputes and watch for problems.
- **Buzz Web:** chat on a computer like on the phone, with delivery updates surfacing as priority.

## Voice

- **Plain, warm, direct.** Short sentences. Active voice. Sentence case everywhere.
- **Nigerian, not stereotyped.** No Pidgin anywhere, chat bubbles included. Bubbles sound like real people texting in everyday English ("Hi, is it still available?"), with Nigerian names, places and context.
- **Describe, don't sell.** "SunPay holds the money until you confirm" beats "Revolutionary secure payments."
- Buttons say exactly what happens: "Join the waitlist", "Track parcel", "Add rider", "Deactivate rider". The confirmation reuses the verb ("Rider deactivated").
- Errors explain what happened and what to do next. No apologies, no vagueness.

## Truth rules (non-negotiable)

1. **No invented numbers.** No user counts, ratings, percentages or "trusted by" claims unless provided. Use a visible `[placeholder]`.
2. **No fake proof.** Don't present stock photos as customers. No invented testimonials and no fake app-store badges with ratings. The app isn't in the stores yet, so the CTA is **"Join the waitlist"**.
3. **No unconfirmed partner logos.** Paystack and others appear only once confirmed. Until then, use dashed placeholder slots.
4. **No claims about unbuilt features.** Example: don't say red alerts "ring on silent" until it's confirmed as built.
5. **Never position Buzz against the government.** Safety copy is cooperative: Buzz works *with* verified agencies. (The "Big Brother isn't watching" line was removed for this reason.)
6. Buzz is **not an emergency service**. Safety pages say "In an emergency, call 112."
7. Legal pages are **drafts pending legal review** and must show a draft banner.
8. **Test data must look like test data** in product surfaces: a visible "Test data" ribbon, and obviously fake phone numbers (`+234 800 000 ….`).

## Evidence on Hand

- **Real Buzz app designs exist** (screenshots or design frames of the actual app) and may be shown. They are **not in this repo yet**. Ask Aether Jade for them and record their path here when they arrive. Until then, app screens are original HTML/CSS mockups and must be labelled illustrative.
- **Editorial stock photos** (Pexels, mostly Lagos) are listed in `assets/IMAGE-CREDITS.md`, and processed files are in `assets/photos/`. They set the scene only. They don't show Buzz customers, staff, sellers or partners, and they aren't evidence of operations or coverage. Files marked `PREVIEW-ONLY` are not cleared for production. Check the licence before launch.
- **Fixtures:** `test-data/` (logistics, web) feeds the mock data layer. It is test data and must look like it.
- **Absent. Do not fabricate:** final logo or wordmark files (only `favicon.svg` exists), confirmed partner names or logos, a public launch date or launch region, user or waitlist counts, ratings, testimonials, press coverage and app-store listings. Show each as a visible `[placeholder]`.

## Product Principles

1. **One hub, not a feature list.** Identity, chat-to-checkout and trust are explained as one connected system. No surface pushes one at the expense of the others.
2. **Your number stays yours.** Privacy is the default everywhere: Buzz IDs instead of phone numbers, partners see only what delivery needs, and public tracking never shows a rider.
3. **Truth before polish.** A visible placeholder is better than a convincing invention. Claims go no further than what is confirmed and built.
4. **Light enough for metered data.** Every surface must be fast and cheap to load on a mid-range Android over a slow connection.
5. **Safety that cooperates.** Buzz works with verified agencies, never against the government, and never presents itself as an emergency service.

## Accessibility & Inclusion

- **WCAG 2.2 AA** on every surface: contrast, full keyboard use, screen-reader labels, visible focus and `prefers-reduced-motion` respected.
- **Data budget:** pages must work well on mid-range Android over 3G. Use system fonts, small and properly sized images, and no heavy assets on the critical path.
- Interface copy is clear English that's easy to read for second-language readers. Chat-bubble examples use plain English too (no Pidgin).

## Anti-references (what Buzz must NOT look like)

- Generic SaaS landing pages: gradient hero + three icon cards + logo wall + pricing table.
- Crypto/fintech dark mode with neon accents.
- Cream backgrounds with serif headlines and terracotta accents (the common AI default).
- Template chrome: ALL-CAPS eyebrow labels above every heading, `01 / 02 / 03` numbering on content that isn't a sequence, `→` stuck on every link.
- Card soup: every paragraph in a rounded box with the same grey shadow.
- Purple gradients, bounce/elastic easing, glowing dark UI.

## References (what Buzz SHOULD feel like)

- **The Buzz app itself:** blue, muted whites and dark navy, the liquid-glass tab bar, animated bottom navigation, smooth scroll and slide motion, stickers and personality, and "simplistic is key" (Jade).
- **The homepage template** in `reference/homepage-template.png`: big light headlines, inset rounded hero photo, full-bleed photo bands, the blue band, dark rounded footer.
- How TikTok's create screen keeps many options light by arranging them well. Borrow the principle, not the look.

## Key terminology (use exactly)

Buzz, Buzz ID, BuzzDrop, Depot (not "shop"), Pro Mode, Pro ID, Storefront, Business Centre, Showcase, Creator Toolbox, SunPay, escrow, Buzz Alert, security update, Buzz Logistics, logistics partner, individual rider, rider, company code, rider code, individual rider code, tracking ID, pickup code, delivery code, mother QR (batch), Buzz Web, Lite view, Creator view, Me tab.

## Logistics rules (confirmed)

- **Depot-only at launch.** Coverage: intrastate, interstate, international (Africa).
- **Three ways to sign in on the website.** Riders come first: a **rider with a partner company** signs in with **company code + rider code**; an **individual rider** signs in with **rider code + password**, or with their **Buzz ID** (Buzz sends a request to the Buzz app and they confirm it there). **Partner sign in** (company staff: email + password + 2FA) sits lower on the page. Never describe a partner as "running hubs": a partner is a registered logistics company, and a company rider is affiliated with one.
- **Partner onboarding:** a guided flow, one step at a time, each step explained: company details plus confirmation they're registered and verified → download documents, sign, upload → more details (coverage, capacity, services) → **pick a date for a virtual meeting**. Then a **physical inspection** of offices, hubs and fleet with a **score** → approval → the partner receives a **company code**.
- **Individual rider onboarding:** the same guided style: personal details and ID → vehicle details and papers (the rider chooses which papers to upload; no fixed list) → documents (download, sign, upload) → own per-km rate → **pick a date for a vehicle inspection**. Then the inspection with a **score** → approval → the rider receives an **individual rider code**. An individual rider works like a one-person partner: own rates, paid directly after each delivery, Buzz takes its percentage.
- **Pending review:** every new account (company or individual) stays **pending** until the physical inspection passes. While pending, signing in shows only a **review status page**: documents received, inspection booked (date, reschedule), inspection passed, account live. The full dashboard opens after approval. Nothing pending can scan or take parcels.
- **Riders:** partners register their own riders on the website and set their own verification steps. Buzz only requires the company to confirm each rider is verified. Each rider gets a **rider code**. Riders scan **in the Buzz app** (a "Logistics partners" entry at the bottom of the menu) and can also sign in on the website (above) to see their deliveries, batches and earnings. Company riders sign in with the **company code + rider code** their company gives them, and can't self-register: anyone who tries to sign up as a rider with a company is told to ask their company to register them. Individual riders apply through their own flow above, and are given their own **individual rider code and password**; they can also sign in with their **Buzz ID**. A company rider whose company hasn't finished verifying them, or who was deactivated, can't sign in and is told to contact their company. After sign-in, a **rider view** appears at the top of their Me tab and a **scanner icon** on their main screen. Partners can **deactivate** riders, and history is kept.
- **Parcel flow:** Depot order ID → partner enters the ID at pickup, which generates a QR label (thermal sticker) → pickup scan (GPS, "In transit") → checkpoint scans → **mother QR batching** → buyer chooses **home delivery or pickup** → proof of delivery.
- **Mother QR (parent and child):** every parcel keeps its own tracking ID. When a rider scans a second parcel while one is already in hand, Buzz creates a **new mother code** and links both; every parcel scanned after that joins the same mother. Scanning the mother updates every linked child. The rider **removes (unlinks) each child** in the app when it's delivered or dropped at its stop (→ "Available for pickup"). A mother with no children left closes. Batches change **only in the rider's app**; the website shows them read-only, with a full history of every link and unlink (who, when, where).
- **History:** the portal keeps a detailed history of every parcel, batched or not: each scan, link, unlink, status change and location, with time and device. Goods in transit show their last known location, status and the batch they're in.
- **Codes:** home delivery needs a **4-digit delivery code** from the buyer. For pickup by someone else, the buyer enters that person's name, which **generates a new one-time pickup code**. The name shown must match the person collecting, and the hub checks ID. Only the latest code works, and it expires with the storage window.
- **Failed delivery:** up to 2 attempts, each with a reason → buyer gets options (reschedule, change address, switch to pickup) → then nearest pickup point.
- **Pickup storage:** free for 5 days (reminders on day 1, 3, 5) → partner-set daily fee → return to seller after 10 days.
- **Refused parcel:** photo + reason → returned to seller. Buyer has 5 days to dispute, otherwise refunded minus delivery cost.
- **Money:** partners are paid immediately. Buzz's percentage settles immediately or at T+2. Base rate is a partner-set per-km price plus Buzz 3%, adjustable per partner deal. Damage is covered by Buzz only when the fault is proven to be Buzz's. Otherwise the partner handles it. Claims are filed using order, tracking or pickup codes.
- **Privacy:** partners see only the receiver's name, preferred contact (Buzz or phone) and a verification question. The public tracking page shows status, last scan city and time, and partner name, **never** a rider's name, phone or live location.
- **Audit and flags:** every scan logs who, company, GPS, time and device. Flags: off-route scan, scan by another company's rider, no scan for 48h while in transit, delivered without delivery code, manual ID entry.
- **Calls:** the portal's call button appears only at the final delivery step. Everything else goes to customer care (shared with Depot).
- **Later:** offline scanning, international customs, SMS updates, prohibited items list.
