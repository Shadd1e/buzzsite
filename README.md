# Buzz Official Website

A separate, static-first website project for the Buzz platform. It does not modify or replace the Expo mobile application.

## Run locally

Requires Node.js 18 or newer.

```bash
npm run dev
```

Open `http://localhost:4173`. No dependency installation is required.

## Deploy to Vercel

1. Import this directory into Vercel.
2. Set the framework preset to **Other**.
3. Leave the build command empty and set the output directory to `.`.
4. Deploy.

`vercel.json` rewrites extensionless page routes to `index.html`.

## Homepage visual direction

The homepage now follows the supplied visual reference: a full-bleed photographic hero with a fine diagonal grid, a pale lavender sharing section with a simple illustrated mark and crosshatched message panel, a centred Marketplace/BuzzDrop introduction with a wide handover photograph, and a strong blue app section with an angled phone/creator image. The mobile layout is the primary reference; desktop expands the same sequence without changing its visual character.

The homepage uses a deliberately restrained layout and short copy. Do not reintroduce generic dashboard cards, floating UI mockups, decorative gradients, excessive eyebrow labels, or extra homepage sections without approval.

## Brand and asset notes

The official Buzz logo, font files and approved app screenshots were not present in the supplied files. The current wordmark is a temporary text treatment. Editorial photography is loaded from Pexels URLs and documented in `assets/IMAGE-CREDITS.md`; review licensing and approve/rehost selected images before production. The illustrated sharing mark is a small inline SVG created for this homepage, not an official logo.

## Routes and integration status

All 27 agreed public routes have page renderers. Waitlist/contact delivery, package tracking, partner application submission and file storage, partner authentication, partner dashboard data, payment processing, analytics and official app downloads remain unconnected because no production service or approved content was supplied. Interfaces must not display fabricated success, tracking events, payment records or partner data.

The Help Centre includes the supplied question inventory with cautious answers or explicit limitations. The eight policy routes are drafts and require legal review and approval before publication.

## SEO sitemap

After the official domain is confirmed:

```bash
BUZZ_SITE_URL=https://your-approved-domain.example npm run sitemap
```

This creates `sitemap.xml` for the agreed routes. The domain is intentionally not guessed.

## Image rights

See `assets/IMAGE-CREDITS.md`. Approve and, where appropriate, rehost the final selected images before launch.
