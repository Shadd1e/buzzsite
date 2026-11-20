/**
 * The App page copy (DESIGN.md §9.2). Facts from PRODUCT.md only; unconfirmed
 * details are visible [placeholders]. Plain English everywhere, including chat bubbles.
 */

export const appPage = {
  meta: {
    title: "The App",
    description:
      "Chats, voice notes and groups, a Buzz ID instead of your phone number, BuzzDrop for swapping contacts in person, and 24-hour Status.",
  },

  hero: {
    title: "Chat like you always do. Share less of yourself.",
    lede: "Chats, voice notes, groups and Status, the way you already use them. People reach you through your Buzz ID, so your phone number stays yours.",
    cta: { label: "Join the waitlist", href: "/waitlist" },
    convo: {
      label: "Tobi tells his mum he has landed in Abuja",
      tobi: { name: "Tobi" },
      messages: [
        { variant: "in", text: "Mum, I've landed in Abuja", time: "18:42" },
        { variant: "out", text: "Thank God! Did you eat on the flight?", time: "18:43", status: "read" },
        { variant: "in", voice: "0:14", time: "18:44" },
        { variant: "in", typingFirst: true, text: "Driver is here. I'll call you when I reach", time: "18:45" },
      ],
    },
  },

  // Feature stage: the phone on the right swaps screens as you scroll (§9.2)
  stage: {
    title: "One app, four things you'll use every day",
    features: [
      {
        id: "chats",
        name: "Chats",
        title: "Chats that feel like texting a friend.",
        body: "One-to-one and group chats with voice notes, photos, video, stickers and GIFs. Every chat is end-to-end encrypted.",
      },
      {
        id: "buzz-id",
        name: "Buzz ID",
        title: "A handle people can find you by.",
        body: "Your Buzz ID, like @adaeze.buzz, is what you share instead of your phone number. Give it out freely and keep your number private.",
      },
      {
        id: "buzzdrop",
        name: "BuzzDrop",
        title: "Swap contacts in person, number-free.",
        body: "Meet someone, scan each other's code and you're connected. Neither of you sees the other's phone number.",
      },
      {
        id: "status",
        name: "Status",
        title: "Updates that disappear after 24 hours.",
        body: "Share a moment that's gone tomorrow. Security updates from verified sources sit in their own row, in their own colour, so they're never lost among the rest.",
      },
    ],
  },

  bento: {
    title: "The small things, done properly",
    items: {
      groups: { title: "Groups", body: "Family, estate, class or church: one place for everyone, with voice notes and photos." },
      status: { title: "Status", body: "Gone after 24 hours. Security updates get their own red ring." },
      stickers: { title: "Stickers and GIFs", body: "Say it the way you'd say it in person." },
      encryption: { title: "Encryption", body: "Chats are end-to-end encrypted. Not even Buzz can read them." },
      web: { title: "Buzz Web", body: "Chat on a computer. Scan a code with your phone to link it.", link: { label: "Open Buzz Web", href: "/web" } },
    },
  },

  buzzId: {
    title: "Your Buzz ID is the only number people need.",
    body: "Share your handle on flyers, your shop sign or your socials. People can message you, and your phone number never leaves your phone.",
    handle: "@adaeze.buzz",
    phone: "+234 800 000 4417",
  },

  cta: {
    title: "Be ready when Buzz arrives.",
    body: "Join the waitlist and we'll tell you when the app is in the stores.",
    action: { label: "Join the waitlist", href: "/waitlist" },
  },
} as const;
