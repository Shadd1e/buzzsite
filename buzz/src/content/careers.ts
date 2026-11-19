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
} as const;
