/**
 * Homepage copy (DESIGN.md §9.1). Facts come from PRODUCT.md only.
 * Anything unconfirmed is a visible [placeholder]. Voice: plain, warm,
 * direct; Pidgin only inside chat bubbles.
 */

export const home = {
  meta: {
    title: "Buzz: One HUB that plugs you to everything",
    description:
      "Chat, share your Buzz ID instead of your number, buy on Depot with SunPay escrow, and get safety alerts from verified agencies. Join the waitlist.",
  },

  hero: {
    title: "One HUB that plugs you to everything.",
    subline: "Chats, a marketplace, safe payments and safety alerts, in one app.",
    cta: { label: "Join the waitlist", href: "/waitlist" },
    image: {
      src: "/images/home/hero-phone.jpg",
      alt: "A woman smiling at her phone while holding a cup of tea",
      width: 1325,
      height: 829,
    },
    // Hero bubbles: outgoing / incoming with photo avatar / outgoing (§9.1)
    convo: {
      label: "Two friends swapping Buzz IDs instead of phone numbers",
      contact: { name: "Amaka", src: "/images/avatar-chat-sample.png" },
      messages: [
        { variant: "out", text: "Abeg send me your number", time: "12:26", status: "read" },
        { variant: "in", text: "Just add @amaka.buzz. No need for my number", time: "12:27" },
        { variant: "out", text: "Done! See you at the market", time: "12:28", status: "delivered" },
      ],
    },
  },

  disclaimer: "Data charges may apply. Check with your network provider for details.",

  connect: {
    title: "Connect with people and businesses with ease.",
    body: "Swap contacts in person with BuzzDrop, then find products, homes and services on Depot. Nobody needs your phone number.",
    imageAlt: "One hand passes parcels to another person's open hands",
  },

  band: {
    title: "Finding professionals and handymen hasn't been any easier.",
    cta: { label: "Explore Pro Mode", href: "/pro" },
  },

  features: [
    {
      id: "buzz-id",
      title: "You control what you share.",
      body: "Give people your Buzz ID, like @adaeze.buzz, instead of your phone number. Chats are end-to-end encrypted, and you decide who can reach you.",
      link: { label: "How Buzz ID works", href: "/app" },
      image: { src: "/images/home/lock.jpg", alt: "", width: 365, height: 340 },
    },
    {
      id: "safety",
      title: "[Safety headline: to be written]",
      body: "Buzz works with verified police and security agencies, and with people near you, to send safety alerts for your area. Alerts are opt-in, and security updates have their own colour so they're hard to miss.",
      link: { label: "How safety alerts work", href: "/safety" },
    },
  ],

  // The estate group inside the feature-row phone (§9.1)
  estate: {
    group: "Estate Residents (Block C)",
    members: "[members] members",
    alert: {
      title: "Security update",
      body: "Road blocked at [location]. Avoid the area.",
      area: "Within [radius] of [location]",
      time: "10:30",
    },
    messages: [
      { from: "Mr Bello", text: "Morning all. Gate code changes on Monday", time: "09:58" },
      { from: "Mrs Okafor", text: "Thank you sir. Who has the new code?", time: "10:02" },
      { from: "me", text: "I'll share it here once I get it", time: "10:05", status: "read" },
    ],
  },

  quiet: {
    title: "More people. Even less noise.",
    body: "Share your Buzz ID instead of your number, and choose who can reach you.",
    image: {
      src: "/images/home/flowers.jpg",
      alt: "A smiling woman lying in a bed of flowers",
      width: 1366,
      height: 902,
    },
  },

  connections: {
    title: "All the right connections, from payments to delivery.",
    partners: [
      { name: "SunPay", role: "Payments and escrow" },
      { name: "Buzz Logistics", role: "Delivery for Depot orders" },
    ],
    // Truth rule 3: no partner logos until confirmed
    pendingSlots: 3,
    note: "Payments on Buzz are handled by SunPay.",
  },
} as const;
