/**
 * Help Centre copy (DESIGN.md §9.11). Every answer states a PRODUCT.md fact;
 * anything unconfirmed is a visible [placeholder]. Help pages are Read mode:
 * plain, short, task-first.
 */

export type HelpTopicId =
  | "getting-started"
  | "chats-privacy"
  | "depot"
  | "payments"
  | "pro"
  | "safety"
  | "logistics";

export interface HelpArticle {
  slug: string;
  topic: HelpTopicId;
  title: string;
  summary: string;
  updated: string;
  /** Paragraphs; a string starting with "- " renders as a list item */
  body: string[];
  related: string[];
}

export const helpTopics: Array<{ id: HelpTopicId; title: string; body: string; icon: string }> = [
  { id: "getting-started", title: "Getting started", body: "Joining the waitlist, your account and your Buzz ID.", icon: "Sparkles" },
  { id: "chats-privacy", title: "Chats and privacy", body: "Messages, groups, BuzzDrop and who can reach you.", icon: "MessagesSquare" },
  { id: "depot", title: "Depot", body: "Buying, renting and hiring on the marketplace.", icon: "Store" },
  { id: "payments", title: "Payments and escrow", body: "How SunPay holds your money and what happens in a dispute.", icon: "Wallet" },
  { id: "pro", title: "Pro Mode", body: "Storefront, Pro ID, Business Centre and Showcase.", icon: "Briefcase" },
  { id: "safety", title: "Safety alerts", body: "Buzz Alerts, security updates and your areas.", icon: "ShieldAlert" },
  { id: "logistics", title: "Logistics and delivery", body: "Tracking a Depot parcel, delivery codes and pickup.", icon: "Truck" },
];

export const helpArticles: HelpArticle[] = [
  {
    slug: "join-the-waitlist",
    topic: "getting-started",
    title: "How to join the waitlist",
    summary: "Buzz isn't in the app stores yet. Join the waitlist to hear when it is.",
    updated: "19 Nov 2026",
    body: [
      "Buzz isn't in the app stores yet, so you can't download it today. Join the waitlist and we'll tell you when it's ready.",
      "Open the waitlist page, add your name and your phone number or email, pick your city and confirm you're happy to hear from us.",
      "[Launch date and platforms: to be confirmed]",
    ],
    related: ["what-is-a-buzz-id", "how-escrow-works"],
  },
  {
    slug: "what-is-a-buzz-id",
    topic: "chats-privacy",
    title: "What is a Buzz ID?",
    summary: "A handle people use to reach you instead of your phone number.",
    updated: "19 Nov 2026",
    body: [
      "Your Buzz ID is a handle, like @adaeze.buzz. You share it instead of your phone number.",
      "Anyone with your Buzz ID can message you. Your phone number stays private.",
      "To swap contacts in person, use BuzzDrop: you scan each other's code and neither of you sees the other's number.",
      "Chats on Buzz are end-to-end encrypted.",
    ],
    related: ["join-the-waitlist", "how-safety-alerts-work"],
  },
  {
    slug: "buying-on-depot",
    topic: "depot",
    title: "Buying, renting or hiring on Depot",
    summary: "Find products, homes and handymen, chat first, then pay with SunPay.",
    updated: "19 Nov 2026",
    body: [
      "Depot is Buzz's marketplace. Merchants sell products, landlords list homes and handymen offer services.",
      "Search by location, price and category. Prices can show in your local currency.",
      "Every listing has a chat, so you can ask questions before you pay.",
      "When you pay for a Depot order, SunPay holds the money in escrow until you confirm the order arrived.",
    ],
    related: ["how-escrow-works", "track-a-parcel"],
  },
  {
    slug: "how-escrow-works",
    topic: "payments",
    title: "How escrow works",
    summary: "SunPay holds your payment until you confirm, or releases it after 5 days unless you open a dispute.",
    updated: "19 Nov 2026",
    body: [
      "When you pay for a Depot order, SunPay holds the money. The seller isn't paid yet.",
      "When the order arrives, confirm it in the app and SunPay pays the seller.",
      "If you don't confirm or open a dispute, the money is released to the seller after 5 days.",
      "If something is wrong, open a dispute within those 5 days. The money stays held while Buzz reviews it.",
      "[Fees, currencies and dispute timings: to be confirmed]",
    ],
    related: ["buying-on-depot", "track-a-parcel"],
  },
  {
    slug: "what-is-pro-mode",
    topic: "pro",
    title: "What is Pro Mode?",
    summary: "A switch that gives your business a Storefront, Pro ID, Business Centre and Showcase.",
    updated: "19 Nov 2026",
    body: [
      "Pro Mode is a switch inside Buzz for businesses and professionals.",
      "- Storefront: your products or services, with prices.",
      "- Pro ID: a business handle, separate from your personal Buzz ID.",
      "- Business Centre: your orders and payments in one place.",
      "- Showcase and Creator Toolbox: show your work.",
      "Features differ by profession. You can pause Pro or switch it off at any time.",
      "[Profession-specific features: to be confirmed]",
    ],
    related: ["what-is-a-buzz-id", "buying-on-depot"],
  },
  {
    slug: "how-safety-alerts-work",
    topic: "safety",
    title: "How safety alerts work",
    summary: "Buzz Alerts come from verified agencies and people near you. They're opt-in.",
    updated: "19 Nov 2026",
    body: [
      "Buzz Alerts come from verified police and security agencies, and from real users near an event.",
      "Alerts are tied to a location. You turn them on and choose your areas.",
      "Security updates sit in their own row in Updates, in their own colour.",
      "Buzz is not an emergency service. In an emergency, call 112.",
    ],
    related: ["what-is-a-buzz-id"],
  },
  {
    slug: "track-a-parcel",
    topic: "logistics",
    title: "Tracking a Depot parcel",
    summary: "Track with your tracking ID, no app needed. Delivery and pickup use codes.",
    updated: "19 Nov 2026",
    body: [
      "Depot orders are delivered by Buzz Logistics partners. Each parcel has a tracking ID, like BZT-7Q4K-19XM.",
      "You can track it on the Buzz Logistics site without the app. You'll see the status, the last city it was scanned in and the delivery company. A rider's name, phone or location is never shown.",
      "For home delivery, give the rider your 4-digit delivery code. For pickup by someone else, add their name in the app to get a new one-time pickup code.",
      "Pickup points keep parcels free for 5 days.",
    ],
    related: ["buying-on-depot", "how-escrow-works"],
  },
];

export const helpPage = {
  meta: {
    title: "Help Centre",
    description: "Answers about Buzz: your Buzz ID, Depot, SunPay escrow, Pro Mode, safety alerts and delivery.",
  },
  hero: {
    title: "How can we help?",
    searchLabel: "Search help articles",
    placeholder: "Try “escrow”, “Buzz ID” or “delivery code”",
    empty: "No articles match that. Try another word, or browse the topics below.",
  },
  topicsTitle: "Browse by topic",
  // Confirmed rules only (PRODUCT.md logistics + payments rules)
  safe: {
    title: "Staying safe on Buzz",
    lede: "A few habits that protect your money and your parcels.",
    rows: [
      { title: "Pay through SunPay, inside Buzz", body: "Escrow only protects payments made through SunPay. If a seller asks you to pay another way, don't.", link: { label: "How escrow works", href: "/help/how-escrow-works" } },
      { title: "Give your delivery code only at the door", body: "Share your 4-digit delivery code when the parcel is in your hands, not before." },
      { title: "Sending someone to collect?", body: "Add their name in the app to get a new pickup code. Only the latest code works, and the hub checks their ID.", link: { label: "Tracking and pickup", href: "/help/track-a-parcel" } },
      { title: "Never share passwords or codes", body: "Not in chats, and not with anyone who says they work for Buzz." },
      { title: "In an emergency, call 112", body: "Buzz shares safety alerts, but it is not an emergency service.", link: { label: "How safety alerts work", href: "/help/how-safety-alerts-work" } },
    ],
  },
  faq: {
    title: "Common questions",
    items: [
      { q: "When can I download Buzz?", a: "Buzz isn't in the app stores yet. Join the waitlist and we'll tell you when it is. [Launch date: to be confirmed]" },
      { q: "Do people see my phone number?", a: "No. People reach you through your Buzz ID. BuzzDrop also swaps contacts without showing numbers." },
      { q: "When is the seller paid?", a: "When you confirm your order arrived. If you don't confirm or open a dispute, SunPay releases the money after 5 days." },
      { q: "Is Buzz an emergency service?", a: "No. In an emergency, call 112. Buzz shares safety alerts from verified agencies and people near you." },
      { q: "Can I track a parcel without the app?", a: "Yes. Use your tracking ID on the Buzz Logistics site." },
    ],
  },
  stuck: {
    title: "Still stuck?",
    body: "Send us a message and tell us what you were trying to do.",
    action: { label: "Contact us", href: "/contact" },
  },
} as const;
