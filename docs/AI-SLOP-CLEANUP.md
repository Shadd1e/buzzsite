# Project-wide design and copy cleanup audit

This is an audit and proposed sequence, not permission to redesign the whole site. The supplied homepage reference is now the approved visual direction for the homepage and must remain the anchor for any later changes.

## What currently reads as generic or AI-generated

### 1. Visual language outside the homepage
- Several inner pages repeat the same oversized editorial heading, tiny uppercase eyebrow, numbered section label, two-column split and dark/blue call-to-action panel. Repetition makes unrelated pages feel like one generated template.
- Decorative company-page rings, generic `B.` marks, abstract symbols and repeated geometric ornaments are not grounded in supplied brand assets.
- Repeated card grids and uniform page-hero panels make product pages feel interchangeable rather than designed around their actual content.
- The global Manrope/DM Sans/Georgia pairing is serviceable but not a confirmed Buzz type system. The temporary wordmark is not the official logo.
- The previous homepage contained a long sequence of generic editorial sections. It has been replaced with the supplied four-part visual direction. Do not restore that sequence by default.

### 2. Copy patterns to remove or rewrite
A source scan found recurring broad marketing language such as “people and possibility”, “everyday life”, “closer together”, “journey”, “the bigger picture”, “real-world momentum” and repeated “connected ecosystem” fallback copy. Some of these are valid product ideas, but repeated without a concrete feature or user outcome they sound templated.

Examples to review include:
- `company-pages.js`: “People. Possibility. Everyday life.”
- `logistics-pages.js`: repeated “journey” framing where a plain delivery step would be clearer.
- `app.js`: the same generic fallback description used for otherwise unmatched routes.
- `index.html`: multiple broad descriptions and generic footer language. The hero is now shorter and more specific.

Do not mechanically delete every occurrence. Keep approved brand language where it has a clear purpose; replace vague claims with a verified feature, user action, limitation or concrete example.

### 3. Photography and proof
- Pexels photography is editorial stock, not evidence of Buzz users, staff, merchants, delivery partners or live product activity.
- Several image descriptions currently imply a precise location or role. Verify the image and licence before retaining those descriptions.
- No genuine app screenshots, official logo files or approved type assets were supplied. Do not create fake interface screenshots or present stock photography as product proof.
- The homepage reference uses large, simple photographs as atmosphere. Keep the same restraint; use commissioned/approved Nigerian photography when available.

## Recommended cleanup sequence

1. **Lock the homepage direction.** Keep its four visual beats, spacing, blue/lavender/white palette, fine diagonal grid treatment and restrained typography. Only change it when the owner asks.
2. **Replace temporary brand assets.** Obtain official logo variants, font files, colour values and approved app screenshots. Remove the text-only `buzz.` and generic `B.` marks once official assets arrive.
3. **Audit each inner route against its job.** Product pages should explain one product; logistics pages should explain delivery operations; company pages should give company information. Do not force all pages into one hero-plus-cards template.
4. **Rewrite copy from verified product facts.** Delete filler adjectives and repeated slogans. Prefer short statements that say what the feature does, who uses it, what is required and what is not yet available.
5. **Replace generic imagery selectively.** Commission or approve real Nigerian people, places and businesses. Use each image for a specific reason; remove images that merely fill space.
6. **Remove decorative UI that has no function.** Review arbitrary rings, floating badges, invented numbers, ornamental labels, repeated cards and stock dashboard patterns. Keep visual devices only when they support hierarchy or explain a real feature.
7. **Unify interaction details.** Make buttons, forms, menus, focus states, empty states and error states consistent without making every page look identical.
8. **Re-test all 27 routes and mobile widths.** Check links, keyboard access, form validation, page titles, image loading and truthful integration states after each batch.

## Non-negotiable guardrails

- Preserve the supplied homepage reference as the design anchor.
- No invented metrics, customer counts, testimonials, partner logos, delivery coverage, payment states or app capabilities.
- No fake screenshots or fake dashboards.
- Keep planned, partial and unavailable functionality clearly distinguished from working features.
- Do not publish draft policy pages as approved legal terms.
- Do not change product terminology or invent new products to fill visual space.
