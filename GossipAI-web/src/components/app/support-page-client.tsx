"use client";

import { CheckCircle2, LifeBuoy, Mail, MessageSquareText, Send } from "lucide-react";
import { z } from "zod";
import { type FormEvent, useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LANDING_LANGUAGES,
  TRANSLATIONS,
  type LandingLanguage,
} from "@/components/app/landing/content";
import { LandingNavbar } from "@/components/app/landing/sections";
import { SUPPORT_TRANSLATIONS } from "@/components/app/support-translations";
import { useDesignTokens } from "@/hooks/use-design-tokens";
import { useApiMutation } from "@/lib/query/hooks";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/toast/notify";
import { useAuthStore } from "@/stores/auth-store";

const ticketResponseSchema = z.object({
  id: z.string(),
  contactName: z.string(),
  contactEmail: z.string(),
  category: z.string(),
  subject: z.string(),
  status: z.enum(["open", "in_progress", "resolved"]),
  createdAt: z.string(),
});

const LANDING_LANGUAGE_STORAGE_KEY = "gossipai-landing-language";
type SupportCategoryValue = "account" | "billing" | "bug" | "feedback" | "general";

export function SupportPageClient() {
  const { cssVars } = useDesignTokens();
  const user = useAuthStore((state) => state.user);
  const [language, setLanguage] = useState<LandingLanguage>(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem(LANDING_LANGUAGE_STORAGE_KEY);
    return stored && (LANDING_LANGUAGES as readonly string[]).includes(stored)
      ? (stored as LandingLanguage)
      : "en";
  });
  const [contactName, setContactName] = useState(user?.name ?? "");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [category, setCategory] = useState<SupportCategoryValue>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [lastTicketId, setLastTicketId] = useState<string | null>(null);
  const copy = SUPPORT_TRANSLATIONS[language] ?? SUPPORT_TRANSLATIONS.en;
  const landingCopy = TRANSLATIONS[language] ?? TRANSLATIONS.en;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LANDING_LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const ticketMutation = useApiMutation({
    schema: ticketResponseSchema,
    request: () => ({
      method: "POST",
      url: "/support/tickets",
      data: {
        contactName,
        contactEmail,
        category,
        subject,
        message,
      },
    }),
    options: {
      onSuccess: (ticket) => {
        setLastTicketId(ticket.id);
        setSubject("");
        setMessage("");
        setCategory("general");
        showApiSuccessToast(ticket, copy.successToast);
      },
      onError: (error) => showApiErrorToast(error, copy.errorToast),
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ticketMutation.mutate(undefined);
  };

  return (
    <div lang={language} style={cssVars} className="stitch-shell min-h-screen text-(--dt-on-bg)">
      <LandingNavbar
        copy={landingCopy}
        language={language}
        onLanguageChange={setLanguage}
        sectionHrefPrefix="/"
      />

      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-6">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-(--dt-outline-variant)/60 bg-(--dt-surface-low)/70 px-3 py-1 text-xs font-semibold text-(--dt-primary-container)">
                <LifeBuoy className="h-3.5 w-3.5" />
                {copy.support}
              </div>
              <h1 className="editorial-heading text-[length:var(--dt-h2-size)] leading-[var(--dt-h2-line)] text-(--dt-on-surface) sm:text-6xl">
                {copy.heroTitle}
              </h1>
              <p className="max-w-xl text-sm leading-6 text-(--dt-on-surface-variant)">
                {copy.heroDescription}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="stitch-glass rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-(--dt-primary-container)" />
                  <div>
                    <p className="text-sm font-semibold text-(--dt-on-surface)">{copy.emailTrackingTitle}</p>
                    <p className="mt-1 text-sm text-(--dt-on-surface-variant)">{copy.emailTrackingText}</p>
                  </div>
                </div>
              </div>
              <div className="stitch-glass rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <MessageSquareText className="mt-0.5 h-5 w-5 text-(--dt-primary-container)" />
                  <div>
                    <p className="text-sm font-semibold text-(--dt-on-surface)">{copy.faqFirstTitle}</p>
                    <p className="mt-1 text-sm text-(--dt-on-surface-variant)">{copy.faqFirstText}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="stitch-glass rounded-2xl p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-(--dt-on-surface)">{copy.formTitle}</h2>
                <p className="mt-1 text-sm text-(--dt-on-surface-variant)">{copy.formDescription}</p>
              </div>
              {lastTicketId ? (
                <div className="flex items-center gap-1.5 rounded-full border border-(--dt-primary-container)/40 px-3 py-1 text-xs text-(--dt-primary-container)">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {copy.sent}
                </div>
              ) : null}
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-(--dt-on-surface)">{copy.name}</Label>
                  <Input
                    id="contactName"
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    required
                    maxLength={120}
                    className="border-(--dt-outline-variant) bg-(--dt-surface-low)/60 text-(--dt-on-surface)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-(--dt-on-surface)">{copy.email}</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    required
                    maxLength={254}
                    className="border-(--dt-outline-variant) bg-(--dt-surface-low)/60 text-(--dt-on-surface)"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-(--dt-on-surface)">{copy.category}</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value as SupportCategoryValue)}
                    className="h-10 w-full rounded-lg border border-(--dt-outline-variant) bg-(--dt-surface-low)/60 px-3 text-sm text-(--dt-on-surface) outline-none focus:border-(--dt-primary-container)"
                  >
                    {copy.categories.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-(--dt-on-surface)">{copy.subject}</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    required
                    minLength={3}
                    maxLength={160}
                    className="border-(--dt-outline-variant) bg-(--dt-surface-low)/60 text-(--dt-on-surface)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-(--dt-on-surface)">{copy.message}</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  minLength={10}
                  maxLength={5000}
                  className="min-h-48 resize-y border-(--dt-outline-variant) bg-(--dt-surface-low)/60 text-(--dt-on-surface)"
                />
              </div>

              {lastTicketId ? (
                <p className="rounded-xl border border-(--dt-primary-container)/35 bg-(--dt-primary-container)/10 px-3 py-2 text-xs text-(--dt-on-surface-variant)">
                  {copy.ticketId}: <span className="font-mono text-(--dt-primary-container)">{lastTicketId}</span>
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={ticketMutation.isPending}
                className="w-full gap-2 bg-(--dt-primary-container) text-[#0A0A0A] hover:bg-(--dt-primary)"
              >
                <Send className="h-4 w-4" />
                {ticketMutation.isPending ? copy.sending : copy.sendTicket}
              </Button>
            </form>
          </section>
        </div>

        <section className="stitch-glass mt-8 rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-(--dt-on-surface)">{copy.faqTitle}</h2>
          <Accordion type="single" collapsible className="mt-3 grid gap-x-8 lg:grid-cols-2">
            {copy.faqs.map((item) => (
              <AccordionItem key={item.question} value={item.question} className="border-(--dt-outline-variant)/50">
                <AccordionTrigger className="text-(--dt-on-surface) hover:text-(--dt-primary-container)">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-(--dt-on-surface-variant)">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </div>
  );
}
