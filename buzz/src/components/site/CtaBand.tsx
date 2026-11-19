import { ButtonLink } from "@/components/Button";

/**
 * The CTA band near the end of each marketing page (DESIGN.md §9), in the
 * homepage's band layout: heading and one line on the left, a light pill on
 * the right. It sits on --blue-600 (white text 4.6:1), not the homepage's
 * --blue-500 band, so the 18px body line meets 4.5:1 too.
 */
export function CtaBand({
  title,
  body,
  action,
  secondary,
}: {
  title: string;
  body?: string;
  action: { label: string; href: string };
  secondary?: { label: string; href: string; external?: boolean };
}) {
  return (
    <section aria-labelledby="cta-title" className="bg-blue-600 py-16 md:py-24">
      <div className="container-page flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2
            id="cta-title"
            className="max-w-[16em] text-[clamp(28px,3.2vw,40px)] leading-[1.12] font-light tracking-[-0.025em] text-white"
          >
            {title}
          </h2>
          {body && <p className="mt-3 max-w-[34em] text-[18px] leading-relaxed text-white">{body}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <ButtonLink href={action.href} variant="light" size="lg">
            {action.label}
          </ButtonLink>
          {secondary && (
            <ButtonLink
              href={secondary.href}
              variant="outline"
              size="lg"
              external={secondary.external}
              className="border-white/70 bg-transparent text-white hover:border-white hover:bg-white/10"
            >
              {secondary.label}
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
