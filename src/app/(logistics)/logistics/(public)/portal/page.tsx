import { redirect } from "next/navigation";

/**
 * The partner portal shell is Phase D (DESIGN.md §10.2). Until it's built,
 * /logistics/portal sends partners to sign in rather than a 404.
 */
export default function PortalPage() {
  redirect("/logistics/portal/login");
}
