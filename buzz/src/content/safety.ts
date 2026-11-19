/**
 * Safety copy (DESIGN.md §9.6). Confirmed (PRODUCT.md): EMBA alerts come from
 * verified police and security agencies and from real users; location-based,
 * opt-in, push; security updates have their own row and colour.
 * Truth rules: cooperative with agencies, never against the government;
 * Buzz is not an emergency service ("call 112"); do NOT claim alerts ring on
 * silent (unconfirmed). The headline is pending (§13).
 */

export const safetyPage = {
  meta: {
    title: "Safety",
    description:
      "EMBA alerts from verified police and security agencies and from people near you. Opt-in, location-based, and in their own colour. In an emergency, call 112.",
  },

  hero: {
    title: "[Safety headline]",
    lede: "Buzz works with verified police and security agencies, and with people near you, to share safety alerts for the places you care about. You choose to turn alerts on, and you choose the areas.",
    cta: { label: "Join the waitlist", href: "/waitlist" },
    alert: {
      source: "[Verified agency]",
      title: "EMBA alert",
      body: "Road blocked at [location]. Avoid the area and use another route.",
      area: "Within [radius] of [location]",
      time: "10:30",
    },
    reply: {
      group: "Estate Residents (Block C)",
      messages: [
        { from: "Mr Bello", text: "Thanks. I'll go through [another road] instead", time: "10:32" },
        { from: "me", text: "Thanks for the heads-up. Leaving later today", time: "10:33", status: "delivered" },
      ],
    },
  },

  map: {
    title: "Only the people who need to know",
    lede: "An alert goes to phones within the affected area. Everyone else carries on without the noise.",
    caption: "Illustration. Not a real map or real locations.",
    inside: "Inside the area: alert received",
    outside: "Outside the area: no alert",
  },

  how: {
    title: "How alerts work",
    rows: [
      { title: "Verified sources", body: "Alerts come from verified police and security agencies, and from real users near the event." },
      { title: "Only where it matters", body: "Alerts are tied to a location, so you only hear about what's happening in the areas you follow." },
      { title: "Your choice", body: "Alerts are opt-in. Turn them on, pick your areas, and turn them off whenever you like." },
      { title: "Hard to miss", body: "Security updates sit in their own row, in their own colour, so they never get lost among other updates." },
    ],
  },

  emergency: {
    title: "Buzz is not an emergency service.",
    body: "In an emergency, call 112.",
  },

  cta: {
    title: "Stay in the know when Buzz launches.",
    body: "Join the waitlist and we'll tell you when alerts are live in your area.",
    action: { label: "Join the waitlist", href: "/waitlist" },
  },
} as const;
