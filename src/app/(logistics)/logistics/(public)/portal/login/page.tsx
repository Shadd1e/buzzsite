import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Convo, type ConvoMessage } from "@/components/chat";
import { PartnerJump } from "@/components/logistics/signin/PartnerJump";
import { PartnerSignIn } from "@/components/logistics/signin/PartnerSignIn";
import { RiderSignIn } from "@/components/logistics/signin/RiderSignIn";
import { SignInPhoto } from "@/components/logistics/signin/SignInPhoto";
import { logisticsLogin } from "@/content/logistics";

export const metadata: Metadata = {
  title: logisticsLogin.meta.title,
  description: logisticsLogin.meta.description,
};

/**
 * Sign in. Built from rider-sign-in.html in Buzz's own type and blue: a white
 * rider card beside a photo panel on a mist page. The orchestrated moment is
 * a short rider conversation popping in over the photo (glass bubbles, like
 * the homepage hero). Partner staff get a matching card below, linked from
 * the foot of the rider card.
 */
export default function SignInPage() {
  const c = logisticsLogin;
  const buzz = { name: "Buzz Logistics", system: "buzz" as const };
  const messages: ConvoMessage[] = [
    { variant: "out", content: c.chat.rider, time: "07:42", status: "read" },
    {
      variant: "in",
      sender: buzz,
      showName: true,
      content: c.chat.buzz,
      time: "07:42",
      typingFirst: true,
    },
    { variant: "system", sender: buzz, content: c.chat.batch, time: "08:15" },
  ];

  return (
    <div className="bg-mist">
      <section aria-labelledby="page-title" className="pt-6 pb-8 md:pb-8">
        <div className="container-page grid items-stretch gap-8 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-7 rounded-panel border border-line bg-white p-5 min-[400px]:p-6 sm:p-12">
            <div>
              <h1
                id="page-title"
                className="text-[clamp(38px,3.4vw,48px)] leading-[1.05] font-light tracking-[-0.03em]"
              >
                {c.title}
              </h1>
              <p className="mt-3 text-[17px] leading-normal text-ink-700">
                {c.lede}
              </p>
            </div>

            <Suspense>
              <RiderSignIn copy={c} />
            </Suspense>

            <div className="mt-auto flex flex-col gap-2 border-t border-line pt-5 text-[14px] text-ink-700">
              <p>
                {c.riderSignup.prompt}{" "}
                <Link
                  href={c.riderSignup.href}
                  className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700"
                >
                  {c.riderSignup.label}
                </Link>
                . {c.companyRiderHelp.prompt}{" "}
                <Link
                  href={c.companyRiderHelp.href}
                  className="font-semibold text-blue-700 underline decoration-blue-700/30 underline-offset-4 hover:decoration-blue-700"
                >
                  {c.companyRiderHelp.label}
                </Link>
                .
              </p>
              <p>
                {c.partnerJump.prompt}{" "}
                <Suspense
                  fallback={
                    <a
                      href="#partner"
                      className="font-semibold text-blue-700 underline underline-offset-4"
                    >
                      {c.partnerJump.label}
                    </a>
                  }
                >
                  <PartnerJump label={c.partnerJump.label} />
                </Suspense>
              </p>
            </div>
          </div>

          {/* Stacked (phones, tablets): the chat sits under the photo, since the
              rider fills a nearly square photo and bubbles would cover him.
              Side by side (desktop): over the open sky at the top. */}
          <div className="relative flex min-w-0 flex-col gap-4">
            <SignInPhoto src={c.photo.src} alt={c.photo.alt} className="flex-1">
              <span className="absolute bottom-6 left-6 rounded-full bg-white px-[18px] py-2.5 text-[14px] font-semibold text-ink-900">
                {c.photo.pill}
              </span>
            </SignInPhoto>
            <Convo
              messages={messages}
              panel={false}
              glass
              delay={300}
              label={c.chat.label}
              className="w-full max-w-[400px] self-end lg:absolute lg:top-6 lg:right-6 lg:w-[360px]"
            />
          </div>
        </div>
      </section>

      <Suspense>
        <PartnerSignIn copy={c} />
      </Suspense>
    </div>
  );
}
