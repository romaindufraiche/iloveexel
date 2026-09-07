// Canonical origin used by metadata, the sitemap and JSON-LD. Preview
// deployments still resolve to the production domain so they never compete
// with it in search results (see app/robots.ts, which blocks them outright).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "https://iloveexel.vercel.app"
).replace(/\/$/, "");

export const IS_PRODUCTION_DEPLOYMENT = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;

export const SITE_NAME = "SheetInsight";

export const SITE_TAGLINE = "Analysez votre fichier Excel en un clic";

export const SITE_DESCRIPTION =
  "Déposez votre fichier Excel ou CSV : SheetInsight détecte automatiquement vos indicateurs clés, choisit les bons graphiques et vous renvoie un rapport prêt à présenter en PDF, PowerPoint ou image. Gratuit, sans inscription.";
