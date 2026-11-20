import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { logisticsNav } from "@/content/logistics";

/**
 * Logistics public site shell (DESIGN.md §10.1, brand register, lighter):
 * the brand nav with the logistics links, the page, the navy footer.
 * The partner portal lives outside this group and gets its own shell.
 */
export default function LogisticsPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Nav
        label="Buzz Logistics"
        home={logisticsNav.home}
        area={logisticsNav.area}
        links={logisticsNav.links}
        actions={logisticsNav.actions}
      />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
