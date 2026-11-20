import Link from "next/link";

/**
 * List rows (DESIGN.md §8: rows, not card soup): a title and one line on the
 * left, an optional text link on the right. Used for "what's inside",
 * shortcuts and safety tips on marketing pages.
 */
export function LinkRows({
  rows,
}: {
  rows: ReadonlyArray<{ title: string; body: string; link?: { label: string; href: string } }>;
}) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {rows.map((r) => (
        <li key={r.title} className="grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline">
          <div>
            <h3 className="text-h3">{r.title}</h3>
            <p className="mt-2 max-w-[34em] text-body text-ink-700">{r.body}</p>
          </div>
          {r.link && (
            <Link
              href={r.link.href}
              className="inline-flex min-h-11 items-center text-[15px] font-semibold text-blue-600 underline decoration-blue-600/30 underline-offset-4 transition-colors duration-(--dur-1) ease-out hover:decoration-blue-600"
            >
              {r.link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
