/**
 * Buzz Web shell (DESIGN.md §11): no brand nav or footer. The app fills the
 * window; the web-shell theme is set inside, where the theme state lives.
 */
export default function WebLayout({ children }: { children: React.ReactNode }) {
  return <main id="main">{children}</main>;
}
