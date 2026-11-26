# DESIGN.md: Buzz design system and page specs

> Source of truth for how every Buzz surface looks, moves and reads. Product facts, voice and truth rules are in `PRODUCT.md`. How to build with Impeccable and the frontend-design skill is in `BUILD-GUIDE.md`.
>
> **If a generic best practice or a skill's default disagrees with this file, this file wins.** Section 1 lists deliberate decisions that tools may flag. Keep them.

---

## The idea in one paragraph (§0)

Buzz is a chat app first, so **the chat bubble is the signature of every surface**. Each marketing page opens with a short, real-sounding conversation that frames what the page is about. Product surfaces (portal, admin, web) use the same bubbles for timelines, notifications and evidence. Everything around the bubbles stays quiet and disciplined: large light headlines, generous white space, Buzz blue, real photography and one orchestrated motion moment per page. Live gradients drift slowly behind plain brand sections, like the app's liquid-glass feel. Premium here means **restraint plus craft**, not decoration.

---

## Deliberate decisions (do not "fix" these) (§1)

| Decision | Why | Tools may flag it as |
|---|---|---|
| **System font stack** that renders **SF Pro** on Apple devices and Roboto on Android | The co-founder asked for SF Pro, and the app uses native fonts. Apple's licence doesn't allow hosting SF Pro as a web font for every platform, so the system stack is the legitimate way to get it. | "Overused / system default font" |
| **Live gradient backgrounds** on brand sections | Explicitly requested ("subtle, like the Gemini gradient"). Blue and cyan only, never purple. | "Gradient wash as decoration" |
| **Light-weight (300) large headlines** | Matches the homepage template and the app's airy feel | "Weak hierarchy". Hierarchy comes from size and space. |
| **Chat bubbles on every marketing page hero** | The brand signature. It ties the site to the app. | "Repetitive pattern". Vary the conversation, never drop it. |
| **Navy footer `#080C15`** | From the homepage template. It's a tinted navy, not black. | "Near-black" |

Everything else follows Impeccable's and the frontend-design skill's anti-slop rules (section 12).

---

## Color (§2)

### Core tokens (§2.1)

```css
:root {
  /* Brand blues */
  --blue-600: #096DF9;   /* primary: buttons, links, outgoing bubbles, logo */
  --blue-700: #0050C8;   /* hover/pressed */
  --blue-500: #487DF0;   /* the blue band */
  --sky-400:  #38B6FF;   /* hero CTA on photos, focus ring */
  --blue-100: #DCE8FF;   /* selected rows, quiet fills */
  --blue-50:  #E9F1FF;   /* tinted panels, convo backgrounds */

  /* Ink (tinted toward blue, never pure black or grey) */
  --ink-900: #0E1526;    /* headings, primary text */
  --ink-700: #3A4256;    /* body text */
  --ink-500: #5A6378;    /* meta, captions (passes 4.5:1 on white) */
  --ink-300: #9AA6C2;    /* text on navy only */
  --line:    #DDE3EE;    /* dividers, input borders use #CBD3E1 */
  --mist:    #F4F6FA;    /* quiet section background */
  --white:   #FFFFFF;
  --navy:    #080C15;    /* footer, Pro hero, dark surfaces */
  --navy-800:#121A2E;    /* cards on navy */
  --navy-700:#26304A;    /* borders on navy */

  /* Signals: used ONLY for their meaning */
  --alert-600: #D92D20;  /* Buzz Alerts, security updates, destructive */
  --alert-700: #B42318;  /* alert text on light */
  --alert-50:  #FFF1EF;
  --ok-600:    #12B76A;  /* delivered, verified, success */
  --ok-50:     #ECFDF3;
  --tick:      #7CF5A8;  /* read ticks on blue bubbles */
  --warn-700:  #7A4B00;  /* draft banners, pending states */
  --warn-50:   #FFF6E5;
}
```

### Rules (§2.2)

- **Blue carries the brand. Red means safety or danger, nothing else.** Green means done or verified, nothing else. Never use red or green for decoration.
- Signal colours must also differ in **lightness and icon**, not just hue (colour-blind users).
- Text contrast: 4.5:1 minimum, including 11–13px meta text. White text on `--blue-600` passes. On `--sky-400`, use `--ink-900` text.
- No grey text on coloured backgrounds. On blue, use white at 85%+ opacity. On navy, use `--ink-300` or white.
- **Dark theme** (Buzz Web only, at launch): background `#0B1220`, surface `#121A2E`, raised `#1A2440`, text `#E7ECF6`, meta `#9AA6C2`, outgoing bubble stays `--blue-600`, incoming bubble `#1E2A47`.

---

## Typography (§3)

### Family (§3.1)

```css
--font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
        "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-num: same, with font-variant-numeric: tabular-nums for tables, prices and codes.
```

One family. Personality comes from **weight contrast** (300 headlines against 500–600 UI), **tight tracking on large sizes**, and scale.

### Brand scale (marketing and logistics public) (§3.2)

| Token | Size (desktop → mobile) | Line height | Weight | Tracking |
|---|---|---|---|---|
| display | 76 → 44px (`clamp(44px,5.6vw,76px)`) | 1.02 | 300 | -0.035em |
| h1 | 60 → 40px | 1.05 | 300 | -0.03em |
| h2 | 52 → 34px | 1.06 | 300 | -0.03em |
| h3 | 22px | 1.25 | 500 | -0.01em |
| lede | 19px | 1.55 | 400 | 0 |
| body | 16–17px | 1.6 | 400 | 0 |
| small | 13px | 1.5 | 400 | 0 |
| micro | 11px | 1.3 | 500 | 0 (timestamps only) |

### Product scale (portal, admin, web) (§3.3)

| Token | Size | Weight | Use |
|---|---|---|---|
| page-title | 28px | 500 | One per screen |
| section-title | 18px | 600 | Panel headings |
| body | 14–15px | 400 | Default UI text |
| label | 13px | 500 | Form labels, column headers (sentence case) |
| meta | 12px | 400 | Timestamps, secondary info |
| stat | 32px | 300 | Key numbers in overview tiles, tabular nums |

### Rules (§3.4)

- **Sentence case everywhere.** No ALL-CAPS labels, no eyebrow text above headings.
- Don't put one word of a headline in a different colour or weight.
- Line length: 60–75 characters (`max-width: 34–36em` for body).
- Codes (tracking ID, company code, rider code, pickup code) use tabular nums, weight 600, slightly tracked (+0.02em), and copy-to-clipboard buttons.

---

## Space, radius, depth (§4)

**Spacing scale (px):** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 72, 96, 120. Sections: 104px desktop, 72px mobile. Container: `max-width: 1240px`, padding 40px (20px mobile).

**Radius encodes hierarchy.** Bigger containers get bigger radii:

| Radius | Use |
|---|---|
| 6px | Bubble tail corner, tags inside cards |
| 10px | Table row hover, small icon tiles |
| 14px | Inputs, selects, small cards in product UI |
| 20px | Photos, listing cards, chat bubbles |
| 28px | Hero photo, feature panels, product cards on marketing pages |
| 32px | Convo panels, forms, phone mockups (46px outer) |
| 40px | Footer top corners |
| 999px | Pills, chips, avatar |

**Depth:** shadows are tinted ink, used only for things that float:
- `--shadow-float: 0 12px 30px rgba(14,21,38,.14)`: phones, notifications, menus, drawers
- `--shadow-hair: 0 1px 0 rgba(14,21,38,.06)`: incoming bubbles on tinted panels
- Cards in flat lists get **no shadow**. Separate them with spacing or a 1px `--line` border.

**Glass:** `background: rgba(255,255,255,.82); backdrop-filter: blur(14px)` for incoming bubbles over images, the sticky nav on scroll, and notification banners. This is the app's liquid-glass language, so use it sparingly.

---

## Signature: the chat bubble system (§5)

### Anatomy (§5.1)

```
[avatar 32px]  ┌──────────────────────────┐
               │ Name (12px, 600, blue)   │   incoming: white/glass, tail bottom-left
               │ Message text 16px        │
               │                  12:27   │
               └──────────────────────────┘
                     ┌──────────────────────────┐
                     │ Message text 16px        │   outgoing: --blue-600, white text,
                     │           12:29 ✓✓       │   tail bottom-right, ticks --tick
                     └──────────────────────────┘
```

- Radius 20px, with the tail corner at 6px. Padding 11px 15px 9px. Max width 82% of the panel.
- **Avatars are always shown on incoming messages.** Use real photos when available, otherwise initials on a colour picked from the person's name: `#F79009` (amber), `#0BA5EC` (sky), `#EE46BC` (pink), `#15B79E` (teal), `#6172F3` (indigo), `#DD6B20` (burnt orange). No red or green, because those mean safety and success (§2.2). Initials are `--ink-900` on all six (each passes 4.5:1). System senders (SunPay, Buzz, Buzz Alert) use their own marks.
- Variants: `in`, `out`, `system` (white with a 1.5px `--blue-600` border, e.g. SunPay escrow notices), `alert` (2px `--alert-600` border plus warning icon, for Buzz Alert), `typing` (three dots).
- Copy in bubbles sounds like real Nigerians texting, in plain English. No Pidgin. Never use marketing language inside a bubble.

### Where bubbles appear (§5.2)

- **Marketing heroes:** every page has its own conversation (section 9).
- **Logistics tracking:** the timeline uses system bubbles ("Picked up in Ikeja · 09:12").
- **Portal and admin:** dispute evidence shows the actual buyer/seller chat. Notifications use bubble styling.
- **Buzz Web:** the real thing.

### Motion (§5.3)

Bubbles **pop in one after another**, like messages arriving: `opacity 0 → 1`, `translateY(12px) scale(.86) → none`, 550ms, `--ease-out`, staggered 800ms. Transform origin is the tail corner. A typing indicator can come before an incoming bubble. **No overshoot or bounce.**

---

## Motion (§6)

### Tokens (§6.1)

```css
--ease-out: cubic-bezier(.16, 1, .3, 1);    /* default for everything */
--ease-in-out: cubic-bezier(.65, 0, .35, 1); /* looping/ambient only */
--dur-1: 160ms;  /* hover, press */
--dur-2: 240ms;  /* toggles, tabs, chips */
--dur-3: 400ms;  /* drawers, menus, modals */
--dur-4: 550ms;  /* bubble pop */
--dur-5: 900ms;  /* hero text rise, image reveals */
```

No bounce, no elastic, no spring overshoot.

### Rules (§6.2)

1. **One orchestrated moment per page** (listed per page in section 9). Everything else is still or responds to the user.
2. **Don't fade-and-slide every section** on scroll. Scroll-linked motion is reserved for moments that tell a story: the hands passing the parcel, the escrow money moving, the alert radius spreading.
3. Scroll-linked motion uses CSS `animation-timeline: view()` with a load-time fallback inside `@supports`. For complex sequences, GSAP ScrollTrigger or Motion is allowed.
4. User-triggered motion is welcome when it shows what changed: an expanding accordion, an opening drawer, a toast confirming "Rider deactivated".
5. `prefers-reduced-motion: reduce` turns off all non-essential animation. Content must be fully visible without it.

### Live gradient background (brand surfaces only) (§6.3)

Two blurred radial blobs drift slowly behind plain sections:
- Blob A: `radial-gradient(circle, #6FA4FF, transparent 64%)`, top-left, 18s drift
- Blob B: `radial-gradient(circle, #5FD4F5, transparent 62%)`, bottom-right, 22s drift
- `width/height: 60vmax; filter: blur(70px); opacity: .9` on light sections. On navy, use `#1F5BD8` at .5 and `#38B6FF` at .22.
- On `::before`/`::after` with `z-index:-1` and `isolation:isolate` on the section. It must never reduce body-text contrast below AA.
- **Never purple. Never in portal/admin tables.** Buzz Web uses it only on the QR pairing screen.

---

## Imagery, icons and logo (§7)

**Photography:** real, warm, Nigerian everyday life. People using phones, markets, homes, deliveries. Free sources: Unsplash and Pexels, preferring Lagos/Abuja-shot photos. Rules:
- Never present stock people as real customers or reviewers.
- Inset photos get 28px radius. Full-bleed bands get no radius.
- Text over photos needs a gradient scrim (`linear-gradient(20deg, rgba(10,14,24,.55), transparent 52%)`).
- Cut-out photos (transparent PNG/WebP) can animate from the edges of the screen. Example: the homepage hands, giving hand from the right and receiving hands from the left.
- Use `next/image`, WebP/AVIF, explicit sizes, and `priority` only on the hero.

**Illustrations:** flat, bold-outlined, Buzz blue plus warm skin tones (like the lock/puzzle in the template).

**Icons:** **Buzz's own icon set first.** These haven't been supplied yet, so they're pending. Until then, use **Lucide** at 1.6–1.8 stroke and 20/24px, inline SVG with `currentColor`. Never emoji in UI chrome.

**Logo:** the official logo and its variants are **pending**. Until supplied, use the wordmark "Buzz" in the font at weight 800, tracking -0.04em, `--ink-900` on light and `#3D8BFF` on navy. Leave a `<Logo variant="full|mark|white">` component so the real files drop in.

---

## Components (§8)

### Shared (§8.1)

- **Nav (brand):** logo left · links (The App, Buzz Pro, Depot, Payments, Safety, About) · right: "Buzz Web ↗" outlined pill + "Join the waitlist" solid pill. It becomes glass and sticky after 80px scroll. On mobile, a full-screen sheet menu with large 28px links.
- **Footer:** navy, 40px top radius. Logo + one-line description + waitlist pill. Four columns: Product / Company / Help / Also from Buzz (Buzz Web ↗, Buzz Logistics ↗, Track a package ↗). Bottom bar: © 2026 Aether Jade Innovation · legal links · social icons (placeholders until accounts are confirmed).
- **Buttons:** pill, min-height 44px (56px for the main form CTA), 14–16px weight 600. Variants: `solid` (blue), `outline`, `light` (white on blue), `sky` (on photos), `danger` (alert red, destructive only), `ghost` (product UI). "↗" only on links that leave the current area.
- **Chips:** 40px pills for filters and categories. The selected chip is `--ink-900` with white text.
- **Inputs:** 52px tall, 14px radius, 1.5px `#CBD3E1` border, 16px text (prevents iOS zoom), label above (13–14px, 600). Help text below, and errors in `--alert-700` with an icon and fix instructions.
- **Phone mockup:** 280×572, 46px outer radius, navy bezel, screen 37px radius. It shows **real Buzz UI built in HTML** (chat, alert, order tracking). No fake status bars.
- **Codes:** a monospace-feel tabular display in a `--blue-50` pill with a copy button. Example: `BZT-7Q4K-19XM`.
- **Status pills (logistics):** Booked (ink), Picked up (blue), In transit (blue, animated dot), At pickup point (warn), Out for delivery (sky), Delivered (ok), Failed attempt (warn), Returned (ink), Disputed (alert).
- **Empty states:** one clear sentence about what this is, plus the action to start. Example: "No riders yet. Add your first rider to give them a rider code."
- **Toasts:** bottom-centre (mobile) or bottom-right (desktop), glass, reusing the action verb.
- **"Test data" ribbon:** fixed top-right in portal, admin and web: `--warn-50` with `--warn-700` text, "Test data".

### Card policy (§8.2)

**Use a card when:**
1. The items are **separate, actionable objects** the user picks from: Depot listings, open roles, riders, parcels, help topics, partner applications, alerts.
2. The items are **distinct products, each showing its own small UI**: Pro's Storefront / Business Centre / Showcase, the App bento.
3. A form or panel needs to **stand apart from the page** (waitlist form, contact form).

**Don't use a card when:**
- The content is paragraphs, values or beliefs. Use **list rows** with dividers.
- It would sit inside another card. **Never nest cards.**
- Every item would look the same with only the text changing. Use a list.

Card styling **varies by role:** listing cards are photo-led with no border; product cards are 28px-radius panels holding UI vignettes; portal cards are 14px with a 1px border and no shadow. Never one radius and one shadow everywhere.

---

## Marketing site: page specs (`/`) (§9)

Each page: **hero conversation → one signature visual → supporting sections → CTA band → footer.** The **orchestrated moment** is the one animation that gets the spotlight.

### Home `/` (§9.1)
Follow `reference/homepage-template.png` closely.
1. **Hero:** inset photo (28px radius) of a woman smiling at her phone. Over it: H1 "One HUB that plugs you to everything." + subline + sky "Join the waitlist" pill, bottom-left. Three bubbles top-right (outgoing / incoming with photo avatar / outgoing).
   *Moment:* text rises, then bubbles pop in one by one.
2. Disclaimer line "* Data charges may apply…"
3. **Connect section** (mist + live gradient): "Connect with people and businesses with ease." The hands cut-out: the **giving hand and parcel slide in from the right, the open hands from the left**, scroll-linked, meeting in the middle.
4. **Blue band:** "Finding professionals and handymen hasn't been any easier." + "Explore Pro Mode" light pill.
5. **Feature rows** (alternating):
   - Lock illustration · "You control what you share." · Buzz ID copy · link
   - **Phone mockup** showing an estate group chat, where an **Buzz Alert drops in** from the top and loops · "Know what's happening on your street." · alert copy · link
6. **Full-bleed flowers photo** with "More people. Even less noise." rising on scroll.
7. **Connections:** "All the right connections, from payments to delivery." SunPay + Buzz Logistics + dashed partner slots.
8. Footer.

### The App `/app` (§9.2)
- **Hero:** H1 "Chat like you always do. Share less of yourself." · convo: Tobi's "Mum, I've landed in Abuja" plus a voice note and a typing indicator.
- **Signature, a feature stage:** a sticky phone on the right while the left column scrolls through Chats → Buzz ID → BuzzDrop → Status. The phone screen **swaps to match each feature**. *Moment.*
- **Bento** (cards allowed, each holds a live mini-UI): Groups (avatar stack), Status (24h ring with a red security-update ring beside it), Stickers & GIFs (sticker placeholders), Encryption (lock + "Not even Buzz can read them"), Buzz Web (QR + laptop).
- **Buzz ID block:** `@adaeze.buzz` pill vs a struck-through phone number.
- CTA band.

### Buzz Pro `/pro` (navy hero, the only dark marketing hero) (§9.3)
- **Hero:** "Your business, on the app your customers already use." · Pro ID card (Emeka Fix-It, Electrician · Surulere) + booking convo.
- **Profession switcher (interactive):** chips for Merchant / Landlord / Lawyer / Handyman / Creator / Tailor. Picking one **changes a preview card** showing the tools that profession gets. *Moment:* the preview cross-fades and re-lays out.
- **Three product cards** (28px, each with a vignette): Storefront (product grid), Business Centre (orders list with status pills), Showcase & Creator Toolbox (vertical video tile with "Shop now").
- "Pause or switch off Pro any time" row. CTA band.

### Depot `/marketplace` (§9.4)
- **Hero:** "Buy, rent or hire, from people you can actually reach." + large search pill + category chips (Products / Housing / Handymen / location / price).
- **Masonry of listing cards** (photo-led, Pinterest feel): price, seller, a "Live" badge on some, and a video tile with "Shop now". *Moment:* the masonry assembles column by column on load.
- **Three category tiles** with photography: Products, Housing, Handymen.
- **"Built so you don't get scammed"** as list rows: escrow (link to Payments), chat before you pay, search filters, delivery by Buzz Logistics (link).

### Payments `/payments` (§9.5)
- **Hero:** "Your money waits until you're happy." · convo with a SunPay system bubble "₦[AMOUNT] is held in escrow…"
- **Signature, an escrow track:** a horizontal rail with 4 stops (You pay → SunPay holds it → You confirm → Seller is paid). A **₦ token travels the rail as you scroll**, and each stop lights up. Numbered markers are correct here because it's a real sequence. Under the rail: "Released automatically after 5 days unless a dispute is opened." *Moment.*
- **Disputes:** two columns: what to do (list rows) + a dispute chat example (buyer, seller, SunPay system bubble).
- `[Fees, currencies]` placeholder row. CTA band.

### Safety `/safety` (§9.6)
- **Hero:** "Know what's happening on your street." · cooperative copy · a Buzz Alert card + estate group reply.
- **Signature, an alert radius map:** an abstract street grid (SVG, city-like, not a real map). A pin drops, a **red radius ring expands**, and phone dots inside the ring light up with a mini alert while dots outside stay grey. *Moment.*
- **How alerts work** as list rows: verified sources, only where it matters, your choice (opt-in), hard to miss (security updates have their own colour).
- **Emergency band:** red-bordered "Buzz is not an emergency service. In an emergency, call 112."

### About `/about` (§9.7)
- **Hero statement** (no convo here; the statement carries it): the three problems Buzz started with, in 48–64px light type.
- **Problem → answer pairs** (3 cards, each split in two: the problem in muted ink, Buzz's answer in blue): private chats → Buzz ID & encryption; scams → escrow; late danger info → Buzz Alert. *Moment:* each card flips from problem to answer as it enters view.
- Beliefs as list rows. Team photo grid `[pending]`. Blue band with Contact + Careers.

### Careers `/careers` (§9.8)
- Hero convo: "Are you hiring?" / honest reply.
- **How we hire** (a real sequence, so numbering is allowed): Apply → Chat with us → Small paid task → Meet the team. `[confirm]`
- Open roles list with team filter chips. Empty state card + email CTA (hello@aetherjade.space).

### Contact `/contact` (§9.9)
- **Topic cards** (selectable, 2×3): General, Help with the app, Business & partnerships, Logistics partners, Media & press, Careers. Picking one **routes the form**: it changes the subject line, the helper text and sometimes extra fields. *Moment:* the form panel slides to the chosen topic.
- Form card + direct channels list.

### Waitlist `/waitlist` (§9.10)
- Split: left, a phone mockup where a **"Buzz is live" notification** drops in, plus a short convo. Right, the form card (name, phone or email, city chips, consent, big CTA).
- **Success state:** "You're on the list" + a share-with-friends button.

### Help Centre `/help` (§9.11)
- Hero with a big search field over the live gradient.
- **Topic cards** with Lucide icons (Getting started, Chats & privacy, Depot, Payments & escrow, Pro Mode, Safety alerts, Logistics & delivery).
- Common questions accordion + a "Still stuck?" contact card.
- Article template: breadcrumb, title, last updated, body (max 68ch), "Was this helpful?" yes/no, related articles.

### Legal (8 pages, one template) (§9.12)
Privacy, Terms, Community guidelines, Safety guidelines, Marketplace terms, Payment terms, Cookie policy, Logistics terms. Pill switcher between documents, a **draft banner**, a sticky table of contents (stacks on mobile), body max 44em. Text pages stay text: no decoration, no motion.

---

## Logistics: page specs (§10)

### Public site (`/logistics`, brand register, lighter) (§10.1)

**Home `/logistics`**
- Hero: H1 "Track any Depot parcel. No app needed." + a **tracking input** (tracking ID, or "Scan QR" with the camera on mobile).
- **Signature, the journey line:** an abstract route line across city names (Lagos → Ibadan → Benin → Onitsha → Abuja). A parcel dot travels it, and scan points light up with system bubbles ("Scanned in Benin · 14:20"). *Moment.*
- Two paths: "I'm waiting for a parcel" (tracking) / "I run a logistics company" (partners).
- How it works teaser → link. Coverage: Intrastate / Interstate / International (Africa).

**How it works `/logistics/how-it-works`**: a real sequence (numbered): Depot order → partner collects and labels → pickup scan → checkpoints & batch (mother QR explained with a simple diagram: one mother code, several child parcels) → arrives: home delivery (delivery code) or pickup (pickup code, can send someone) → delivered and escrow releases. Each step has a small UI vignette (label, scan screen, code).

**Track `/logistics/track` and `/logistics/track/[id]`**
- Result header: status pill, tracking ID with copy, partner name, delivery type.
- **Timeline** of system bubbles, newest first: status · city · time. A "Batch scan" tag appears when updated via the mother QR.
- City-level route map (scan points only, never live rider location).
- Context actions (the buyer acts in the app; the page explains): "Choose home delivery or pickup in the Buzz app", "Send someone to collect: add their name in the app to get a pickup code."
- States: not found (check the ID format, example shown), delivered (proof photo thumbnail, blurred for privacy, plus a "Confirmed by delivery code" note), at pickup point (address, hours, days left in the 5-day free window), failed attempt (reason, next step), returned, disputed.

**Coverage `/logistics/coverage`**: three columns (Intrastate / Interstate / International, Africa), a simple Nigeria + Africa outline graphic, and `[cities pending]`.

**Partners `/logistics/partners`**: why partner (Depot volume, immediate payouts, your own rates), what we expect (verified company, inspection, score), the process as 4 steps, CTA "Apply to partner".

**Apply `/logistics/partners/apply`: guided onboarding**, one step per screen, a progress bar with step names, and each step opening with 1–2 plain sentences explaining *why* it's asked:
1. **Your company:** legal name, CAC number, address, contact person, plus a checkbox "We confirm our company is registered and verified".
2. **Services and coverage:** service types (intrastate/interstate/international), states/countries covered, vehicle types.
3. **Capacity and experience:** riders, vehicles, hubs, years operating, current tracking system.
4. **Documents:** download cards (Partner agreement, Data protection addendum, Rider verification declaration) → sign → **upload slots** with file state (empty / uploading / uploaded / rejected with reason).
5. **Rates:** per-km base rate, plus optional value/fragility/size modifiers. Shows "Buzz adds 3% (adjustable per agreement)".
6. **Book your meeting:** a **date and time picker** for a virtual call (calendar with available slots, timezone WAT).
7. **Review and submit**, then a success screen: what happens next (inspection, score, company code by email).
Save and continue later. Errors are inline per field.

**Sign up `/logistics/signup`** starts with a choice: apply as a **logistics company** or as an **individual rider** (two plain paths, no claims about hubs or fleets). A third option, **"I ride for a logistics company"**, has no form: it explains that the company registers its riders in the partner portal and gives them a company code and rider code, links to rider sign in, and offers the partner application to share with a company that isn't a partner yet. The individual rider form repeats this in a short note before step 1. The sign-in page links to both sign-up paths.

**Individual rider apply `/logistics/riders/apply`**: same guided pattern as Apply (one step per screen, progress bar, a "why we ask" line, save and continue later):
1. **About you:** full name, phone, email, home address, ID type and number.
2. **Your vehicle:** type (motorbike, car, van, bicycle), plate number, model and year, papers the rider chooses to upload (add a paper: name it, e.g. "Vehicle licence", then upload; add as many as they like), photo upload slots.
3. **Documents:** download (Rider agreement, Data protection addendum) → sign → upload slots with file state.
4. **Rates:** your per-km rate, "Buzz adds 3% (adjustable per agreement)".
5. **Book your vehicle inspection:** date and time picker (WAT) with the inspection address `[placeholder]`.
6. **Review and submit**, then success: what happens next (inspection, score, then your individual rider code and password for the Buzz app).

**Sign in `/logistics/portal/login`** (layout from `rider-sign-in.html`, 2026-11-25, in Buzz type and blue): a mist page with a **white rider card** (28px panel radius, 1px --line, 48px padding) beside a **photo panel** of the same height. Allowed under §8.2 rule 3: the form stands apart from the page.
- Card: headline "Rider sign in" (light, 38–48px) and "See your deliveries, batches and earnings." Under it, the two kinds of rider are a **segmented control** (radio group on a --mist track, the chosen side raised in white): "I ride with a partner" / "I ride on my own". Kept in `?rider=company|individual`.
- **Partner:** company code + rider code, stacked, with "Starts with…" help text. **On my own:** rider code + password (show/hide), Sign in with "Forgot your password?" on the right, an "or" rule, then a full-width outlined **"Sign in with Buzz ID"** button that switches to the Buzz ID step → "Check your phone" with the app's prompt drawn as Buzz bubbles, a 2-minute countdown, and (test build) a "Simulate tapping Yes in the app (test)" button. The Buzz ID step never reveals whether a Buzz ID has an account.
- The card ends with a ruled line: "Partner staff? **Sign in here**", which opens the partner card and focuses its email field.
- Photo panel: a plain `<img>` (`/images/logistics/rider-sign-in.jpg`), navy until it loads, a white "Ride on your own schedule" pill bottom-left. The orchestrated moment: a short rider conversation (glass bubbles) pops in over the photo, top-right.
- **Partner sign in** is a matching white card below, with a still Buzz note bubble beside it: "Sign in as partner staff" opens email + password + 2FA in place. It opens by itself for visitors coming from the portal (`?next=`, `?reason=`) or links with `?as=partner#partner`.

**Review status `/logistics/portal/review`**: what a pending account sees after sign in. A short headline ("Your account is being reviewed"), a vertical checklist (Application received ✓ · Documents checked · Inspection booked, with date and **Reschedule** · Inspection passed, with score · Account live), what's being inspected (company: offices, hubs, fleet; individual: your vehicle and papers), and a contact line for the partner team. No other navigation. Works well at 390px.

### Partner portal (`/logistics/portal`, product register) (§10.2)

Layout: left sidebar (collapsible; becomes a bottom bar on mobile) + top bar (company name, company code with copy, notifications bell, account). Light theme. Dense but calm: 14–15px text, 1px borders, no shadows except drawers.

| Screen | Contents |
|---|---|
| **Overview** | Today tiles (To collect · In transit · At pickup points · Failed attempts · Flags), payouts today (immediate) and pending Buzz share (T+2), a "Needs attention" list (flags, storage windows ending, disputes), recent scan feed as small system bubbles |
| **Parcels** | Table (cards on mobile): tracking ID, order ID, status pill, route, rider, batch, last scan, delivery type. Filters as chips, search by any code. Row → **detail drawer** (full screen on mobile): full history (every scan, link to/unlink from a mother, status change, with time, place and device), current location and status while in transit, timeline, city map, codes (masked pickup/delivery codes: "Code verified ✓", never the code itself), receiver (name + preferred contact only), proof of delivery, actions: reprint label, assign rider, **Call receiver** (final step only) |
| **Generate label** | Enter Depot order ID → preview the thermal label (4×6 and 3×2 toggle) with QR, tracking ID and destination city → Print |
| **Batches (mother QR)** | List of batches: mother code, rider, route, child count (linked / total), status, opened, last scan. Filters: open / closed. Detail: **mother card** (code, rider, route, last location and time) with child parcels below (each with its own tracking ID and status; unlinked ones show where and when, e.g. "Unlinked at Ibadan, 14:20 · Available for pickup"), and a **history** timeline of every event: mother created (second scan), child linked, mother scanned (children updated), child unlinked, batch closed, each with who, time and place. Read-only: batches change only in the rider's app, and one line explains how auto-linking works. |
| **Riders** | Tabs: Active / Pending verification / Deactivated. Table: name, rider code (copy), phone (masked), vehicle, today's scans, rating, status |
| **Add rider** | Steps: rider details → **your company's verification checklist** (configurable: the company adds its own checks, e.g. ID, guarantor, licence) → confirm "We have verified this rider" → rider code generated, with instructions to send: "Open Buzz → Me → Logistics partners → enter company code + rider code" |
| **Rider profile** | Details, verification record, recent scans map, ratings, **Deactivate rider** (danger, with a confirm dialog; history is kept) |
| **Hubs & pickup points** | List + map, hours, storage fee per day after 5 free days |
| **Rates** | Per-km base, modifiers, the agreed Buzz %, and an example calculator |
| **Payouts** | Earnings per delivery (paid immediately), Buzz share (immediate or T+2), monthly statements (download) |
| **Disputes & claims** | Cases involving this partner, 5-day countdown, evidence, respond |
| **Flags** | Off-route, wrong-company scan, 48h silence, delivered without code, manual entry, each with a review action |
| **Team** | Staff accounts with roles (owner, dispatcher, finance, viewer) |
| **Company** | Profile, company code, documents, inspection score with breakdown |

**Who sees what (built).** Both staff levels run the day: parcels (assign rider, reprint label, call receiver at the final step), Generate label, batches, riders, stops, hubs, rates, disputes (respond), flags (review with a note) and Company. **Payouts and statements, Team and the activity log are super admin only.** On phones the bottom bar holds Overview, Parcels, Batches, Riders and More (the rest). Hubs & pickup points is a list grouped by city for now; the map is still to come.

**Individual rider portal.** Same shell and register, with a smaller menu: **Overview** (today: to collect, in transit, delivered, earnings today; my active batch; recent scans) · **Parcels** (only theirs) · **Batches** (only theirs) · **Rates** · **Payouts** · **Disputes & claims** · **Flags** (about them) · **Profile** (details, individual rider code, vehicle, documents, inspection score). No Riders, Add rider, Team or Generate label. The top bar shows the rider's name and individual rider code instead of company. Designed phone-first: on 390px the bottom bar holds Overview, Parcels, Batches, Payouts and More. Lives at `/logistics/rider`.

**Company riders** use the same rider portal with the screens about them only: Overview (no earnings tile), Parcels, Batches, Flags and Profile (their company, rider code and the checks the company completed). Their company handles rates, pay and disputes, so those screens explain that instead.

**Mobile and desktop.** Every portal screen works at 390px. Desktop shows more columns and detail (tables, drawers, maps beside lists); mobile shows the same facts as cards with the most important first, and full-screen detail views.

### Buzz admin console (`/admin`, internal, product register) (§10.3)

Same shell as the portal, with a **navy sidebar** to signal "internal". Role-gated (support, finance, partner manager, super admin). Every destructive or money action asks for confirmation and logs who did it.

| Module | Contents |
|---|---|
| **Overview** | Escrow held / released / refunded today, open disputes (with countdowns), new applications, flags, partner score alerts |
| **Partner applications** | **Pipeline board** (cards are right here): New → Documents received → Meeting booked → Inspection → Approved / Rejected. Card detail: all answers, documents (approve/reject each with reason), meeting time, inspection score form, **Approve → generates company code** |
| **Partners** | Profile, company code, score trend, riders count, **custom rates** (edit Buzz % per agreement, with history), suspend / reinstate |
| **Riders** | Search across all companies, registering company, scans, **emergency freeze** |
| **Parcels & batches** | Universal lookup by order ID, tracking ID or pickup code, plus the full timeline, audit log and map |
| **Disputes & claims** | Queue sorted by time left in the 5-day window. Case view: buyer/seller chat (bubbles), scan log, proof photos, codes used. Decision: release / refund / partial. **Fault:** Buzz (Buzz pays) or partner (partner handles) |
| **Flags** | All flags across partners, bulk review |
| **Payments** | Escrow ledger, Buzz % income (immediate vs T+2), partner payouts, refunds |
| **Customer care** | Shared Depot + Logistics inbox, call log, quick links to the parcel or dispute |
| **Admin team** | Staff, roles, permissions, activity log |

### Product-surface rules (§10.4)
- Tables: 48px rows, sticky header, tabular nums, row hover `--blue-50`, the selected row has a `--blue-600` 2px left inset (the only allowed left accent, and only on a selected row).
- Every list has empty, loading (skeleton rows), error and "no results for this filter" states.
- Money is always `₦` with thousands separators. Dates are `19 Nov 2026, 14:05 WAT`.
- Mobile: tables become stacked rows (code + status on line 1, route + time on line 2).

---

## Buzz Web: page specs (`/web`, product register) (§11)

**Pairing screen `/web`**
- Live gradient background (the only product screen with it). A centred glass card: left, a **QR code that refreshes every 60s** with a circular countdown; right, steps: "1. Open Buzz on your phone · 2. Tap Me → Linked devices · 3. Point your phone at this code". `[confirm exact app path]`
- "Keep me signed in" toggle. A note: "Your messages stay end-to-end encrypted."
- States: QR expired (Reload), scanning ("Check your phone…"), success (a short "Syncing your chats" progress), phone offline.

**Main layout** (desktop ≥ 1024px):
```
┌─────────────┬──────────────────────────────┬───────────────┐
│ Chat list   │ Conversation                 │ Info drawer   │
│ search      │ header: avatar, name, status │ (toggle)      │
│ chips:      │ bubbles (same system)        │ media, files, │
│ All·Unread· │                              │ Buzz ID,      │
│ Groups·Pro  │ composer: + · text · voice   │ shared orders │
└─────────────┴──────────────────────────────┴───────────────┘
```
- **Top-right notification bell** in the chat list header. **Delivery updates are priority:** they pin to the top of the bell list with a blue status pill and also show as a glass banner. Clicking one opens the order tracking panel.
- Delivery/order messages render as **order cards inside the chat** (product thumbnail, status pill, tracking ID, "Track" button).
- Security updates appear in a separate "Updates" view with the alert colour.
- Light and dark themes, following the system setting, with a manual toggle.
- States: phone disconnected banner ("Your phone is offline. Messages will send when it reconnects."), session expired, logged out, empty chat ("Say hello. Messages are end-to-end encrypted.").
- Tablet: two panes. Phone width: redirect to "Buzz Web works best on a computer. Open the app on your phone."

---

## Anti-slop checklist (run before calling any screen done) (§12)

From Impeccable, the frontend-design skill and Buzz's own rules. **Every item must pass.**

- [ ] No ALL-CAPS labels, no eyebrow text above headings, no `A · B · C` meta strings as decoration
- [ ] No `01/02/03` numbering unless the content is a real sequence
- [ ] No `→` on links or buttons ("↗" only for links that leave the area)
- [ ] No one-word colour/italic accent inside headlines
- [ ] No card soup: list rows for text content, cards only per section 8.2, never nested
- [ ] Radii follow the hierarchy (section 4), not one radius everywhere
- [ ] No uniform grey shadow under every element. Shadows only on floating things.
- [ ] No purple, no neon, no dark glow, no gradient text
- [ ] No bounce/elastic easing, and only one orchestrated moment per page
- [ ] No fade-up on every section
- [ ] No pure black or pure grey. Inks are tinted.
- [ ] No grey text on coloured backgrounds
- [ ] No invented stats, testimonials, logos or ratings. Placeholders are visible `[like this]`.
- [ ] No emoji in UI chrome. Icons are Lucide (until Buzz icons arrive).
- [ ] Copy: sentence case, active verbs, buttons say what happens, errors say how to fix
- [ ] Touch targets ≥ 44px, visible focus ring (`3px --sky-400`, offset 3px)
- [ ] Text contrast ≥ 4.5:1 (3:1 only for text ≥ 24px)
- [ ] Works at 360px wide: nothing clipped, menus stack, tables become rows
- [ ] `prefers-reduced-motion` respected
- [ ] Images have alt text. Decorative SVGs are `aria-hidden`.
- [ ] Headings in order (no skipped levels), one H1 per page
- [ ] `npx impeccable detect` shows no issues except the deliberate ones in section 1
- [ ] Lighthouse: Performance ≥ 90 on mid-range Android (throttled), Accessibility ≥ 95

---

## Open items (placeholders until confirmed) (§13)

- Official logo and icon variants
- Partner logos (Paystack etc.)
- SunPay fees, currencies, dispute details beyond the 5-day window
- Whether red Buzz Alerts sound on silent
- Exact app path for Linked devices (Buzz Web pairing)
- Coverage city list, prohibited items list
- Team photos and bios
- Social media accounts
- Full photography set (originals of the template photos, or chosen stock)
