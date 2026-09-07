import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, IS_PRODUCTION_DEPLOYMENT } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "analyser fichier Excel",
    "rapport Excel automatique",
    "graphique Excel automatique",
    "analyser CSV en ligne",
    "tableau de bord Excel",
    "rapport PDF depuis Excel",
    "analyse de données sans Excel",
  ],
  authors: [{ name: "GLM", url: "https://glmprime.com" }],
  creator: "GLM",
  publisher: "GLM",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: IS_PRODUCTION_DEPLOYMENT
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } }
    : { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased text-gray-800">{children}</body>
    </html>
  );
}
