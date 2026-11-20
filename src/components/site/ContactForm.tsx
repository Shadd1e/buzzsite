"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Briefcase, CircleCheck, Handshake, LifeBuoy, MessageCircle, Newspaper, Truck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import type { ContactTopic, ContactTopicId } from "@/content/contact";
import { useReducedMotionAfterMount } from "@/lib/useReducedMotionAfterMount";
import { cn } from "@/lib/cn";

/**
 * Contact (DESIGN.md §9.9): selectable topic cards (native radios, so arrow
 * keys work) route the form: subject, helper text and sometimes an extra
 * field change. The moment: the form panel slides to the chosen topic.
 * Front end only: on submit it validates, then says honestly that nothing
 * was sent.
 */
const icons: Record<string, LucideIcon> = { MessageCircle, LifeBuoy, Handshake, Truck, Newspaper, Briefcase };

type Errors = Partial<Record<"name" | "contact" | "message" | "extra", string>>;

export function ContactForm({ topics, title, sent }: { topics: readonly ContactTopic[]; title: string; sent: string }) {
  const [topicId, setTopicId] = useState<ContactTopicId>("general");
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const reduce = useReducedMotionAfterMount();
  const topic = topics.find((t) => t.id === topicId) ?? topics[0];
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);
  const [attempt, setAttempt] = useState(0);

  // After a submit: focus the first invalid field, or the confirmation.
  useEffect(() => {
    if (attempt === 0) return;
    if (done) doneRef.current?.focus();
    else formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt, done]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Errors = {};
    if (!String(data.get("name") ?? "").trim()) next.name = "Add your name so we know who to reply to.";
    const contact = String(data.get("contact") ?? "").trim();
    if (!contact) next.contact = "Add an email address or phone number so we can reply.";
    else if (!/@/.test(contact) && !/^\+?[\d\s-]{7,}$/.test(contact))
      next.contact = "That doesn't look like an email or phone number. Check it and try again.";
    if (String(data.get("message") ?? "").trim().length < 10) next.message = "Add a few more words so we can help (at least 10 characters).";
    if (topic.extra && !topic.extra.optional && !String(data.get("extra") ?? "").trim())
      next.extra = `Add your ${topic.extra.label.toLowerCase()}.`;
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
    setAttempt((n) => n + 1);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
      <fieldset>
        <legend className="mb-4 text-h3">What&apos;s it about?</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {topics.map((t) => {
            const Icon = icons[t.icon];
            const on = t.id === topicId;
            return (
              <label
                key={t.id}
                className={cn(
                  "relative flex cursor-pointer gap-3 rounded-field border-[1.5px] bg-white p-4 transition-colors duration-(--dur-2) ease-out",
                  "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-sky-400",
                  on ? "border-blue-600 bg-blue-50" : "border-line hover:border-ink-500",
                )}
              >
                <input
                  type="radio"
                  name="topic"
                  value={t.id}
                  checked={on}
                  onChange={() => {
                    setTopicId(t.id);
                    setErrors({});
                  }}
                  className="sr-only"
                />
                <span aria-hidden="true" className={cn("grid size-10 shrink-0 place-items-center rounded-tile", on ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600")}>
                  <Icon className="size-5" strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold text-ink-900">{t.title}</span>
                  <span className="block text-[14px] leading-snug text-ink-700">{t.body}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="relative overflow-hidden rounded-convo bg-white p-6 ring-1 ring-line md:p-8">
        {done ? (
          <div role="status" className="flex flex-col items-start gap-4 py-6">
            <CircleCheck aria-hidden="true" className="size-8 text-ok-700" strokeWidth={1.6} />
            <p ref={doneRef} tabIndex={-1} className="text-section-title text-ink-900 outline-none">
              {topic.subject}
            </p>
            <p className="max-w-[32em] text-body text-ink-700">{sent}</p>
            <Button variant="outline" onClick={() => setDone(false)}>
              Write another message
            </Button>
          </div>
        ) : (
          // The form stays mounted when the topic changes, so typed text is kept.
          // Only the subject line and the topic's extra field animate.
          <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <h2 className="text-h3">{title}</h2>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={topic.id}
                  initial={reduce ? false : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: -16 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  aria-live="polite"
                  className="mt-1 text-[15px] text-ink-700"
                >
                  <span className="font-semibold text-ink-900">Subject: {topic.subject}.</span> {topic.helper}
                </motion.p>
              </AnimatePresence>
            </div>
            <Field label="Your name" error={errors.name}>
              {(p) => <Input {...p} name="name" autoComplete="name" />}
            </Field>
            <Field label="Email or phone number" help="We only use this to reply to you." error={errors.contact}>
              {(p) => <Input {...p} name="contact" autoComplete="on" />}
            </Field>
            {topic.extra && (
              <motion.div
                key={topic.extra.id + topic.id}
                initial={reduce ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Field label={topic.extra.label} optional={topic.extra.optional} error={errors.extra}>
                  {(p) => <Input {...p} name="extra" placeholder={topic.extra?.placeholder} />}
                </Field>
              </motion.div>
            )}
            <Field label="Message" error={errors.message}>
              {({ invalid, ...p }) => (
                <textarea
                  {...p}
                  name="message"
                  rows={5}
                  className={cn(
                    "block w-full rounded-field border-[1.5px] bg-white px-4 py-3 text-[16px] text-ink-900 placeholder:text-ink-500",
                    "hover:border-ink-500 focus:border-blue-600",
                    invalid ? "border-alert-600" : "border-line-strong",
                  )}
                />
              )}
            </Field>
            <Button type="submit" size="lg" className="self-start">
              Send message
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
