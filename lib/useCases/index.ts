import { frUseCases } from "./fr";
import { enUseCases } from "./en";
import type { UseCase } from "./types";
import type { Locale } from "@/lib/i18n/config";

const BY_LOCALE: Record<Locale, UseCase[]> = { fr: frUseCases, en: enUseCases };

export function getUseCases(locale: Locale): UseCase[] {
  return BY_LOCALE[locale];
}

export function findUseCase(locale: Locale, slug: string): UseCase | undefined {
  return BY_LOCALE[locale].find((useCase) => useCase.slug === slug);
}

// Slugs are localized, so linking a page to its translations goes through the
// locale-independent key rather than the URL.
export function findUseCaseByKey(locale: Locale, key: string): UseCase | undefined {
  return BY_LOCALE[locale].find((useCase) => useCase.key === key);
}

export type { UseCase } from "./types";
