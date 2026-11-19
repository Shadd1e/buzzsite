/**
 * Waitlist copy (DESIGN.md §9.10). Front end only: the form validates and
 * shows the success state, with a visible note that this test build didn't
 * store anything (truth rules).
 */

export const waitlistPage = {
  meta: {
    title: "Join the waitlist",
    description: "Buzz isn't in the app stores yet. Join the waitlist and we'll tell you when it's ready.",
  },
  title: "Be the first to know when Buzz is live.",
  lede: "Buzz isn't in the app stores yet. Leave your details and we'll tell you as soon as you can download it.",
  phone: {
    label: "Illustration: a phone showing a notification that Buzz is live",
    caption: "Illustration of the notification you'll get at launch.",
    notification: { title: "Buzz is live", body: "Download Buzz and claim your Buzz ID." },
    convo: [
      { from: "Kemi", text: "Have you joined the Buzz waitlist?", time: "19:02" },
      { from: "me", text: "Just did. They'll tell us when it's out", time: "19:04", status: "read" },
    ],
  },
  form: {
    title: "Join the waitlist",
    cities: ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Somewhere else"],
    consent: "I'm happy for Buzz to contact me about the launch.",
    privacyLink: { label: "Privacy policy (draft)", href: "/legal/privacy" },
    cta: "Join the waitlist",
  },
  success: {
    title: "You're on the list (test build)",
    body: "We'll tell you as soon as Buzz is ready to download.",
    testNote: "Test build: your details weren't stored.",
    share: "Share with friends",
    shareText: "I just joined the Buzz waitlist. One HUB that plugs you to everything.",
    copied: "Link copied",
  },
} as const;
