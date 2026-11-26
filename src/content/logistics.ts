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
    { href: "/logistics/signup", label: "Deliver with us" },
  ],
  actions: [
    { href: "/logistics/portal/login", label: "Sign in", variant: "outline" as const },
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
      body: "Deliver Depot orders with your riders, set your own per-km rates and get paid as soon as each delivery is done.",
      action: { label: "Apply to partner", href: "/logistics/partners/apply" },
      more: { label: "How partnering works", href: "/logistics/partners" },
      points: ["Depot delivery volume", "Paid immediately per delivery", "Your own rates"],
    },
    rider: {
      title: "I ride on my own",
      body: "Deliver with your own vehicle, set your own per-km rate and get paid after each delivery. We inspect your vehicle before you start.",
      action: { label: "Sign up as a rider", href: "/logistics/riders/apply" },
      signIn: { label: "Rider sign in", href: "/logistics/portal/login?rider=individual" },
      points: ["Your own rate per km", "Paid after each delivery", "Scan in the Buzz app"],
    },
    // Company riders never sign up: their company registers them
    companyRider: {
      before: "Ride for a logistics company? Your company registers you and gives you your codes.",
      label: "What to ask your company",
      href: "/logistics/signup?as=company-rider",
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
      "Deliver the orders Depot sellers and Buzz buyers place, as a logistics company or an individual rider. Your rates, paid after every delivery. Apply online.",
  },

  hero: {
    title: "Deliver Depot orders on your terms.",
    lede: "Businesses and sellers on Depot sell to buyers who chat, shop and pay in Buzz, and every order needs carrying. Logistics companies and individual riders take those deliveries, set their own price per km and get paid as soon as each one is done.",
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
    title: "Why deliver with Buzz",
    rows: [
      { title: "A ready pool of orders", body: "Merchants, shops and businesses sell on Depot, and buyers check out right inside their chats. When a buyer picks delivery, the order goes to a partner or rider who covers that route. [Depot sellers, users and order volume: figures to be confirmed]" },
      { title: "Paid immediately", body: "Your share of each delivery is paid as soon as it's delivered. Buzz's share settles separately, immediately or two days later." },
      { title: "Your own rates", body: "You set your price per km. You can add charges for high-value, fragile or large parcels." },
      { title: "Batching built in", body: "Scan a second parcel while one is in hand and the Buzz app links them under one mother QR. One scan updates the whole batch, and you unlink each parcel as it's dropped." },
      { title: "Scanning in the Buzz app", body: "Riders scan at pickup, checkpoints and delivery on their phone. No extra scanner to buy, and every scan updates the buyer's tracking page." },
      { title: "Chat without swapping numbers", body: "Reach a receiver on Buzz when that's how they like to be contacted, so neither side gives out a phone number. Customer care handles everything else." },
      { title: "One portal for the whole operation", body: "Register your riders and check them your way, then follow parcels, batches, rates, payouts and flags on your phone or computer. Individual riders get the same view of their own deliveries." },
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
    secondary: { label: "Partner sign in", href: "/logistics/portal/login?as=partner#partner" },
  },
  // Not a company? Other ways in (one ecosystem: every path is linked)
  otherPaths: {
    rider: { before: "Riding on your own instead?", label: "Sign up as an individual rider", href: "/logistics/riders/apply" },
    companyRider: { before: "Ride for a partner company?", label: "Your company registers you", href: "/logistics/signup?as=company-rider" },
  },
} as const;

/**
 * Track copy (DESIGN.md §10.1). Public tracking shows status, scan cities and
 * times, and the partner name: never a rider's name, phone or live location,
 * and never the receiver's details or codes (PRODUCT.md privacy rule).
 * Confirmed rules used in the state notes: 4-digit delivery code; one-time
 * pickup code for someone else; 5 free storage days, then a partner-set
 * daily fee, return to seller after 10 days; up to 2 delivery attempts;
 * refused parcels: 5 days to dispute, otherwise refund minus delivery cost;
 * SunPay releases payment on confirmation or after 5 days.
 */
export const logisticsTrack = {
  meta: {
    title: "Track a parcel",
    description: "Enter your tracking ID to see where your Depot parcel is. No app needed.",
  },
  hero: {
    title: "Track a parcel",
    lede: "Enter the tracking ID from your Depot order. You'll see each scan on the way, the city and the time.",
  },
  where: {
    title: "Where to find your tracking ID",
    rows: [
      { title: "In your Depot order", body: "Open the order in the Buzz app. The tracking ID is under the delivery details." },
      { title: "On the parcel label", body: "The QR label on the parcel shows the tracking ID. On a phone, tap Scan QR to read it with your camera." },
      { title: "From the seller", body: "Sellers can see the tracking ID for every order they send." },
    ],
  },
  privacy: "We show the city and time of each scan. We never show who's carrying your parcel or where they are right now.",

  result: {
    another: "Track another parcel",
    labels: {
      trackingId: "Tracking ID",
      partner: "Delivered by",
      type: "Delivery",
      lastScan: "Last scan",
    },
    deliveryType: { home: "Home delivery", pickup: "Pickup" },
    timelineTitle: "Updates",
    batchTag: "Batch scan",
    batchHelp: "Updated when the partner scanned the batch this parcel travels in.",
    routeTitle: "Route",
    routeCaption: "Cities where it's been scanned. Not a live location.",
    actionsTitle: "What you can do",
    actions: {
      choose: { title: "Choose home delivery or pickup", body: "Pick how you want to receive it in the Buzz app, under your Depot order." },
      someone: { title: "Send someone to collect", body: "Add their name in the app to get a one-time pickup code for them. They'll need ID that matches the name." },
      help: { title: "Questions about this delivery?", body: "Contact customer care in the Buzz app. Have your tracking ID ready.", link: { label: "Help with delivery", href: "/help" } },
    },
  },

  notFound: {
    title: "We couldn't find that parcel",
    body: "Check the tracking ID against your Depot order and try again. It's BZT, then two groups of four letters or numbers, like BZT-7Q4K-19XM.",
    badFormat: "That doesn't look like a tracking ID.",
  },
};

/**
 * Sign in copy (DESIGN.md §10.1). Riders first: a rider with a partner
 * company (company code + rider code) or an individual rider (rider code +
 * password, or Buzz ID confirmed in the Buzz app). Partner staff sign in
 * lower down the page with email + password + 2FA. Front end only: there is
 * no auth service yet, so sign-in is simulated and says so.
 */
export const logisticsLogin = {
  meta: {
    title: "Sign in",
    description: "Riders and logistics partners sign in to Buzz Logistics here.",
  },
  title: "Rider sign in",
  lede: "See your deliveries, batches and earnings.",
  partnerJump: { prompt: "Partner staff?", label: "Sign in here" },
  // Sign up lives on its own page; company riders never sign up (their company registers them)
  riderSignup: { prompt: "New rider on your own?", label: "Sign up", href: "/logistics/riders/apply" },
  companyRiderHelp: { prompt: "Ride for a company and don't have codes?", label: "Ask your company", href: "/logistics/signup?as=company-rider" },
  partnerSignup: { prompt: "New logistics company?", label: "Apply to partner", href: "/logistics/partners/apply" },
  // Drop the photo at this path (public/). The panel stays Buzz blue until it exists.
  photo: {
    src: "/images/logistics/rider-sign-in.jpg",
    alt: "A dispatch rider in a helmet and riding gloves on his motorbike in Abuja",
    pill: "Ride on your own schedule",
  },
  riderKinds: {
    legend: "How do you ride?",
    company: "I ride with a partner",
    individual: "I ride on my own",
  },
  company: {
    intro: "Use the codes your company gave you when they registered you.",
    companyCode: { label: "Company code", help: "Starts with BZL-C-" },
    riderCode: { label: "Rider code", help: "Starts with R-" },
    submit: "Sign in",
    errors: {
      companyCode: "Enter your company code. It starts with BZL-C.",
      riderCode: "Enter your rider code. It starts with R-.",
    },
  },
  individual: {
    methods: { label: "Sign in with", code: "Rider code", buzz: "Buzz ID" },
    riderCode: { label: "Rider code", help: "Starts with BZL-I-" },
    password: { label: "Password" },
    submit: "Sign in",
    or: "or",
    buzzButton: "Sign in with Buzz ID",
    useCode: "Use your rider code instead",
    forgot: {
      label: "Forgot your password?",
      body: "You can sign in with your Buzz ID instead. To reset your password, contact the Buzz partner team.",
      useBuzz: "Sign in with Buzz ID",
      contact: { label: "Contact the partner team", href: "/contact" },
    },
    pendingHint: "Still waiting for your inspection? You don't have a rider code yet. Sign in with your Buzz ID.",
    errors: {
      riderCode: "Enter your rider code. It starts with BZL-I.",
      password: "Enter your password.",
    },
    buzz: {
      label: "Buzz ID",
      placeholder: "@yourname",
      help: "We'll send a sign-in request to the Buzz app on your phone.",
      submit: "Send request to my phone",
      format: "A Buzz ID is @ followed by 3 to 30 letters, numbers, dots or underscores, like @kelechi.rides.",
      waitingTitle: "Check your phone",
      waitingBody: "Open the Buzz app and tap Yes, it's me. If {id} has a rider account, the request is waiting there.",
      expiresIn: "The request ends in {time}.",
      expired: "The request ended before it was confirmed. Send a new one.",
      resend: "Send a new request",
      cancel: "Use a different Buzz ID",
      // Bubbles that stand in for the app's prompt
      promptFrom: "Buzz",
      prompt: "Sign-in request for Buzz Logistics on a web browser. Is this you?",
      promptYes: "Yes, it's me",
      promptNo: "No",
      simulate: "Simulate tapping Yes in the app (test)",
      noAccount: "Test build: no rider account uses this Buzz ID, so no phone would get the request.",
    },
  },
  riderOutcomes: {
    invalid: "Those codes don't match a rider. Check both and try again.",
    invalidIndividual: "That rider code and password don't match. Check both and try again.",
    attemptsLeft: "{n} tries left before sign in locks for 15 minutes.",
    attemptsLeftOne: "1 try left before sign in locks for 15 minutes.",
    locked: "Too many wrong tries. For your security, sign in with this rider code is locked until {time} WAT.",
    notVerified: "Your company registered you but hasn't finished verifying you. Ask them to complete it, then sign in.",
    inactive: "This rider code isn't active. Your company may have deactivated it. Contact them.",
    otherKind: {
      individual: "That's an individual rider code.",
      company_rider: "That's a company rider code.",
    },
    switchTo: {
      individual: "Sign in as a rider on your own",
      company_rider: "Sign in as a rider with a partner company",
    },
  },
  chat: {
    label: "Example conversation between a rider and Buzz",
    rider: "Morning. Signed in, heading to the Ikeja hub now.",
    buzz: "You have 6 parcels to collect there today.",
    batch: "Mother QR created. 2 parcels linked.",
    riderLater: "Scanning the rest as I pick them up.",
  },
  partner: {
    title: "Partner sign in",
    body: "For staff who manage a logistics company's riders, parcels and payouts.",
    open: "Sign in as partner staff",
    // A static Buzz note beside the form (the page's one motion moment is the rider chat above)
    note: "Partner accounts sign in in two steps: your password, then a 6-digit code from your authenticator app.",
    noteFrom: "Buzz Logistics",
  },
  fields: {
    email: { label: "Work email", placeholder: "you@company.com" },
    password: { label: "Password" },
    code: { label: "6-digit code", help: "From your authenticator app." },
  },
  steps: {
    signIn: "Continue",
    verify: "Sign in",
    back: "Use a different email",
    codeTitle: "Enter your 6-digit code",
    codeIntro: "Open your authenticator app and enter the code for",
    lostDevice: "Lost your authenticator? Ask your company's super admin, or contact the Buzz partner team.",
    testCode: "Test build: every 2FA code is 123456. A test account fills it in for you.",
  },
  errors: {
    email: "Enter your work email, like you@company.com.",
    password: "Enter your password.",
    code: "Enter the 6 digits from your authenticator app. Codes change every 30 seconds.",
  },
  forgot: {
    label: "Forgot your password?",
    body: "Ask your company's super admin to help you reset it. If you're the super admin, contact the Buzz partner team.",
    contact: { label: "Contact the partner team", href: "/contact" },
  },
  test: "Test build: there's no sign-in service yet. Every test password is Buzz-test-2026 and every 2FA code is 123456.",
  wrongCode: "That code didn't work. Check your authenticator app and enter the newest code.",
  outcomes: {
    invalid: "That email and password don't match an account. Check both and try again.",
    // {n} and {time} are filled in by the form (copy crosses to a client component, so no functions)
    attemptsLeft: "{n} tries left before the account locks for 15 minutes.",
    attemptsLeftOne: "1 try left before the account locks for 15 minutes.",
    locked: "Too many wrong passwords. For your security this account is locked until {time} WAT. Ask your super admin if you're stuck.",
    noAccess: "This account can't sign in. It was removed, or the invite hasn't been accepted yet. Ask your company's super admin.",
    codeExpired: "That sign-in attempt has ended (too many wrong codes, or more than 5 minutes passed). Enter your password again.",
    codeLeft: "{n} tries left.",
    codeLeftOne: "1 try left.",
    individualEmail: "This email belongs to an individual rider. Sign in as a rider at the top of this page.",
  },
  // Riders and pending accounts coming back from the rider area or review page
  riderNotices: {
    account_signed_out: "You've signed out.",
    account_expired: "You were signed out after 30 minutes without activity. Sign in again to carry on.",
    account_changed:
      "Your account changed since you signed in, so we signed you out. Sign in again. If your rider code was deactivated, contact your company.",
  },
  notices: {
    expired: "You were signed out after 30 minutes without activity. Sign in to carry on where you were.",
    signed_out: "You've signed out.",
    no_access: "Your account no longer has access to this portal. Ask your company's super admin.",
  },
  accounts: {
    title: "Test build: use a test account",
    use: "Use",
    // Partner list: one click checks the password and fills in the 2FA code
    signIn: "Sign in",
  },
};

/** Riders and pending accounts after sign in: review status page and rider area */
export const logisticsAccount = {
  review: {
    meta: { title: "Account review" },
    title: "Your account is being reviewed",
    intro: {
      company: "{company} is applying to be a Buzz Logistics partner. The full portal opens once your inspection passes.",
      individual: "Your rider dashboard opens once the inspection of your vehicle and papers passes.",
    },
    stepsLabel: "Where your review is",
    steps: {
      received: "Application received",
      documents: "Documents checked",
      booked: "Inspection booked",
      passed: "Inspection passed",
      live: "Account live",
    },
    receivedOn: "Received {date}.",
    checkedOn: "Checked {date}.",
    checking: "We're checking the documents you uploaded.",
    notBooked: "No inspection booked yet. The partner team will contact you.",
    reschedule: "Reschedule",
    score: "Score: {score} out of 100.",
    scoreLater: "Your score shows here after the inspection.",
    live: {
      company: "Once it passes, your company code arrives by email and the full portal opens.",
      individual: "Once it passes, you get your individual rider code and password for the Buzz app.",
    },
    inspectedTitle: "What we inspect",
    inspected: {
      company: ["Your offices", "Your hubs", "Your fleet"],
      individual: ["Your vehicle", "The vehicle papers you uploaded"],
    },
    contact: { before: "Questions about your review?", label: "Contact the Buzz partner team", href: "/contact" },
    dialog: {
      title: "Move your inspection?",
      description: "Pick a new time. Times are WAT.",
      slotsLabel: "Available times",
      confirm: "Move inspection",
      cancel: "Keep current time",
      pick: "Pick a time first.",
    },
    moved: "Inspection moved to {date}.",
    error: "We couldn't load your review. Refresh the page to try again.",
  },
};
