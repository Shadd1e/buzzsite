import Link from "next/link";
import { Logo } from "@/components/Logo";

// Holding page until the homepage is built (BUILD-GUIDE.md Phase B).
// It replaces the create-next-app template, whose classes no longer exist
// now that the default Tailwind palette is cleared.
export default function Home() {
  return (
    <main className="container-page flex min-h-dvh flex-col items-start justify-center gap-6">
      <Logo size="lg" />
      <p className="max-w-[34em] text-lede text-ink-700">
        The homepage isn&apos;t built yet. The design foundations are ready to review.
      </p>
      <Link href="/dev/components" className="text-[16px] font-semibold text-blue-600 underline-offset-4 hover:underline">
        See every component
      </Link>
    </main>
  );
}
