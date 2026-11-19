/**
 * Contact copy (DESIGN.md §9.9). The only confirmed address is
 * hello@aetherjade.space (§9.8). This build is front end only, so the form
 * says plainly that messages aren't sent yet.
 */

export type ContactTopicId = "general" | "app" | "business" | "logistics" | "media" | "careers";

export interface ContactTopic {
  id: ContactTopicId;
  title: string;
  body: string;
  icon: string;
  subject: string;
  helper: string;
  extra?: { id: string; label: string; placeholder?: string; optional?: boolean };
}

export const contactPage = {
  meta: {
    title: "Contact",
    description: "Get in touch with the Buzz team at Aether Jade Innovation: questions, partnerships, logistics, press and careers.",
  },
  hero: {
    title: "Talk to the Buzz team.",
    lede: "Pick what your message is about and we'll make sure it reaches the right people.",
  },
  topics: [
    { id: "general", title: "General", body: "Anything else about Buzz.", icon: "MessageCircle", subject: "General question", helper: "Tell us what's on your mind." },
    { id: "app", title: "Help with the app", body: "Accounts, chats, payments or alerts.", icon: "LifeBuoy", subject: "Help with the app", helper: "Say what you were trying to do and what happened. Never send passwords or codes." },
    {
      id: "business",
      title: "Business and partnerships",
      body: "Working with Buzz, Pro and Depot.",
      icon: "Handshake",
      subject: "Business or partnership",
      helper: "Tell us about your business and what you'd like to do together.",
      extra: { id: "company", label: "Company name" },
    },
    {
      id: "logistics",
      title: "Logistics partners",
      body: "Delivering Depot orders with Buzz Logistics.",
      icon: "Truck",
      subject: "Logistics partnership",
      helper: "Tell us where you deliver and how many riders you have. You can also apply directly on the partner page.",
      extra: { id: "company", label: "Company name" },
    },
    {
      id: "media",
      title: "Media and press",
      body: "Interviews, stories and assets.",
      icon: "Newspaper",
      subject: "Media enquiry",
      helper: "Tell us about the story and your deadline.",
      extra: { id: "outlet", label: "Publication or outlet" },
    },
    {
      id: "careers",
      title: "Careers",
      body: "Working at Aether Jade Innovation.",
      icon: "Briefcase",
      subject: "Careers",
      helper: "Tell us what you'd like to work on. You can add a link to your CV or portfolio.",
      extra: { id: "link", label: "Link to CV or portfolio", placeholder: "https://", optional: true },
    },
  ] satisfies ContactTopic[],
  form: {
    title: "Your message",
    sent: "Thanks. This is a test build, so your message wasn't sent. Please email hello@aetherjade.space instead.",
  },
  channels: {
    title: "Other ways to reach us",
    rows: [
      { label: "Email", value: "hello@aetherjade.space", href: "mailto:hello@aetherjade.space" },
      { label: "Phone", value: "[Phone line: to be confirmed]" },
      { label: "Office", value: "[Office address: to be confirmed]" },
      { label: "Social", value: "[Social accounts: to be confirmed]" },
    ],
    note: "In an emergency, call 112. Buzz is not an emergency service.",
  },
} as const;
