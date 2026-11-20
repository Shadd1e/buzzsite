/**
 * Homepage copy (DESIGN.md §9.1). Facts come from PRODUCT.md only.
 * Anything unconfirmed is a visible [placeholder]. Voice: plain, warm,
 * direct; plain English everywhere, including chat bubbles.
 */

export const home = {
  meta: {
    title: "Buzz: One HUB that plugs you to everything",
    description:
      "Chat, buy and sell on Depot, pay safely with SunPay escrow, get your order delivered and receive safety alerts from verified agencies, all in one app. Join the waitlist.",
  },

  hero: {
    title: "One HUB that plugs you to everything.",
    subline: "Chat, shop, pay safely, get it delivered and stay alert, in one app.",
    cta: { label: "Join the waitlist", href: "/waitlist" },
    image: {
      src: "/images/home/hero-phone.jpg",
      alt: "A woman smiling at her phone while holding a cup of tea",
      width: 1325,
      height: 829,
    },
    // Hero bubbles: outgoing / incoming with photo avatar / outgoing (§9.1).
    // Tells the chat-to-checkout story; on phones the third bubble is hidden,
    // so the second one has to finish the thought on its own.
    convo: {
      label: "Two friends chatting about a bag one of them bought on Depot",
      contact: { name: "Amaka", src: "/images/avatar-chat-sample.png" },
      messages: [
        { variant: "out", text: "Where did you get that bag?", time: "12:26", status: "read" },
        { variant: "in", text: "Depot. SunPay held my money until it arrived", time: "12:27" },
        { variant: "out", text: "Send me the link, please!", time: "12:28", status: "delivered" },
      ],
    },
  },

  disclaimer: "Data charges may apply. Check with your network provider for details.",

  connect: {
    title: "Connect with people and businesses with ease.",
    body: "Find products, homes and services on Depot, ask the seller questions in chat, pay with SunPay escrow and track delivery with Buzz Logistics. It all happens where you already talk.",
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
      body: "Give people your Buzz ID, like @adaeze.buzz, instead of your phone number, or swap contacts in person with BuzzDrop. Chats are end-to-end encrypted, and you decide who can reach you.",
      link: { label: "How Buzz ID works", href: "/app" },
      image: { src: "/images/home/lock.jpg", alt: "", width: 365, height: 340 },
    },
    {
      id: "safety",
      title: "Know what's happening on your street.",
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
    body: "Your chats, orders, payments and alerts sit in one app, instead of five apps competing for your attention.",
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
