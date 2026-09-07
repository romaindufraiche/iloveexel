import { fr } from "./fr";
import { en } from "./en";
import type { Dictionary } from "./types";
import type { Locale } from "./config";

const DICTIONARIES: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export type { Dictionary } from "./types";
export * from "./config";
