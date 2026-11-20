/**
 * Legal pages (DESIGN.md §9.12). Drafts pending legal review (PRODUCT.md
 * truth rule 7): section headings and draft notes only, carried over from the
 * earlier review build. No operative legal text is invented here; every
 * section body is a visible placeholder.
 */

export interface LegalDoc {
  slug: string;
  title: string;
  short: string;
  summary: string;
  sections: string[];
  draftNote: string;
}

export const legalDocs: LegalDoc[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    short: "Privacy",
    summary: "How Buzz handles personal information.",
    sections: ["Information collected", "How information is used", "Sharing and service providers", "Retention and deletion", "User rights and requests", "Children and age requirements", "International transfers", "Security measures and limitations", "Contact and complaints"],
    draftNote: "The approved data inventory, service providers, retention schedule, user-rights process and legal entity details have not been supplied. This draft must not be published as the operative privacy notice.",
  },
  {
    slug: "terms",
    title: "Terms of Use",
    short: "Terms",
    summary: "The terms that govern use of the Buzz platform.",
    sections: ["Who provides the platform", "Eligibility and accounts", "Acceptable use", "User content and intellectual property", "Marketplace and third-party services", "Payments and SunPay relationship", "Buzz Logistics and independent providers", "Availability and service changes", "Liability and disclaimers", "Suspension, termination and disputes"],
    draftNote: "The legal entity, governing law, dispute process, platform responsibilities and service-specific terms require legal approval. This draft is not a binding agreement.",
  },
  {
    slug: "community-guidelines",
    title: "Community Guidelines",
    short: "Community",
    summary: "A clearer standard for taking part in Buzz.",
    sections: ["Respectful participation", "Harassment and harmful conduct", "Spam, scams and impersonation", "Prohibited content", "Reporting and review", "Moderation actions and appeals", "Safety-related content"],
    draftNote: "The final moderation policy, enforcement actions, appeal process and reporting workflow have not been supplied. This draft is not an approved policy.",
  },
  {
    slug: "safety-guidelines",
    title: "Safety Guidelines",
    short: "Safety",
    summary: "Practical guidance and clear limits for safety features.",
    sections: ["Use of safety features", "Security updates and information quality", "Incident reports and evidence", "Location and permissions", "Trusted contacts and safety controls", "Emergency situations", "Limitations and third-party response"],
    draftNote: "Buzz does not guarantee rescue, prevention, incident verification, emergency dispatch or law-enforcement response. In an emergency, call 112. Feature availability and the approved safety policy require confirmation.",
  },
  {
    slug: "marketplace-terms",
    title: "Marketplace Terms",
    short: "Marketplace",
    summary: "Responsibilities when buying, renting and hiring on Depot.",
    sections: ["Marketplace role and boundaries", "Buyer responsibilities", "Seller and professional responsibilities", "Listing accuracy and pricing", "Property roles and authority", "Prohibited goods and services", "Transactions and payment boundaries", "Complaints and disputes"],
    draftNote: "Seller verification, listing moderation, prohibited-goods rules, transaction responsibilities and dispute handling require approved operational and legal documentation.",
  },
  {
    slug: "payment-terms",
    title: "Payment Terms",
    short: "Payments",
    summary: "The roles and rules for SunPay payments and escrow.",
    sections: ["Buzz and SunPay relationship", "Payment processing responsibilities", "Funds custody", "Escrow eligibility and conditions", "Release triggers", "Refunds and reversals", "Disputes and support", "Methods, currencies and fees"],
    draftNote: "Processor, custody, escrow, release, refund, dispute and support details need written confirmation from the responsible parties. This draft is not an approved payment policy.",
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    short: "Cookies",
    summary: "How website cookies and similar technologies are used.",
    sections: ["Essential site functionality", "Analytics and measurement", "Preference storage", "Third-party services", "Consent and preference changes", "Retention and contact"],
    draftNote: "The final website analytics provider, cookie inventory, consent mechanism and retention details must be confirmed after integrations are selected. This draft is not an approved cookie notice.",
  },
  {
    slug: "logistics-terms",
    title: "Logistics Terms",
    short: "Logistics",
    summary: "The responsibilities behind delivering Depot orders.",
    sections: ["Delivery scope", "Buzz coordination role", "Independent provider responsibilities", "Pickup, transit and delivery", "Tracking and status information", "Fees and pricing", "Prohibited goods", "Loss, damage and claims", "Insurance and liability", "Customs, duties and taxes", "Delays and exceptions"],
    draftNote: "Provider contracts, actual coverage, insurance, claims, prohibited goods, customs responsibilities, fees and service exceptions have not been supplied. This draft must not be treated as delivery terms.",
  },
];
