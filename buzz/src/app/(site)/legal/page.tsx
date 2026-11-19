import { redirect } from "next/navigation";

/** /legal has no index of its own; the switcher lives on each document. */
export default function LegalIndex() {
  redirect("/legal/privacy");
}
