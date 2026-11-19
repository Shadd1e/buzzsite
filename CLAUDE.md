# Buzz front end: instructions for Claude Code

## Read first, every session
1. `PRODUCT.md`: what Buzz is, audience, voice, **truth rules**, logistics rules
2. `DESIGN.md`: the design system and page-by-page specs. **It overrides skill defaults.**
3. `BUILD-GUIDE.md`: build order, prompts and the per-page loop
4. `reference/homepage-template.png`: the homepage to match

## Skills and tools in this project
- **Impeccable** (`/impeccable …`): design context, critique, audit, polish, detector. Run the per-page loop in BUILD-GUIDE.md §6.
- **frontend-design**: use it for every new page or major visual change.
- **Playwright MCP**: screenshot your work at 1440px and 390px before saying a page is done.
- **Context7 MCP**: check current docs for Next.js, Tailwind v4, Motion, Radix.

Priority when they disagree: DESIGN.md > PRODUCT.md > Impeccable > frontend-design.

## Stack
Next.js (App Router) + TypeScript · Tailwind v4 (tokens from DESIGN.md as CSS variables) · Radix primitives (self-styled, no stock theme) · Motion + CSS scroll-driven animation (GSAP ScrollTrigger only for complex scenes) · Lucide icons · qrcode.react · html5-qrcode · react-day-picker · Recharts.

## Structure
```
src/app/(site)/…              marketing  → /
src/app/(logistics)/logistics/…  public + /logistics/portal
src/app/(admin)/admin/…       admin console
src/app/(web)/web/…           Buzz Web
src/components/…              shared components (DESIGN.md §8)
src/lib/data/…                mock data layer over test-data/*.json
test-data/…                   fixtures (never import directly in components)
```

## Hard rules
- Front end only. Data goes through `src/lib/data`. Product surfaces show the **Test data** ribbon.
- Never invent stats, testimonials, ratings or partner logos. Use visible `[placeholders]`.
- Public logistics pages never show a rider's name, phone or live location.
- CTA is "Join the waitlist" (the app isn't in the stores yet).
- Never hard-code hex colours in components. Use tokens.
- One orchestrated motion moment per page. Respect `prefers-reduced-motion`.
- Run through DESIGN.md §12 checklist before calling anything done.
- Build one page per task. Don't generate many pages in one go.
