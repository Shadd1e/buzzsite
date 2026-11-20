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

  // What the person is joining the waitlist for: the whole HUB, not one feature
  inside: {
    title: "One app for the things you already do on five.",
    lede: "When Buzz is live, this is what you'll find in it.",
    rows: [
      { title: "Chats and your Buzz ID", body: "Chats, groups and voice notes, end-to-end encrypted. Give people your Buzz ID instead of your phone number.", link: { label: "See the app", href: "/app" } },
      { title: "Depot", body: "Buy products, rent homes and hire handymen from people you can message before you pay.", link: { label: "Explore Depot", href: "/marketplace" } },
      { title: "SunPay escrow", body: "Your money is held until you confirm the order arrived, or released after 5 days unless you open a dispute.", link: { label: "How payments work", href: "/payments" } },
      { title: "Buzz Logistics", body: "Depot orders delivered by partner logistics companies, with a tracking ID for every parcel.", link: { label: "About delivery", href: "/logistics" } },
      { title: "Pro Mode", body: "A Storefront, a Pro ID and a Business Centre for sellers, landlords, handymen and professionals.", link: { label: "Explore Pro Mode", href: "/pro" } },
      { title: "EMBA alerts", body: "Safety alerts for your area from verified police and security agencies and from people near you. Opt-in.", link: { label: "How alerts work", href: "/safety" } },
    ],
  },

  // A real sequence, so numbered markers are correct here
  next: {
    title: "What happens after you join",
    steps: [
      { title: "You're on the list", body: "We keep your name, contact and city so we can tell you about the launch. Nothing else." },
      { title: "We tell you it's ready", body: "You'll hear from us by phone or email as soon as Buzz is in the app stores. [Launch date: to be confirmed]" },
      { title: "Download and claim your Buzz ID", body: "Install Buzz, pick your handle, and start chatting, shopping and selling." },
    ],
  },

  faq: {
    title: "Questions about the waitlist",
    items: [
      { q: "Does joining cost anything?", a: "No. Joining the waitlist is free." },
      { q: "Which phones will Buzz work on?", a: "[Supported platforms and phones: to be confirmed]" },
      { q: "Can I reserve my Buzz ID now?", a: "[Reserving a Buzz ID before launch: to be confirmed]" },
      { q: "What do you do with my details?", a: "We only use them to tell you about the launch. You can ask us to remove them at any time by emailing hello@aetherjade.space. See the privacy policy (draft) for more." },
      { q: "I run a business. Should I join too?", a: "Yes. Join the waitlist, then read about Pro Mode to see what you'll get as a seller, landlord, handyman or professional." },
    ],
  },
} as const;
