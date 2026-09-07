import Link from "next/link";
import AccountButton from "./AccountButton";
import { SITE_NAME } from "@/lib/site";

export default function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">S</div>
        <span className="text-lg font-bold text-gray-800">{SITE_NAME}</span>
      </Link>
      <AccountButton variant="icon" />
    </header>
  );
}
