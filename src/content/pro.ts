/**
 * Buzz Pro copy (DESIGN.md §9.3). Confirmed in PRODUCT.md: Pro Mode is a
 * switch inside Buzz giving a Storefront, a separate Pro ID, a Business
 * Centre and Showcase / Creator Toolbox; features differ by profession; Pro
 * can be paused or switched off. Which tools each profession gets is NOT
 * confirmed, so each profession lists only confirmed tools that fit, plus a
 * visible placeholder.
 */

export type ProTool = "storefront" | "proId" | "businessCentre" | "showcase";

export const toolNames: Record<ProTool, string> = {
  storefront: "Storefront",
  proId: "Pro ID",
  businessCentre: "Business Centre",
  showcase: "Showcase and Creator Toolbox",
};

/** What each confirmed tool does, in one line (shown in the switcher) */
export const toolLines: Record<ProTool, string> = {
  storefront: "Your products or services, with prices, in one place.",
  proId: "A business handle that isn't your personal number.",
  businessCentre: "Orders and payments in one list.",
  showcase: "Short videos of your work, with a Shop now button.",
};

export const proPage = {
  meta: {
    title: "Buzz Pro",
    description:
      "Pro Mode gives your business a Storefront, a separate Pro ID, a Business Centre and Showcase, inside the app your customers already use.",
  },

  hero: {
    title: "Your business, on the app your customers already use.",
    lede: "Switch on Pro Mode and your business gets its own Pro ID, a Storefront and a Business Centre. Customers find you, message you and pay you without ever needing your personal number.",
    cta: { label: "Join the waitlist", href: "/waitlist" },
    card: {
      name: "Emeka Fix-It",
      profession: "Electrician",
      area: "Surulere",
      proId: "@emekafixit.buzz",
      note: "Sample Pro ID",
    },
    convo: {
      label: "A customer books an electrician through his Pro ID",
      emeka: { name: "Emeka Fix-It" },
      messages: [
        { variant: "out", text: "Good afternoon. My kitchen sockets stopped working", time: "14:02", status: "read" },
        { variant: "in", text: "Sorry about that ma. I can come tomorrow by 10", time: "14:05" },
        { variant: "booking", text: "Booking: Tomorrow, 10:00", time: "14:05" },
        { variant: "out", text: "Perfect, see you then", time: "14:06", status: "delivered" },
      ],
    },
  },

  switcher: {
    title: "Pro works the way your trade works",
    lede: "Pick a profession to see the tools it uses.",
    placeholder: "[Profession-specific tools: to be confirmed]",
    professions: [
      { id: "merchant", name: "Merchant", line: "Sell products from your Storefront and keep every order in one list.", tools: ["storefront", "businessCentre", "proId"], example: { kind: "product", title: "Ankara fabric, 6 yards", meta: "₦18,500" } },
      { id: "landlord", name: "Landlord", line: "Show your homes and talk to tenants without sharing your number.", tools: ["storefront", "proId", "businessCentre"], example: { kind: "home", title: "2-bedroom flat, Lekki", meta: "₦2,400,000 per year" } },
      { id: "lawyer", name: "Lawyer", line: "Let clients reach your practice through a Pro ID that isn't your personal line.", tools: ["proId", "businessCentre", "storefront"], example: { kind: "proid", title: "@[practice].buzz", meta: "Sample Pro ID" } },
      { id: "handyman", name: "Handyman", line: "List your services with prices and agree jobs in chat.", tools: ["storefront", "proId", "businessCentre"], example: { kind: "service", title: "Electrical repairs, Surulere", meta: "₦15,000 per visit" } },
      { id: "creator", name: "Creator", line: "Show your work in short videos and sell from them.", tools: ["showcase", "storefront", "proId"], example: { kind: "video", title: "Adire scarf", meta: "Shop now" } },
      { id: "tailor", name: "Tailor", line: "Show your designs and take orders in chat.", tools: ["showcase", "storefront", "businessCentre"], example: { kind: "video", title: "Aso oke set, made to measure", meta: "Shop now" } },
    ] satisfies Array<{ id: string; name: string; line: string; tools: ProTool[]; example: { kind: "product" | "home" | "proid" | "service" | "video"; title: string; meta: string } }>,
  },

  products: {
    title: "Three tools that come with Pro",
    storefront: {
      title: "Storefront",
      body: "Your products and services in one place, with prices customers can see before they message you.",
      items: [
        { name: "Ankara fabric, 6 yards", price: 18500 },
        { name: "Aso oke set", price: 42000 },
        { name: "Adire scarf", price: 7500 },
        { name: "Lace, 5 yards", price: 26000 },
      ],
    },
    businessCentre: {
      title: "Business Centre",
      body: "Orders, bookings and payments in one list, so nothing gets lost in your chats.",
    },
    showcase: {
      title: "Showcase and Creator Toolbox",
      body: "Short videos of your work, with a Shop now button that takes customers straight to the item.",
    },
  },

  pause: {
    title: "Pause or switch off Pro any time.",
    body: "Taking a break or closing for the season? Pause Pro, or switch it off and go back to your personal Buzz. You can turn it on again when you're ready.",
  },

  cta: {
    title: "Get your business ready for Buzz.",
    body: "Join the waitlist and be among the first to switch on Pro Mode.",
    action: { label: "Join the waitlist", href: "/waitlist" },
  },
} as const;
