import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SheetInsight — Analysez votre fichier Excel en un clic",
  description:
    "Déposez votre fichier Excel, SheetInsight l'analyse automatiquement et vous renvoie un rapport PDF clair avec les bons graphiques et les bons indicateurs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased text-gray-800">{children}</body>
    </html>
  );
}
