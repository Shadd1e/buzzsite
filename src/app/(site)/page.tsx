import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/Button";
import { Convo, type ConvoMessage } from "@/components/chat";
import { EstatePhone } from "@/components/site/EstatePhone";
import { HandsScene } from "@/components/site/HandsScene";
import { home } from "@/content/home";

export const metadata: Metadata = {
  title: { absolute: home.meta.title },
  description: home.meta.description,
};

/**
 * Home (DESIGN.md §9.1), following reference/homepage-template.png.
 * The orchestrated moment: the hero text rises, then the bubbles pop in.
 */
export default function HomePage() {
  const { hero, connect, band, features, estate, quiet, connections } = home;

  const heroMessages: ConvoMessage[] = hero.convo.messages.map((m) =>
    m.variant === "in"
      ? { variant: "in", sender: hero.convo.contact, content: m.text, time: m.time }
      : { variant: "out", content: m.text, time: m.time, status: "status" in m ? m.status : undefined },
  );

  return (
    <>
      {/* 1. Hero: full-bleed photo, headline bottom-left, bubbles top-right.
          The photo runs edge to edge (no radius, DESIGN.md §7 full-bleed);
          the text and bubbles stay on the page container. */}
      <section aria-labelledby="hero-title">
        <div className="relative isolate h-[calc(100svh-72px)] min-h-[600px] max-h-[820px] overflow-hidden md:h-[min(86vh,820px)]">
          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover object-[68%_0%] md:object-[70%_35%]"
          />
          <div aria-hidden="true" className="scrim absolute inset-0 -z-10" />
          {/* Extra bottom-up shade so the headline holds 3:1 over bright patches */}
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-3/5 bg-linear-to-t from-navy/55 to-transparent md:h-2/3 md:from-navy/50" />

          <div className="container-page relative flex h-full flex-col justify-end">
            {/* Phones: bubbles sit above the headline so the face stays clear.
                Tablet and up: top-right, as in the template. */}
            <div className="pb-2 max-sm:[&_[role=log]>div:nth-child(3)]:hidden sm:ml-auto sm:w-[340px] md:absolute md:top-10 md:right-10 md:w-[300px] md:p-0">
              <Convo
                messages={heroMessages}
                panel={false}
                glass
                start="mount"
                delay={950}
                label={hero.convo.label}
              />
            </div>

            <div className="pt-4 pb-8 md:pb-14">
              <h1 id="hero-title" className="rise max-w-[11em] text-h1 text-white">
                {hero.title}
              </h1>
              <p className="rise mt-4 max-w-[26em] text-lede text-white [--rise-delay:120ms]">
                {hero.subline}*
              </p>
              <div className="rise mt-7 [--rise-delay:220ms]">
                <ButtonLink href={hero.cta.href} variant="sky" size="lg">
                  {hero.cta.label}
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
        {/* 2. Disclaimer */}
        <p className="container-page mt-3 text-right text-small text-ink-500">* {home.disclaimer}</p>
      </section>

      {/* 3. Connect: mist + live gradient, hands meet on scroll */}
      <section aria-labelledby="connect-title" className="aurora mt-16 bg-mist pt-18 md:mt-24 md:pt-26">
        <div className="container-page text-center">
          <h2 id="connect-title" className="mx-auto max-w-[14em] text-h2">
            {connect.title}
          </h2>
          <p className="mx-auto mt-5 max-w-[30em] text-lede text-ink-700">{connect.body}</p>
        </div>
        <HandsScene alt={connect.imageAlt} className="mt-10 md:mt-14" />
      </section>

      {/* 4. Blue band */}
      <section aria-labelledby="band-title" className="bg-blue-500 py-16 md:py-24">
        <div className="container-page flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <h2 id="band-title" className="max-w-[16em] text-[clamp(28px,3.2vw,40px)] leading-[1.12] font-light tracking-[-0.025em] text-white">
            {band.title}
          </h2>
          <ButtonLink href={band.cta.href} variant="light" size="lg" className="shrink-0">
            {band.cta.label}
          </ButtonLink>
        </div>
      </section>

      {/* 5. Feature rows */}
      <section aria-label="What Buzz does" className="container-page section-y flex flex-col gap-24 md:gap-32">
        {features.map((f, i) => (
          <article
            key={f.id}
            aria-labelledby={`${f.id}-title`}
            className="grid items-center gap-10 md:grid-cols-2 md:gap-16"
          >
            <div className={i % 2 === 1 ? "flex justify-center md:order-2" : "flex justify-center"}>
              {"image" in f && f.image ? (
                <Image
                  src={f.image.src}
                  alt={f.image.alt}
                  width={f.image.width}
                  height={f.image.height}
                  sizes="(min-width: 768px) 320px, 260px"
                  className="h-auto w-[260px] md:w-[320px]"
                />
              ) : (
                <EstatePhone {...estate} />
              )}
            </div>
            <div className={i % 2 === 1 ? "md:order-1" : undefined}>
              <h2 id={`${f.id}-title`} className="max-w-[12em] text-h2">
                {f.title}
              </h2>
              <p className="mt-5 max-w-[32em] text-body text-ink-700">{f.body}</p>
              <Link
                href={f.link.href}
                className="mt-6 inline-flex min-h-11 items-center text-[16px] font-semibold text-blue-600 underline decoration-blue-600/30 underline-offset-4 transition-colors duration-(--dur-1) ease-out hover:decoration-blue-600"
              >
                {f.link.label}
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* 6. Full-bleed flowers photo */}
      <section aria-labelledby="quiet-title" className="relative isolate flex min-h-[560px] items-end md:min-h-[720px]">
        <Image
          src={quiet.image.src}
          alt={quiet.image.alt}
          fill
          sizes="100vw"
          className="-z-10 object-cover object-[50%_30%]"
        />
        <div aria-hidden="true" className="scrim absolute inset-0 -z-10" />
        <div className="container-page pb-14 md:pb-20">
          <div className="scroll-rise max-w-[26em]">
            <h2 id="quiet-title" className="max-w-[9em] text-h2 text-white">
              {quiet.title}
            </h2>
            <p className="mt-4 text-lede text-white">{quiet.body}</p>
          </div>
        </div>
      </section>

      {/* 7. Connections */}
      <section aria-labelledby="connections-title" className="container-page section-y text-center">
        <h2 id="connections-title" className="mx-auto max-w-[16em] text-[clamp(30px,3.4vw,44px)] leading-[1.1] font-light tracking-[-0.03em]">
          {connections.title}
        </h2>
        <ul className="mx-auto mt-12 grid max-w-[1080px] grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          {connections.partners.map((p) => (
            <li key={p.name} className="flex flex-col items-center justify-center gap-1 rounded-field border border-line px-4 py-5">
              <span className="text-[19px] font-bold tracking-[-0.02em] text-ink-900">{p.name}</span>
              <span className="text-[13px] text-ink-500">{p.role}</span>
            </li>
          ))}
          {Array.from({ length: connections.pendingSlots }, (_, i) => (
            <li
              key={i}
              className="flex items-center justify-center rounded-field border-[1.5px] border-dashed border-line-strong px-4 py-5 text-[14px] text-ink-500 last:col-span-2 md:last:col-span-1"
            >
              [Partner logo pending]
            </li>
          ))}
        </ul>
        <p className="mt-8 text-small text-ink-500">{connections.note}</p>
      </section>
    </>
  );
}
