import Link from "next/link";
import AccountButton from "./AccountButton";
import { SITE_NAME } from "@/lib/site";
import { getUseCases } from "@/lib/useCases";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const useCases = getUseCases(locale);

  return (
    <footer className="border-t border-gray-200 py-10 text-sm text-gray-500">
      <div className="mx-auto max-w-5xl px-6">
        <nav aria-label={dict.footer.useCasesLabel} className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {useCases.map((useCase) => (
            <Link key={useCase.slug} href={`/${locale}/analyse/${useCase.slug}`} className="hover:text-brand-700 hover:underline">
              {useCase.navLabel}
            </Link>
          ))}
        </nav>

        <div className="mt-8 text-center">
          <p>
            © {new Date().getFullYear()} {SITE_NAME} — {dict.footer.product}{" "}
            <a href="https://glmprime.com" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-600 hover:underline">
              GLM
            </a>
            {locale === "fr" ? "." : " product."}
          </p>
          <p className="mt-1">
            <a href="https://glmprime.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
              glmprime.com
            </a>{" "}
            · <AccountButton variant="link" locale={locale} />
          </p>
        </div>
      </div>
    </footer>
  );
}
