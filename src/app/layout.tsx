import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

// No web font: DESIGN.md §1/§3.1 use the system stack (SF Pro on Apple,
// Roboto on Android). Nothing to download, which suits metered data.

export const metadata: Metadata = {
  title: {
    default: "Buzz: One HUB that plugs you to everything",
    template: "%s · Buzz",
  },
  description:
    "Buzz brings chats, a marketplace, safe payments and safety alerts into one app. Join the waitlist.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
