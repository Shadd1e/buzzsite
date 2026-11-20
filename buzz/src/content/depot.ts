/**
 * Depot copy (DESIGN.md §9.4). Depot is the marketplace: merchants sell
 * products, landlords list houses, handymen offer services; search by
 * location, price and category; prices can show in local currency;
 * SunPay escrow; delivery by Buzz Logistics (PRODUCT.md).
 *
 * Listings below are SAMPLES for illustration (labelled on the page).
 * No listing photos exist yet, so cards show visible [photo] placeholders.
 */

export type DepotCategory = "products" | "housing" | "handymen";

export interface SampleListing {
  id: string;
  title: string;
  category: DepotCategory;
  price: number;
  /** e.g. "per year", "per visit" */
  unit?: string;
  seller: string;
  area: string;
  /** Placeholder photo height ratio, for the masonry rhythm */
  ratio: "tall" | "square" | "wide";
  live?: boolean;
  video?: boolean;
}

export const depotPage = {
  meta: {
    title: "Depot",
    description:
      "Buy products, rent homes and hire handymen on Depot. Chat before you pay, pay with SunPay escrow, and get delivery by Buzz Logistics.",
  },

  hero: {
    convo: {
      label: "A buyer asks a landlord about a flat on Depot",
      landlord: { name: "Mrs Adebayo" },
      messages: [
        { variant: "out", text: "Hi, is the 2-bedroom in Lekki still available?", time: "09:12", status: "read" },
        { variant: "in", text: "Yes o. You fit come see am on Saturday", time: "09:14" },
        { variant: "out", text: "Saturday works. I'll message you that morning", time: "09:15", status: "delivered" },
      ],
    },
    title: "Buy, rent or hire, from people you can actually reach.",
    lede: "Depot is where merchants sell, landlords list homes and handymen offer their services. Every listing comes with a chat, so you can ask before you pay.",
    searchLabel: "Search sample listings",
    searchPlaceholder: "Try “ankara”, “Lekki” or “plumber”",
    chips: [
      { id: "all", label: "All" },
      { id: "products", label: "Products" },
      { id: "housing", label: "Housing" },
      { id: "handymen", label: "Handymen" },
    ],
    filtersNote: "On Depot you can also filter by location and price.",
  },

  listings: {
    title: "Sample listings",
    note: "For illustration only. Real listings arrive when Depot launches.",
    empty: "No sample listings match that search. Try another word, or pick All.",
    items: [
      { id: "l1", title: "Ankara fabric, 6 yards", category: "products", price: 18500, seller: "Ada's Fabrics", area: "Yaba", ratio: "tall", live: true },
      { id: "l2", title: "2-bedroom flat", category: "housing", price: 2400000, unit: "per year", seller: "Landlord", area: "Lekki Phase 1", ratio: "wide" },
      { id: "l3", title: "Electrical repairs", category: "handymen", price: 15000, unit: "per visit", seller: "Emeka Fix-It", area: "Surulere", ratio: "square" },
      { id: "l4", title: "Shea butter body cream", category: "products", price: 6500, seller: "Naturally Kemi", area: "Ikeja", ratio: "square", video: true },
      { id: "l5", title: "Plumbing and leak repairs", category: "handymen", price: 12000, unit: "per visit", seller: "Sule Plumbing", area: "Gbagada", ratio: "tall" },
      { id: "l6", title: "Self-contained room", category: "housing", price: 650000, unit: "per year", seller: "Landlord", area: "Akoka", ratio: "square" },
      { id: "l7", title: "Bead necklace set", category: "products", price: 22000, seller: "Beads by Funke", area: "Lekki", ratio: "wide", live: true },
      { id: "l8", title: "Perfume oil set", category: "products", price: 14000, seller: "Scent Hub", area: "Victoria Island", ratio: "tall" },
      { id: "l9", title: "Generator servicing", category: "handymen", price: 10000, unit: "per visit", seller: "PowerFix", area: "Ikorodu", ratio: "square" },
      { id: "l10", title: "Laptop bag", category: "products", price: 31000, seller: "Carry Co.", area: "Ikeja", ratio: "square" },
    ] satisfies SampleListing[],
  },

  categories: {
    title: "Three ways to use Depot",
    items: [
      {
        id: "products",
        title: "Products",
        body: "From fabrics to phone accessories, sold by merchants you can message first.",
        image: {
          src: "https://images.pexels.com/photos/36855821/pexels-photo-36855821.jpeg?auto=compress&cs=tinysrgb&w=1200",
          alt: "A street vendor in a Lagos market displaying accessories",
          credit: "Ademola Adeola, Pexels",
        },
      },
      { id: "housing", title: "Housing", body: "Flats and rooms listed by landlords. Ask questions in chat before you visit." },
      { id: "handymen", title: "Handymen", body: "Electricians, plumbers and more. Ask about the job in chat first." },
    ],
  },

  safety: {
    title: "Built so you don't get scammed",
    rows: [
      {
        title: "Your money waits in escrow",
        body: "SunPay holds your payment until you confirm the order arrived, or releases it after 5 days unless you open a dispute.",
        link: { label: "How payments work", href: "/payments" },
      },
      { title: "Chat before you pay", body: "Every listing opens a chat with the seller, so you can ask questions or for more photos first." },
      { title: "Search that fits how you shop", body: "Filter by location, price and category. Prices can show in your local currency." },
      {
        title: "Delivery by Buzz Logistics",
        body: "Depot orders can be delivered by Buzz Logistics partners, with a tracking ID and a delivery code.",
        link: { label: "About Buzz Logistics", href: "/logistics", external: true },
      },
    ],
  },

  cta: {
    title: "Shop and sell on Depot when Buzz launches.",
    body: "Join the waitlist to hear first.",
    action: { label: "Join the waitlist", href: "/waitlist" },
  },
} as const;
