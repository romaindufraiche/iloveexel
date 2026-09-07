import Link from "next/link";
import AccountButton from "./AccountButton";
import { SITE_NAME } from "@/lib/site";
import { USE_CASES } from "@/lib/useCases";

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 py-10 text-sm text-gray-500">
      <div className="mx-auto max-w-5xl px-6">
        <nav aria-label="Cas d'usage" className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {USE_CASES.map((useCase) => (
            <Link key={useCase.slug} href={`/analyse/${useCase.slug}`} className="hover:text-brand-700 hover:underline">
              {useCase.navLabel}
            </Link>
          ))}
        </nav>

        <div className="mt-8 text-center">
          <p>
            © {new Date().getFullYear()} {SITE_NAME} — un produit{" "}
            <a href="https://glmprime.com" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-600 hover:underline">
              GLM
            </a>
            .
          </p>
          <p className="mt-1">
            <a href="https://glmprime.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
              glmprime.com
            </a>{" "}
            · <AccountButton variant="link" />
          </p>
        </div>
      </div>
    </footer>
  );
}
