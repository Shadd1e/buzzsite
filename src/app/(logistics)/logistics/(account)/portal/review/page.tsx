import type { Metadata } from "next";
import { ReviewStatus } from "@/components/account/ReviewStatus";
import { logisticsAccount } from "@/content/logistics";

/**
 * Everything here depends on the account cookie, which only the browser reads,
 * so the server never renders this segment. Opt out of the instant-navigation
 * check, as the other request-time pages do.
 */
export const instant = false;

export const metadata: Metadata = { title: logisticsAccount.review.meta.title };

/** Review status (DESIGN.md §10.1): pending company and individual accounts land here after sign in. */
export default function ReviewPage() {
  return <ReviewStatus />;
}
