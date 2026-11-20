import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

/** Marketing site shell (DESIGN.md §8.1): brand nav, page, navy footer. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
