/**
 * About copy (DESIGN.md §9.7). The three problems and answers come from the
 * §9.7 pairs; beliefs restate PRODUCT.md's product principles. No invented
 * history, team size, funding or numbers. Team photos are pending (§13).
 */

export const aboutPage = {
  meta: {
    title: "About",
    description:
      "Buzz is made by Aether Jade Innovation. We started with three problems: chats that cost you your privacy, scams when paying strangers, and safety news that arrives too late.",
  },

  hero: {
    title: "Your number was everywhere. Paying a stranger was a gamble. Safety news came too late.",
    lede: "Buzz is made by Aether Jade Innovation to fix those three things, in one app.",
  },

  pairs: {
    title: "Three problems, three answers",
    items: [
      {
        id: "privacy",
        problem: "To chat with anyone, you had to hand over your phone number.",
        answer: "Buzz ID lets people reach you without it, and every chat is end-to-end encrypted.",
        answerTitle: "Buzz ID and encryption",
      },
      {
        id: "scams",
        problem: "Paying a seller you'd never met meant hoping they'd deliver.",
        answer: "SunPay holds your money in escrow until you confirm the order arrived.",
        answerTitle: "Escrow",
      },
      {
        id: "alerts",
        problem: "News of danger nearby reached you late, if at all.",
        answer: "Buzz Alerts come from verified agencies and people near you, for the areas you choose.",
        answerTitle: "Buzz Alerts",
      },
    ],
  },

  beliefs: {
    title: "What we believe",
    rows: [
      { title: "One hub, not a pile of apps", body: "Chats, a marketplace, payments and safety work better when they're connected." },
      { title: "Your number stays yours", body: "Privacy is the default. People reach you through your Buzz ID, not your phone number." },
      { title: "Truth before polish", body: "We'd rather show a clear placeholder than make a claim we can't stand behind." },
      { title: "Light enough for every phone", body: "Buzz should work well on a mid-range Android, on a slow or metered connection." },
      { title: "Safety is a team effort", body: "We work with verified agencies. Buzz is not an emergency service: in an emergency, call 112." },
    ],
  },

  team: {
    title: "The team",
    note: "[Team photos and bios: pending]",
    slots: 4,
  },

  band: {
    title: "Want to talk, or work with us?",
    contact: { label: "Contact us", href: "/contact" },
    careers: { label: "See careers", href: "/careers" },
  },
} as const;
