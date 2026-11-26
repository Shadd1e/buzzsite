# Buzz Official Website — Pass 1 Audit

**Audit basis:** `Buzz_Complete_Website_Build_Brief.docx` (15 pages) and `app(1).zip` (175 archive entries; 953,551 uncompressed bytes).  
**Audit date:** 9 November 2026  
**Scope:** source inspection and architecture/content audit only. No changes were made to the supplied application source.

## Executive summary

The supplied archive is a React Native / Expo Router application source tree, not an existing public website. It contains substantial app UI and local-device workflows across messaging, Updates, communities, marketplace, housing, legal services, Buzz Pro, Showcase/Creator Tools and safety. However, many experiences are local-only, seeded, explicitly planned or not connected to a service. There is no complete logistics implementation in the archive, no public website, no partner portal, no tracking API and no supplied production website content/policy approvals.

**Recommended website architecture:** a separate, deployable static-first website project for Vercel, independent of the Expo app. Build all 27 agreed public routes. Use shared responsive navigation/footer, editorial content sections, real app imagery only when supplied, and explicit unavailable/not-yet-connected states for integrations. Keep integration contracts isolated behind server/API adapters so the website can be deployed before the services are ready.

## 1. Source project technical audit

| Area | Finding |
|---|---|
| Framework | Expo SDK 54 / React Native 0.81.5 |
| UI runtime | React 19.1.0, React Native Web 0.21.0 |
| Navigation | Expo Router 6.0.24; `package.json` entry is `expo-router/entry` |
| Language | TypeScript 5.9 |
| Persistence | AsyncStorage, primarily local-device persistence |
| Backend adapter | Small custom Supabase REST helper in `lib/supabase.ts` |
| AI integration | Matthew Edge Function client in `lib/matthew.ts`; token provider is declared but no setup call was found |
| Media | Expo Camera, Image Picker, Video, Audio, File System, Image Manipulator, Skia |
| Notifications | Expo Notifications local scheduling helper; comment says it must be wired to authenticated realtime events |
| External API usage found | Giphy API (requires optional platform-specific public API keys); Google Maps URL for sharing a location; optional Supabase Edge Function URL |
| Website source | None supplied |
| Lockfile | No `package-lock.json` in the supplied archive |
| Environment configuration | No `.env` or credentials supplied |

### Project structure

- `app/(tabs)/`: main app tabs (Chats, Calls, Communities, Updates, Me).
- `app/chat/`: conversation, contact, new-chat, QR scan and request screens.
- `app/marketplace/`: depot/catalog, products, seller, cart, service discovery and reels feed.
- `app/housing/`: property discovery and property detail.
- `app/legal/`: lawyer discovery, solicitor detail and consultation.
- `app/pro/`: Pro workspace, creator, reels, orders, bookings, analytics and payment UI.
- `app/me/`: profile, account, privacy, BuzzDrop, Pro settings and preferences.
- `app/safety/`, `app/buzz/`, `app/security/`: safety, incident and security-related UI.
- `components/`: reusable UI, chat, media, voice, Pro and theme components.
- `lib/`: local data, geo, marketplace state, persistence, Supabase and Matthew clients.
- `services/`: notification helper.

### Build integrity risks found in the archive

These are static source findings; a full Expo build was not run because the archive does not include installed dependencies or a lockfile.

1. Active source files import modules under `voice/` (`playback`, `waveform`, `config`, `recorder`, `types`, `stateMachine`) but no `voice/` directory is present in the archive.
2. `ChatWallpaper.tsx` and `MatthewAnimatedMark.tsx` / chat screens reference files under `assets/images/`, but the archive contains no `assets/` directory. The referenced doodle and Matthew image files are absent.
3. Root `App.tsx` imports `src/*` modules (`theme`, `branding`, `api`, `mock`, `storage`, `types`) that are not present. The configured Expo Router entry makes `App.tsx` non-primary at runtime, but these imports remain a project-integrity/type-check risk.
4. `components/new.tsx` contains relative imports that resolve outside the project root; confirm whether this file is obsolete or repair it before relying on a full type-check.
5. `app/status.zip` is a nested archive containing a second, older copy of 95 application files. It is not the canonical source tree and should not be unpacked over the current project without a deliberate diff.
6. `README.txt` refers to wallpaper asset paths/names that are not present in this archive; the current component references a different `buzz-chat-doodle-reference-*` naming pair. This is a source/documentation mismatch.

## 2. Application feature verification register

Status meanings: **UI/local** = interface or workflow exists, but data is stored locally or seeded; **Partial** = meaningful front-end exists but critical service behaviour is missing; **Planned/unconnected** = code explicitly describes future connection or unavailable capability; **Not found** = no implementation located in this archive. This is a source audit, not a runtime certification.

| Product area | Evidence in source | Status and website treatment |
|---|---|---|
| Main Buzz app shell | Expo Router tabs and app-level providers | UI exists. Do not claim production account/network availability from this archive alone. |
| Private messaging | Chat list, conversation screen, media, message persistence via AsyncStorage | Partial/UI-local. No realtime messaging backend found. |
| Voice notes | Recorder and voice bubble components; missing imported `voice/*` modules | Partial; source archive appears incomplete. Do not make availability claims until restored and tested. |
| Calls | Calls tab and call detail UI | UI exists; no calling provider/backend found. |
| Groups/communities | Communities tab and chat/community routes | UI exists; persistence/invitation/network behaviour requires verification. |
| Updates/status | Updates tab, camera/preview; status store explicitly local for 24 hours | UI/local. No server publication/feed backend found. |
| Buzz IDs / QR exchange | QR scan route exists; code comment says ID lookup is TODO | Partial. Scan/lookup flow not complete. |
| BuzzDrop | Settings/nearby UI; scan action says camera scanning will be connected; connect action is illustrative | Planned/partial. No proximity discovery or consent exchange service found. |
| Marketplace | Product/depot/cart/seller screens; local product arrays and local cart state | UI/local/seeded. No catalog, seller or transaction API found. |
| Property | Housing listing and detail screens backed by local directory data | UI/local/seeded. Landlord/agent/caretaker authority and verification not demonstrated. |
| Legal services | Lawyer directory, solicitor detail and consultation screens; Matthew legal mode referenced | UI/local/partial. No lawyer onboarding or booking backend found. |
| Buzz Pro | Pro mode provider, profile/capability settings and workspace routes; AsyncStorage persistence | UI/local. Correctly structured as a mode in the same app, not a separate app. |
| Showcase | Reel camera, editor, local reel store and feed | Partial/UI-local. `ReelsKit` states reels are stored on device and are not uploaded. |
| Creator Tools | Creator studio, reel editing, drafts/scheduling and product association UI | Partial. No upload/publishing service found. |
| Analytics | Reel analytics derived from device-local reels | Local-only. Explicit UI note says totals from other users' devices will appear after upload is connected. |
| Pro orders | Order screen contains hard-coded sample order records | Mock/sample UI. Do not publish sample orders or amounts as real product capability. |
| Pro bookings | Booking screen contains hard-coded example bookings | Mock/sample UI. Do not imply live booking management. |
| Pro payments | Payment destination screen says account linking is unavailable; planned label | Planned/unconnected. No payment processor integration found. |
| SunPay | Brief defines partnership; app has payment destination placeholder (labelled “Naes Payments”) | Partnership and operational role not evidenced by source. Requires confirmation; do not describe processor, custody or escrow mechanics as live. |
| Safety / Buzz Alert | Safety hub and alert/incident screens | Partial UI. No verified incident ingestion, agency coordination, response SLA or emergency dispatch service found. |
| Stealth / Security Live | Routes/screens exist | UI presence only; operational behaviour and backend unverified. |
| Notifications | Local notification scheduling helper | Partial/local. No authenticated realtime event source wired in helper. |
| Logistics | No logistics module, partner onboarding, tracking, coverage or partner dashboard found | Not found. Build as a new website section with integration dependencies explicitly marked. |
| Authentication/account recovery | Registration/welcome screens exist; profile stored locally; no auth provider wiring found | Partial. No working server authentication or recovery flow evidenced. |
| Backend | Generic Supabase REST adapter exists, but no use of `supabaseTable()` was found in the inspected source; no environment values supplied | Adapter only / unconnected. |
| Matthew assistant | Edge Function client exists; no token-provider registration call found | Unverified/unconnected in this source snapshot. |

## 3. Assets and visual reference inventory

### Supplied

- `Buzz_Complete_Website_Build_Brief.docx` — 15-page primary brief.
- `app(1).zip` — Expo application source archive.
- Nested `app/status.zip` — duplicate/older app snapshot inside the main archive.

### Not supplied / not found in the app ZIP

- No separate design-reference screenshots were attached in this conversation.
- No logo, wordmark, app icon or logo variants.
- No app screenshots or screen recordings.
- No image, video or illustration asset folder.
- No font files or confirmed brand font specification.
- No official app store URLs, website domain, social links or official download destinations.

### Referenced but missing from source

- `assets/images/matthew-icon.png`
- `assets/images/buzz-chat-doodle-reference-dark.png`
- `assets/images/buzz-chat-doodle-reference-light.png`

The README also references alternate doodle wallpaper names that are absent. The website should not reuse invented product screenshots. Until real app screenshots arrive, use editorial photography and clearly labelled illustrative device frames only where no fabricated UI is implied.

### Visual direction to implement from the brief

Editorial and image-led; substantial whitespace; restrained typography; alternating image/text sections; purposeful asymmetry; white/soft-neutral canvas; midnight navy `#0B1D42`; premium blue `#155EEF`; royal blue `#3978D8`; ice blue `#EAF1FF`; soft neutral `#F5F7FA`. African identity must be visible throughout through contemporary African founders, professionals, sellers, creators, customers, homes, offices, shops, studios, delivery operations and urban environments. Avoid stereotypes, safari motifs, poverty-coded imagery, generic AI-looking layouts, repetitive card grids and fabricated Buzz UI.

## 4. Complete public website route inventory

All 27 routes below are in the agreed scope. None exists in the supplied source as a public website route; all are to be built in the separate website project.

### Core public website

| Route | Page | Required content |
|---|---|---|
| `/` | Homepage | Exact headline, concise positioning, waitlist/explore CTAs, connected experience, communication, marketplace, Pro/Showcase/Creator Tools, payments/logistics, safety and final CTA. |
| `/app` | The Buzz App | Messaging, media/voice notes, groups, Buzz IDs, QR exchange, BuzzDrop, Updates, privacy/account controls, real screenshots and download CTA. |
| `/buzz-pro` | Buzz Pro | Optional mode in same app, business profiles, products/services, customer communication, implemented orders/bookings only, Showcase, Creator Tools and verified analytics. |
| `/marketplace` | Marketplace | Products, property, services, merchants/professionals, location/price discovery, listing details, seller connection and property roles. |
| `/payments` | Payments | Buzz–SunPay relationship and only verified payment/escrow roles, methods, currencies, custody, release and disputes. |
| `/safety` | Safety | Buzz Alert, Security Updates, location alerts, incident reporting/evidence and only verified community/agency workflows. |
| `/about` | About | Origin, problem, mission, vision, values, company profile and African expansion ambition clearly labelled as ambition. |
| `/careers` | Careers | Company/culture, open roles, job details, application route and talent contact. |
| `/contact` | Contact | General, support, business/partnership, logistics, media and careers routing. |
| `/waitlist` | Waitlist | Value proposition, registration, consent/privacy note, validation, honest success/error states and destination dependency. |

### Buzz Logistics

| Route | Page | Required content |
|---|---|---|
| `/logistics` | Buzz Logistics | Goods purchased through Buzz only, independent provider network, verified delivery scope, process, tracking and partner CTAs. |
| `/logistics/how-it-works` | How it works | Purchase in Buzz, delivery arrangement, provider assignment, pickup, transit, tracking and completion; avoid unsupported automation claims. |
| `/track-my-package` | Track My Package | Reference validation, package/provider/origin/destination details, real status timeline, last update, ETA only if supplied by API, support and empty/error states. |
| `/logistics/coverage` | Coverage | Intrastate/interstate/international explanation and only confirmed locations/countries. |
| `/logistics/partners` | Partner network | Proposition, eligibility, requirements, assessment/approval, service categories, expectations and API/system integration enquiry. |
| `/logistics/partners/apply` | Partner application | Nine-step application: Legal, Business, Services, Coverage, Capacity, Experience, Systems, Additional, Review. |
| `/logistics/partner-login` | Partner login | Secure login, recovery/support states; must be backed by authentication. |
| `/logistics/partner-dashboard` | Partner dashboard | Protected view for open deliveries, reference codes, package timeline, employee list and integration status; no fabricated records. |

### Help Centre and legal

| Route | Page | Required content |
|---|---|---|
| `/help` | Help Centre | Searchable categories, full FAQ inventory, accordion/detail interaction, related topics and contact route. |
| `/privacy-policy` | Privacy Policy | Approved collection, use, sharing, retention and user rights. |
| `/terms` | Terms | Terms consistent with actual product and platform responsibilities. |
| `/community-guidelines` | Community Guidelines | Content, conduct, reporting, moderation and enforcement matching real policy. |
| `/safety-guidelines` | Safety Guidelines | Safety limitations, reporting guidance and emergency-services disclaimer. |
| `/marketplace-terms` | Marketplace Terms | Buyer/seller/listing responsibilities, prohibited goods, transaction boundaries and disputes. |
| `/logistics-terms` | Logistics Terms | Buzz/provider responsibilities, delivery scope, prohibited goods, loss/damage/claims, customs, fees and exceptions. |
| `/payment-terms` | Payment Terms | SunPay relationship, processor/custody roles, escrow conditions, releases, refunds and disputes. |
| `/cookie-policy` | Cookie Policy | Actual cookies, analytics and consent practices. |

**Route total: 27.** The careers page should support role detail/application states even if individual roles are managed as data rather than separate fixed sitemap routes.

## 5. Website interaction and integration architecture

| Feature | Front-end deliverable | External dependency / truth boundary |
|---|---|---|
| Waitlist | Validated form, consent, pending/success/error states | Approved endpoint, CRM/database, privacy wording and notification destination. Never show success before server acceptance. |
| Contact | Categorised enquiry form and validation | Email/CRM/API routing destination. |
| Partner application | Nine-step progress, field validation, review, upload controls only if approved | Secure backend storage, document policy, notification and assessment workflow. No local-only submission presented as received. |
| Tracking | Reference input, loading, empty, invalid, error and result timeline | Live logistics API, reference validation, status mapping, timestamp/location/ETA fields. No demo tracking record. |
| Partner login | Login, recovery and access-denied screens | Auth provider, user provisioning, MFA/session policy and recovery service. |
| Partner dashboard | Protected route and data views | Auth, role/tenant authorization, deliveries, staff, status feed and partner integration. |
| Help Centre | Client-side search, categories, accordion, related articles | Approved answers and legal/policy owner sign-off; CMS optional. |
| Analytics | Consent-aware event hooks | Selected analytics provider, event plan and privacy configuration. |
| Downloads | Platform-specific links and fallback | Official iOS/Android store URLs and availability. |
| SEO | Metadata, canonical URLs, sitemap, robots, Open Graph, structured data | Final domain and approved brand/social metadata. |

## 6. Missing dependencies and approvals

### Required to connect production functionality

1. Waitlist endpoint/database/CRM and destination owner.
2. Contact/support email or CRM routing and enquiry ownership.
3. Logistics API documentation: tracking lookup, status schema, ETA semantics, provider data, coverage data, errors and support escalation.
4. Partner application backend, secure document storage requirements, review/approval process, notification destination and data retention policy.
5. Partner authentication, account provisioning, recovery and role/tenant authorization.
6. Partner dashboard data contracts for deliveries, employees and integration state.
7. SunPay partnership confirmation and approved description of payment processing, custody, escrow, releases, refunds and disputes.
8. Legal/policy approvals for privacy, terms, cookies, community, safety, marketplace, logistics and payment terms.
9. Approved coverage locations, delivery categories, prohibited-goods rules, provider responsibilities, insurance/claims and customs policy.
10. Official store URLs, website domain, social URLs and final CTA destinations.

### Brand/content assets needed

- Official logo/wordmark in SVG and PNG, including icon/mono/reversed variants.
- Final brand palette and font files or approved font names.
- Reference screenshots mentioned by the brief (not attached separately here).
- Current app screenshots or recordings for Me, Showcase, Buzz Pro, Creator Tools, Marketplace, Safety, SunPay/payment and Logistics.
- Partner dashboard/tracking/admin screenshots if they exist.
- Image rights/licensing or approval to commission/select editorial photography.

### Can proceed without blocking the website build

- Build static public pages, responsive layouts, route navigation and SEO scaffolding.
- Implement front-end form validation and honest disconnected states.
- Build tracking UI without fake results; display a clear not-connected state until API exists.
- Build partner login/dashboard shells behind an access gate, without claiming authentication works.
- Build FAQ search/accordion using conservative answers, with unverified questions marked for approval or withheld.
- Use typographic temporary Buzz branding until official logo arrives; replace centrally once supplied.

## 7. Content safeguards

- Do not say Buzz is completely private or 100% secure.
- Do not promise rescue, emergency response, incident verification or law-enforcement response.
- Do not imply every seller/property listing is verified.
- Do not describe SunPay as Buzz-owned infrastructure or assert unconfirmed escrow mechanics.
- Do not claim logistics coverage, insurance, provider selection automation, delivery guarantees or tracking availability without evidence.
- Do not claim Showcase reach, moderation, publishing or cross-device analytics are operational while the current reel store is local-only.
- Do not publish hard-coded example order/booking/customer data as actual Buzz records.
- Treat Liberia/West Africa expansion as ambition/discussion, not live market coverage.
- Distinguish ordinary social Updates from Security Updates.

## 8. Implementation sequence

1. **Pass 1 — Audit, content and architecture (this delivery):** source audit, verification register, route matrix, asset inventory, dependency list and implementation architecture.
2. **Pass 2 — Design system + homepage:** establish typography, palette, navigation/footer, responsive foundation and editorial homepage. Use authentic contemporary African photography; do not fabricate app UI. Lock approved design.
3. **Pass 3 — Product pages:** `/app`, `/buzz-pro`, `/marketplace`, `/payments`, `/safety`; cross-link contextual FAQs and preserve approved Pass 2 components.
4. **Pass 4 — Logistics:** all eight logistics routes, nine-step partner application, tracking UI and protected portal shells; keep backend-dependent states honest.
5. **Pass 5 — Company/support/legal:** About, Careers, Contact, Waitlist, Help Centre and all policy pages. Legal pages remain clearly marked draft until approved.
6. **Pass 6 — Integrations + QA:** connect available endpoints, test responsive layouts, route integrity, forms, auth gates, tracking, accessibility, SEO, performance and Vercel deployment. Deliver full final ZIP and QA report.

## 9. Pass 1 acceptance and handoff

- Complete source and asset inventory recorded.
- All 27 agreed website routes accounted for.
- Feature claims separated by UI/local, partial, planned/unconnected and not found.
- Missing service dependencies and approvals listed.
- No changes made to the supplied mobile app source.
- Website project implementation begins in Pass 2 as a separate project; this pass intentionally contains audit/architecture documents, not a premature homepage redesign.
