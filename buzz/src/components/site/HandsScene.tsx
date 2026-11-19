import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The homepage hands (DESIGN.md §9.1): the giving hand and parcels slide in
 * from the right, the open hands from the left, meeting in the middle as the
 * section scrolls through (CSS view timeline; static where unsupported or
 * with reduced motion).
 *
 * Both arms are cropped photos, so each layer is anchored to its own edge of
 * the viewport (as in the template): the crops fall off-screen instead of
 * showing as hard vertical cuts. Sizes use container units, capped at 1600px.
 *
 * The give cut-out already contains receiving hands, so it is clipped to the
 * giver (the cut runs through empty background, below the box), and the
 * separate receive cut-out supplies the open hands.
 */
const W = "min(100cqw, 1600px)";

export function HandsScene({ alt, className }: { alt: string; className?: string }) {
  return (
    <div className={cn("@container w-full overflow-hidden", className)}>
      <div role="img" aria-label={alt} className="relative w-full" style={{ height: `calc(${W} * 771 / 1366)` }}>
        <div className="scroll-from-right absolute top-0 right-0 h-full" style={{ width: W }}>
          <Image
            src="/images/home/hands-give.png"
            alt=""
            fill
            sizes="(min-width: 1600px) 1600px, 100vw"
            className="object-contain object-right [clip-path:polygon(0_0,100%_0,100%_100%,57%_100%,57%_69%,0_69%)]"
          />
        </div>
        <div className="scroll-from-left absolute top-[67%] left-0" style={{ width: `calc(${W} * 0.57)` }}>
          <Image
            src="/images/home/hands-receive.png"
            alt=""
            width={800}
            height={251}
            sizes="(min-width: 1600px) 912px, 57vw"
            className="h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}
