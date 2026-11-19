# Phase G backlog

Items deferred to Phase G (polish) in BUILD-GUIDE.md. Each one says where it came from. Fix them in Phase G, or sooner if a page needs it.

## /dev/components (critique run 2, 19 Nov 2026, 26/40)

Not yet done. The order is the one agreed after the critique: component bugs, then gallery trust, then Parcels readiness, then minor notes.

### Component bugs (real pages inherit these)
- **[P1] Focus return:** `Drawer` and `ConfirmDialog` drop focus to `<body>` on close (WCAG 2.4.3). Return focus to the opener (`onCloseAutoFocus` or a Radix Trigger), and check it after Esc and after confirming.
- **[P1] Nav container query:** `Nav` switches layout by viewport width, so inside a narrow container it clips "Buzz Web ↗" and "Join the waitlist". Switch it by container width. (Decided: container query, not a full-width preview.)
- **[P2] Invalid checkbox:** colour only. Add an icon and a message.
- **[P2] Select error copy:** "Choose at least one service you offer" implies multi-select. Make it match single select.
- **[P2] Disabled Select options:** they barely differ from enabled ones.

### Gallery trust
- **[P2] Rail scroll-spy:** the first section of each group never gets `aria-current`, because group sections contain their children and always win. Watch only the individual sections and work out the group from them.
- **[P2] Rail entries:** add "Not built yet" to both rails, fade the edge of the phone group bar, and keep a single "Back to top".
- **[P2] Captions:** they're shortened (`<Button loading>` without its children). Show the full JSX with a copy button, ideally generated from the same source as the render.
- **[P2] Off-spec badge:** use one consistent badge for ok-700, line-strong, `storage_expiring` and `refused`.
- **[P2] Token counts:** "Colour 38 tokens" shows 31. Add navy-700, alert-50, ok-50, warn-50 and white, and the 999px pill radius.
- **[P2] Avatar colours:** the demo names hash to 4 of the 6 colours (amber and pink never appear). Render all six tokens directly.
- **[P3] Copy label casing:** "Copy tracking id" should be "Copy tracking ID".
- **[P3] Figure names:** screen readers announce code strings ("<Checkbox invalid />"). Give each a readable name.
- **[P3] Heading levels:** "Not built yet" is an H2 styled smaller than the H3 sections.

### Parcels readiness (do before Phase D)
- **[P2] Table columns:** the table demo shows 5 of the 8 columns in §10.2. Add order ID, rider and batch, plus filter chips and search.
- **[P2] Preview-state switch:** the Ready / Loading / Error / Empty / No results chips look like product filters. Move them into a "Preview state" toolbar that looks clearly different.
- **[P2] Retry:** "Try again" leaves the table in Loading for good. Return to Ready after a short delay.
- **[P2] Timeline dates:** timelines show times without dates, so 01:00 can appear above 10:00. Show the date whenever the day changes.
- **[P2] Drawer contents:** add the city-map placeholder, proof of delivery, masked codes ("Code verified ✓") and Call receiver (final step only).

### Minor notes
- **[P3] Upload button:** the empty `UploadSlot` uses a solid primary "Choose file", so a Documents step shows three primary buttons. Use outline.
- **[P3] Button pressed state:** `active` looks the same as hover. Make pressed distinct.
- **[P3] Read-only code input:** the read-only company-code input should use the §3.4 code style with a copy button.
- **[P3] Glass bubble:** it's shown over the gradient. Show it over a photo.
- **[P3] Gallery trims:** shorten the two 440px gradient specimens, and remove the live upload demo that duplicates the "empty" specimen.
- **[P3] Toast previews:** their Undo and close controls look interactive but do nothing. Mark them as previews.
- **[P3] Avatar palette:** amber and burnt orange are hard to tell apart at 32px. This is the user's palette, so it's a decision for them, not a fix.
- **[P3] DESIGN.md token:** add `--color-ok-700` (#067647) to §2.1. It's the darker green for ok text on light, because ok-600 fails 4.5:1 on small text.

## Marketing pages (Phase B)

Added page by page below. P0 and P1 issues were fixed before each page was committed. These are the P2 and P3 issues the critiques and audits found.

### Home `/` (critique 23/32 · audit 17/20)
- **[P2] Hero asterisk:** "…in one app.*" points to a data-charges note it doesn't qualify (the template's "free*" was removed). Drop the asterisk, or reword it as "Buzz uses mobile data. Data charges may apply."
- **[P2] Message balance:** "no phone number / Buzz ID" is told four times (hero bubbles, Connect, feature row 1, flowers band), while chat to checkout (Depot → SunPay → Logistics) gets one line. Rewrite the flowers body around noise and control, and turn Connections into a chat → pay → deliver story (PRODUCT.md principle 1).
- **[P2] Connections:** the placeholder slots outweigh the two real partners, and on phones they stack into three rows. The bordered name tiles aren't actionable, so §8.2 says list rows. Show SunPay and Buzz Logistics as two richer rows and collapse the pending partners into one dashed strip. The SunPay note repeats the tile.
- **[P2] Waitlist promise:** the page never says what joining the waitlist gets you (e.g. "we'll tell you when Buzz is in the Play Store").
- **[P2] Low-end Android cost:** effects that never stop: two 60vmax blur(70px) gradient blobs, the glass nav's backdrop-filter, and the alert loop (now capped at 3 runs). Consider pausing the gradient when it's off-screen and checking the served size of `hands-give.png` (1 MB source).
- **[P3] Hands scene:** about 810px tall at 1440. Cap it at about 600px, and fade the giver's crop edge, which shows as a dark strip against the blue band.
- **[P3] Buzz ID link:** "How Buzz ID works" lands at the top of /app. Point it at the Buzz ID section.
- **[P3] Safety placeholder:** `[Safety headline: to be written]` at 52px looks unfinished. Keep the placeholder (it's required) but consider showing it smaller until the copy arrives.
- **[P3] Hero subline orphan:** at 1440 the subline wraps to an orphan ("in / one app.*").
- **[P3] Focus ring:** the critique measured 2.4px with no offset on one element. Verify against §12 (3px sky, 3px offset).
- **[P3] Top bar options:** 8 options (6 links and 2 pills), over the ≤5 guideline. It's per §8.1, so it's a spec question.

### The App `/app` (critique 22/32 · audit 16/20)
- **[P2] Bento mini-UIs:**
  - Status needs the "24h ring" from §9.2.
  - Groups has a large empty middle (try a two-bubble group snippet with a voice note).
  - Encryption is a lone lock tile (try the in-chat system notice as a system bubble).
  - Buzz Web is a generic laptop icon (try a small laptop frame mirroring the chat list).
- **[P2] Phone stacking:** below 1024px the feature stage shows four full-size phones (about 2,300px). Use a single phone with a tab or swipe switcher, or cropped screens at about 60%.
- **[P2] Repetition:** the stage and the bento both cover Status, and Buzz ID appears in four places. Consider moving Groups, Encryption and Stickers into the stage and dropping the bento's repeats.
- **[P2] Launch platforms:** the page never says when or where the app arrives. Add a visible placeholder, "[Android and iOS: launch platforms to be confirmed]".
- **[P3] Status naming:** the copy says "Status" while the phone header says "Updates". Pick one, per PRODUCT.md terminology ("Status / Updates").
- **[P3] Avatar clustering:** colours cluster on indigo in the Chats list (T, AF, EC, EF). Improve the hash spread.
- **[P3] Feature title size:** feature titles are H3 tags styled at h2 size, so they look like section headings.
- **[P3] Hero convo panel:** it ends well above the bottom of the hero, leaving empty space bottom-right.
