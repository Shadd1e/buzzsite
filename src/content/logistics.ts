/**
 * Logistics home copy (DESIGN.md §10.1). Confirmed (PRODUCT.md): Depot-only
 * at launch; coverage types intrastate, interstate, international (Africa);
 * delivery code for home delivery, one-time pickup code for pickup; public
 * tracking shows status, last scan city and time, and partner name, never a
 * rider. NOT confirmed (§13): the coverage city list, shown as [placeholders].
 */

export const logisticsNav = {
  home: { href: "/logistics", label: "Buzz Logistics home" },
  area: "Logistics",
  links: [
    { href: "/logistics/track", label: "Track a parcel" },
    { href: "/logistics/how-it-works", label: "How it works" },
    { href: "/logistics/coverage", label: "Coverage" },
    { href: "/logistics/partners", label: "Partners" },
  ],
  actions: [
    { href: "/logistics/portal/login", label: "Partner sign in", variant: "outline" as const },
    { href: "/waitlist", label: "Join the waitlist", variant: "solid" as const, external: true },
  ],
};

export const logisticsHome = {
  meta: {
    title: "Buzz Logistics: track a Depot parcel",
    description:
      "Track any parcel bought on Depot with its tracking ID. No app needed. Logistics companies can apply to deliver for Depot.",
  },

  hero: {
    title: "Track any Depot parcel. No app needed.",
    lede: "Enter the tracking ID from your order to see where your parcel is, which partner has it and when it was last scanned.",
  },

  track: {
    label: "Tracking ID",
    placeholder: "BZT-XXXX-XXXX",
    help: "It's in your Depot order. It starts with BZT-, like BZT-7Q4K-19XM.",
    submit: "Track parcel",
    scan: "Scan QR",
    errors: {
      empty: "Enter your tracking ID. It starts with BZT-.",
      format: "That doesn't look like a tracking ID. Check it against your order: BZT, then two groups of four letters or numbers, like BZT-7Q4K-19XM.",
    },
    scanner: {
      title: "Scan the parcel label",
      description: "Point your camera at the QR code on the parcel label.",
      starting: "Starting the camera…",
      denied: "Camera access is off. Allow it in your browser settings, or close this and type the tracking ID instead.",
      unavailable: "This browser can't use the camera. Close this and type the tracking ID instead.",
      notTracking: "That QR code isn't a Buzz tracking label. Try the code on the parcel label.",
      close: "Close scanner",
    },
  },

  // Signature (§10.1): the journey line. Illustrative route and times.
  journey: {
    title: "Every scan shows up here.",
    lede: "Each time your parcel is scanned on the way, the tracking page updates with the city and the time. You see where it's been, never where a rider is.",
    caption: "Illustration. The route and times are examples.",
    label: "Example tracking updates for a parcel going from Lagos to Abuja",
    stops: [
      { city: "Lagos", text: "Picked up in Lagos", time: "09:12" },
      { city: "Ibadan", text: "Scanned in Ibadan", time: "11:48" },
      { city: "Benin", text: "Scanned in Benin", time: "14:20" },
      { city: "Onitsha", text: "Scanned in Onitsha", time: "17:05" },
      { city: "Abuja", text: "Arrived in Abuja", time: "Next day, 09:40" },
    ],
  },

  paths: {
    title: "What brings you here?",
    buyer: {
      title: "I'm waiting for a parcel",
      body: "Track it with the tracking ID from your Depot order. Choosing home delivery or pickup happens in the Buzz app.",
      action: { label: "Track a parcel", href: "/logistics/track" },
      example: "BZT-7Q4K-19XM",
    },
    partner: {
      title: "I run a logistics company",
      body: "Deliver Depot orders, set your own per-km rates and get paid as soon as each delivery is done.",
      action: { label: "Partner with Buzz", href: "/logistics/partners" },
      points: ["Depot delivery volume", "Paid immediately per delivery", "Your own rates"],
    },
  },

  // A real sequence, so numbering is correct (§12)
  how: {
    title: "From Depot order to your door",
    steps: [
      { title: "You order on Depot", body: "The seller hands your parcel to a Buzz Logistics partner." },
      { title: "The partner labels it", body: "Your parcel gets a QR label with its tracking ID." },
      { title: "It's scanned on the way", body: "Every pickup and checkpoint scan updates your tracking page." },
      { title: "You get it with a code", body: "Give the rider your delivery code, or collect it at a pickup point with your pickup code." },
    ],
    link: { label: "See how it works", href: "/logistics/how-it-works" },
  },

  coverage: {
    title: "Where we deliver",
    lede: "Buzz Logistics delivers orders bought on Depot. Partners cover three kinds of route.",
    areas: [
      { title: "Intrastate", body: "Within the same state, like across Lagos." },
      { title: "Interstate", body: "Between states, like Lagos to Abuja." },
      { title: "International (Africa)", body: "From Nigeria to other African countries." },
    ],
    pending: "[Cities and countries: to be confirmed]",
    link: { label: "See coverage", href: "/logistics/coverage" },
  },

  cta: {
    title: "Buy on Depot, track it here.",
    body: "Buzz isn't in the app stores yet. Join the waitlist and we'll tell you when it's live.",
    action: { label: "Join the waitlist", href: "/waitlist" },
  },
} as const;

/**
 * Partners copy (DESIGN.md §10.1). Confirmed (PRODUCT.md logistics rules):
 * Depot-only at launch; guided application → documents → details → virtual
 * meeting → inspection with a score → approval and a company code; partners
 * register and verify their own riders; partner sets a per-km rate, Buzz adds
 * 3% (adjustable per agreement); partners are paid immediately, Buzz's share
 * settles immediately or at T+2; Buzz covers damage only when the fault is
 * proven to be Buzz's. NOT confirmed: order volumes, response times. No
 * numbers are invented; amounts are [placeholders].
 */
export const logisticsPartners = {
  meta: {
    title: "Partner with Buzz Logistics",
    description:
      "Deliver Depot orders with your own riders and your own per-km rates, and get paid as soon as each delivery is done. Apply online.",
  },

  hero: {
    title: "Deliver Depot orders with your riders and your rates.",
    lede: "Buzz Logistics is run by partner companies. You set your price per km, register your own riders and get paid as soon as each delivery is done.",
    cta: { label: "Apply to partner", href: "/logistics/partners/apply" },
    convo: {
      label: "A logistics company owner asks Buzz Logistics about partnering",
      buzz: { name: "Buzz Logistics", system: "buzz" as const },
      messages: [
        { variant: "out", text: "Hi, we run bikes and vans across Lagos and Ogun. Can we deliver Depot orders?", time: "10:02", status: "read" },
        { variant: "in", text: "Yes! Apply online, then book a video call with our partner team.", time: "10:04", typingFirst: true },
        { variant: "out", text: "Who sets the delivery price? And when do we get paid?", time: "10:05", status: "read" },
        { variant: "in", text: "You set your price per km and Buzz adds 3%. You're paid as soon as each delivery is done.", time: "10:06" },
      ],
    },
  },

  why: {
    title: "Why partner with Buzz",
    rows: [
      { title: "Orders from Depot", body: "People buy from sellers on Depot and choose delivery in the same app. Those orders go to partner companies like yours." },
      { title: "Paid immediately", body: "Your share of each delivery is paid as soon as it's delivered. Buzz's share settles separately, immediately or two days later." },
      { title: "Your own rates", body: "You set your price per km. You can add charges for high-value, fragile or large parcels." },
      { title: "Your own riders", body: "Register your riders in the partner portal and check them your way. Each one gets a rider code to sign in in the Buzz app." },
    ],
    price: {
      title: "How a delivery is priced",
      rows: [
        { label: "Your price per km", value: "₦[your rate]" },
        { label: "Distance", value: "[km]" },
        { label: "Extra charges (optional)", value: "Value, fragile, size" },
        { label: "Buzz fee", value: "3%" },
      ],
      total: { label: "You're paid", value: "When it's delivered" },
      note: "The Buzz fee can be adjusted in your partner agreement.",
    },
  },

  expect: {
    title: "What we ask of partners",
    lede: "Buyers trust a delivery because they trust who's carrying it. These are the basics every partner agrees to.",
    rows: [
      { title: "A registered, verified company", body: "You'll give your CAC number and confirm your company is registered and verified." },
      { title: "Signed partner documents", body: "The partner agreement, a data protection addendum and a rider verification declaration." },
      { title: "An inspection and a score", body: "After your video call, we inspect your operation and give it a score. Approval depends on it." },
      { title: "Verified riders", body: "You confirm every rider you register has passed your checks. Riders can't sign themselves up." },
      { title: "A scan at every handoff", body: "Riders scan each parcel at pickup, at checkpoints and at delivery, in the Buzz app." },
      { title: "Privacy for buyers", body: "You see only the receiver's name, how they prefer to be contacted and a verification question. Nothing more." },
      { title: "Care with parcels", body: "Your company handles damage claims, unless the fault is proven to be Buzz's." },
    ],
  },

  // A real sequence, so numbering is correct (§12)
  process: {
    title: "How to become a partner",
    steps: [
      { title: "Apply online", body: "Tell us about your company, services and coverage, and upload your signed documents." },
      { title: "Book a video call", body: "Pick a date and time that suits you to talk with our partner team." },
      { title: "Inspection and score", body: "We look at your operation, riders and hubs, and give you a score." },
      { title: "Get your company code", body: "Once approved, you get your company code by email and can add your riders." },
    ],
    note: "You can save your application and finish it later. [How long each step takes: to be confirmed]",
  },

  cta: {
    title: "Ready to deliver for Depot?",
    body: "The application takes you through each step and explains why we ask.",
    action: { label: "Apply to partner", href: "/logistics/partners/apply" },
    secondary: { label: "Partner sign in", href: "/logistics/portal/login" },
  },
} as const;
