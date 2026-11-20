/**
 * Buzz Web copy (DESIGN.md §11). Product register: short, plain, task-first.
 * The app path for pairing is unconfirmed (§13), so it carries [confirm].
 */

export const webCopy = {
  meta: {
    title: "Buzz Web",
    description: "Use your Buzz chats on a computer. Scan the code with the Buzz app on your phone.",
  },

  pairing: {
    title: "Use Buzz on your computer",
    steps: [
      "Open Buzz on your phone",
      "Tap Me, then Linked devices",
      "Point your phone at this code",
    ],
    pathNote: "[Confirm exact app path]",
    keepSignedIn: "Keep me signed in",
    keepSignedInHint: "Stay linked on this computer after you close the tab.",
    encrypted: "Your messages stay end-to-end encrypted.",
    refreshesIn: (s: number) => `New code in ${s}s`,
    qrLabel: "QR code to link this computer to your Buzz account",
    expired: {
      title: "This code has expired",
      body: "Codes stop working after a few minutes, for your security.",
      action: "Get a new code",
    },
    scanning: { title: "Check your phone", body: "Approve the link on your phone to continue." },
    syncing: { title: "Syncing your chats", body: "Keep Buzz open on your phone until this finishes." },
    offline: {
      title: "Your phone is offline",
      body: "Connect your phone to the internet, then try again.",
      action: "Try again",
    },
    test: {
      label: "Test controls",
      scan: "Simulate phone scan (test)",
      expire: "Expire code now (test)",
      offline: "Simulate phone offline (test)",
    },
  },

  session: {
    expired: {
      title: "Your session has expired",
      body: "For your security, Buzz Web signs out after a while. Link this computer again to carry on.",
      action: "Link again",
    },
    loggedOut: {
      title: "You've logged out of Buzz Web",
      body: "Your chats are still on your phone. Link this computer again whenever you need it.",
      action: "Link again",
    },
  },

  phoneOnly: {
    title: "Buzz Web works best on a computer.",
    body: "Open the Buzz app on your phone instead.",
    action: { label: "Back to buzz.com", href: "/" },
  },

  app: {
    chats: "Chats",
    updates: "Updates",
    search: "Search chats",
    filters: [
      { id: "all", label: "All" },
      { id: "unread", label: "Unread" },
      { id: "groups", label: "Groups" },
      { id: "pro", label: "Pro" },
    ],
    noResults: "No chats match your search.",
    noFilterResults: { unread: "You're all caught up.", groups: "No groups yet.", pro: "No chats with Pro accounts yet.", all: "No chats yet." },
    welcome: {
      title: "Buzz Web",
      body: "Send and receive messages from your computer. Keep your phone connected to the internet.",
    },
    emptyChat: "Say hello. Messages are end-to-end encrypted.",
    composer: "Type a message",
    offline: {
      title: "Your phone is offline",
      body: "Messages will send when it reconnects.",
    },
    notAvailable: "Not available in this test build.",
    bell: { title: "Notifications", empty: "No notifications.", markRead: "Mark all as read", delivery: "Delivery" },
    info: {
      title: "Chat info",
      media: "Media, links and docs",
      mediaEmpty: "Nothing shared in this chat yet.",
      orders: "Shared orders",
      ordersEmpty: "No orders in this chat.",
      members: "Members",
      pro: "Pro account",
      proBody: "This is a business on Buzz Pro. Its Pro ID is separate from the owner's personal Buzz ID.",
    },
    tracking: {
      title: "Order tracking",
      codeNote: "Your delivery code is in the Buzz app on your phone. Only share it when the parcel is in your hands.",
      notFound: "We couldn't find tracking for this order.",
      history: "History",
      partner: "Delivered by",
      lastScan: "Last scan",
    },
    updatesView: {
      security: "Security updates",
      securityHint: "From verified agencies and people near you. In an emergency, call 112.",
      status: "Status",
      statusHint: "Disappears after 24 hours.",
      pick: "Pick an update to read it here.",
      verified: "Verified source",
    },
    theme: { label: "Theme", system: "Match my computer", light: "Light", dark: "Dark" },
    menu: { logout: "Log out" },
    test: {
      label: "Test controls",
      offline: "Phone offline (test)",
      expire: "Expire session (test)",
    },
  },
} as const;
