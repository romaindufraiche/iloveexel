"use client";

import { useEffect } from "react";

const BENEFITS = [
  "Analyses illimitées, tous les jours",
  "Déplacez vos graphiques où vous voulez sur la page",
  "Changez le type d'un graphique (barres, courbe, camembert...)",
  "Ajoutez et modifiez du texte directement sur le rapport",
  "Export prioritaire et modèles de rapport",
];

export default function PremiumModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Offre Premium"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
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

        <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          Bientôt disponible
        </span>
        <h2 className="mt-3 text-xl font-bold text-gray-900">La modification est réservée à Premium</h2>
        <p className="mt-1 text-sm text-gray-600">
          Personnalisez vos rapports comme vous le souhaitez, sans limite de génération.
        </p>

        <ul className="mt-5 space-y-2.5">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
              <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {benefit}
            </li>
          ))}
        </ul>

        <a
          href="#premium"
          onClick={onClose}
          className="mt-6 block w-full rounded-full bg-brand-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          Voir l&apos;offre Premium
        </a>
      </div>
    </div>
  );
}
