"use client";

import { useState } from "react";
import PlansModal from "./PlansModal";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function AccountButton({ variant = "icon", locale }: { variant?: "icon" | "link"; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const dict = getDictionary(locale);

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={dict.header.login}
          title={dict.header.login}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-brand-300 hover:text-brand-700"
        >
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="underline-offset-2 hover:text-gray-700 hover:underline">
          {dict.footer.api}
        </button>
      )}

      {open ? <PlansModal onClose={() => setOpen(false)} reason="account" locale={locale} /> : null}
    </>
  );
}
