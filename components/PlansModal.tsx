"use client";

import { useEffect } from "react";

interface Plan {
  name: string;
  tagline: string;
  benefits: string[];
  highlighted?: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    name: "Étudiant",
    tagline: "Avec une adresse universitaire",
    badge: "-50 %",
    benefits: ["50 générations par jour", "Tous les avantages du plan Analyste", "Sur justificatif de scolarité"],
  },
  {
    name: "Analyste",
    tagline: "Connecté",
    benefits: ["50 générations par jour", "Recherche par période", "Téléchargement des rapports personnalisés"],
    highlighted: true,
  },
  {
    name: "Expert",
    tagline: "Connecté",
    benefits: ["Générations illimitées", "Accès API", "Tous les avantages du plan Analyste"],
  },
];

const REASON_COPY: Record<"download" | "account" | "query", { badge: string; heading: string; description: string }> = {
  download: {
    badge: "Compte requis",
    heading: "Le téléchargement de ce rapport personnalisé nécessite un compte",
    description: "Vous pouvez continuer à personnaliser votre rapport gratuitement — pour le télécharger, connectez-vous.",
  },
  account: {
    badge: "Bientôt disponible",
    heading: "Connectez-vous pour aller plus loin",
    description: "Plus de volume et l'accès API, dès que vous en avez besoin.",
  },
  query: {
    badge: "Compte requis",
    heading: "Interroger vos données par période nécessite un compte",
    description: 'Demander un graphique sur une période précise ("1er semestre 2026", "T3 2024"...) au sein d\'un fichier de plusieurs années est une fonctionnalité Analyste et Expert.',
  },
};

export default function PlansModal({ onClose, reason = "account" }: { onClose: () => void; reason?: "download" | "account" | "query" }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const copy = REASON_COPY[reason];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Comptes et forfaits"
    >
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">{copy.badge}</span>
        <h2 className="mt-3 text-xl font-bold text-gray-900">{copy.heading}</h2>
        <p className="mt-1 text-sm text-gray-600">{copy.description}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-4 ${plan.highlighted ? "border-2 border-brand-500" : "border-gray-200"}`}
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">{plan.name}</p>
                {plan.badge ? (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">{plan.badge}</span>
                ) : null}
              </div>
              <p className="text-xs text-gray-500">{plan.tagline}</p>
              <ul className="mt-3 space-y-2">
                {plan.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled
          className="mt-6 block w-full cursor-not-allowed rounded-full bg-gray-100 px-6 py-3 text-center text-sm font-semibold text-gray-400"
        >
          Se connecter — bientôt disponible
        </button>
      </div>
    </div>
  );
}
