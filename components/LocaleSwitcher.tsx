"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

// Switching language rewrites the current path's locale segment and stores
// the choice, so the proxy stops guessing from Accept-Language on later
// visits — an explicit choice should outrank the browser's setting.
export default function LocaleSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: string) => {
    if (!LOCALES.includes(next as Locale) || next === locale) return;
    document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;

    const segments = pathname.split("/");
    // segments[0] is empty (leading slash), segments[1] is the current locale.
    segments[1] = next;
    router.push(segments.join("/") || `/${next}`);
  };

  return (
    <label className="flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={locale}
        onChange={(e) => switchTo(e.target.value)}
        className="cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-brand-300 hover:text-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
