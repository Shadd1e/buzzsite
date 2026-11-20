/**
 * Payments copy (DESIGN.md §9.5). Confirmed (PRODUCT.md): SunPay escrow holds
 * payment until the buyer confirms, or releases it automatically after
 * 5 days unless a dispute is opened. NOT confirmed (§13): fees, currencies,
 * dispute details beyond the 5-day window: shown as [placeholders].
 */

export const paymentsPage = {
  meta: {
    title: "Payments",
    description:
      "SunPay holds your money in escrow until you confirm your order arrived, or releases it after 5 days unless you open a dispute.",
  },

  hero: {
    title: "Your money waits until you're happy.",
    lede: "When you buy on Depot, SunPay holds your payment in escrow. The seller is paid when you confirm the order arrived.",
    cta: { label: "Join the waitlist", href: "/waitlist" },
    convo: {
      label: "A buyer pays for a bag and SunPay holds the money",
      seller: { name: "Carry Co." },
      sunpay: { name: "SunPay", system: "sunpay" },
      messages: [
        { variant: "out", text: "I'll take the brown laptop bag", time: "10:14", status: "read" },
        { variant: "in", text: "Great choice! Pay on Depot and I'll send it today", time: "10:15" },
        { variant: "system", text: "₦[AMOUNT] is held in escrow. Carry Co. is paid when you confirm the bag arrived.", time: "10:18" },
        { variant: "out", text: "Paid. Thank you!", time: "10:18", status: "delivered" },
      ],
    },
  },

  // The escrow track (§9.5): a real sequence, so numbered markers are correct
  track: {
    title: "How escrow works",
    stops: [
      { title: "You pay", body: "Pay for your Depot order in the app." },
      { title: "SunPay holds it", body: "The money waits safely in escrow." },
      { title: "You confirm", body: "When your order arrives, confirm it in the app." },
      { title: "Seller is paid", body: "SunPay releases the money to the seller." },
    ],
    note: "If you don't confirm or open a dispute, SunPay releases the money to the seller after 5 days. [When the 5 days start: to be confirmed]",
  },

  disputes: {
    title: "If something goes wrong",
    rows: [
      { title: "Open a dispute within 5 days", body: "If the item is wrong, damaged or didn't arrive, open a dispute before the 5 days are up. The money stays in escrow." },
      { title: "Show what happened", body: "Your chat with the seller and any photos you add help settle it." },
      { title: "Buzz reviews the case", body: "Buzz staff look at what both sides shared. [Dispute review steps and timings: to be confirmed]" },
    ],
    example: {
      label: "Example dispute chat between a buyer and a seller",
      buyer: { name: "Ifeanyi N. (buyer)" },
      seller: { name: "Carry Co. (seller)" },
      sunpay: { name: "SunPay", system: "sunpay" },
    },
  },

  fees: {
    title: "Fees and currencies",
    body: "[Fees and supported currencies: to be confirmed]",
  },

  cta: {
    title: "Pay safely from day one.",
    body: "Join the waitlist and we'll tell you when Buzz and SunPay are live.",
    action: { label: "Join the waitlist", href: "/waitlist" },
  },
} as const;
