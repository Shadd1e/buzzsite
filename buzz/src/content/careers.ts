/**
 * Careers copy (DESIGN.md §9.8). The hiring steps are marked [confirm] in the
 * spec, so they carry a visible placeholder. No open roles are confirmed, so
 * the list shows its empty state with the confirmed email.
 */

export const careersPage = {
  meta: {
    title: "Careers",
    description: "Work at Aether Jade Innovation on Buzz. See how we hire and get in touch.",
  },
  hero: {
    title: "Help build the app Nigerians will use every day.",
    lede: "Buzz is made by Aether Jade Innovation. Tell us what you'd like to work on, even when no roles are open.",
    convo: {
      label: "Someone asks if Buzz is hiring",
      team: { name: "Buzz team", system: "buzz" },
      messages: [
        { variant: "out", text: "Hi! Are you hiring?", time: "11:20", status: "read" },
        { variant: "in", text: "Not for any open roles right now. But send us a note about what you'd like to work on, and we'll keep it for when we are.", time: "11:24" },
      ],
    },
  },
  // What you'd be working on (PRODUCT.md positioning, no invented numbers)
  building: {
    title: "What you'd be working on",
    lede: "Buzz puts chats, a marketplace, payments, delivery and safety alerts in one app. Most of the hard work sits where those pieces meet.",
    rows: [
      { title: "Identity without a phone number", body: "Buzz ID, BuzzDrop and Pro ID let people deal with friends, buyers and sellers without handing out their number." },
      { title: "From chat to checkout", body: "Finding something on Depot, paying through SunPay escrow and tracking delivery, all inside the chat where people already talk." },
      { title: "Trust between strangers", body: "Escrow, verified sellers and logistics partners, and safety alerts from verified agencies, so a first deal feels safe." },
    ],
    note: "Built for everyday Nigerians on Android phones, often on slow or metered data. Light and fast matters as much as clever.",
  },
  steps: {
    title: "How we hire",
    note: "[Hiring steps: to be confirmed]",
    items: [
      { title: "Apply", body: "Send your CV or portfolio and a short note." },
      { title: "Chat with us", body: "A relaxed conversation about you and the role." },
      { title: "Small paid task", body: "A short, paid piece of work like the real job." },
      { title: "Meet the team", body: "Meet the people you'd work with." },
    ],
  },
  roles: {
    title: "Open roles",
    teams: ["All teams", "Engineering", "Design", "Operations", "Partnerships"],
    empty: {
      title: "No open roles right now.",
      body: "Tell us what you'd like to work on, and send a link to your work.",
      email: "hello@aetherjade.space",
    },
  },
  cta: {
    title: "Don't see your role? Write to us anyway.",
    body: "Tell us what you'd like to work on and send a link to your work.",
    action: { label: "Email hello@aetherjade.space", href: "mailto:hello@aetherjade.space" },
    secondary: { label: "About Buzz", href: "/about" },
  },
} as const;
