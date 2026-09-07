import { getDictionary, type Locale } from "@/lib/i18n";

function Item({ children, positive }: { children: React.ReactNode; positive: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-gray-700">
      <svg
        viewBox="0 0 24 24"
        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${positive ? "text-brand-600" : "text-gray-400"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        {positive ? (
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {children}
    </li>
  );
}

export default function PrivacySection({ locale }: { locale: Locale }) {
  const { privacy } = getDictionary(locale);

  return (
    <section className="bg-brand-50 py-16">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">{privacy.sectionTitle}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">{privacy.sectionIntro}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-200 bg-white p-6">
            <h3 className="text-base font-bold text-brand-700">{privacy.weDoTitle}</h3>
            <ul className="mt-4 space-y-3">
              {privacy.weDo.map((item) => (
                <Item key={item} positive>
                  {item}
                </Item>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-bold text-gray-900">{privacy.weDontTitle}</h3>
            <ul className="mt-4 space-y-3">
              {privacy.weDont.map((item) => (
                <Item key={item} positive={false}>
                  {item}
                </Item>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">{privacy.footnote}</p>
      </div>
    </section>
  );
}
