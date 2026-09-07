import { getDictionary, type Locale } from "@/lib/i18n";

export default function PositioningSection({ locale }: { locale: Locale }) {
  const { positioning } = getDictionary(locale);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-brand-700">{positioning.eyebrow}</p>
        <h2 className="mt-3 text-center text-2xl font-bold text-gray-900">{positioning.title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">{positioning.intro}</p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {positioning.pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-bold text-gray-900">{pillar.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{pillar.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 sm:flex sm:items-center sm:gap-8">
          <div className="sm:flex-1">
            <h3 className="font-bold text-gray-900">{positioning.businessTitle}</h3>
            <p className="mt-1 text-sm text-gray-600">{positioning.businessBody}</p>
          </div>
          <div className="mt-6 border-t border-gray-100 pt-6 sm:mt-0 sm:flex-1 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <h3 className="font-bold text-gray-900">{positioning.studentTitle}</h3>
            <p className="mt-1 text-sm text-gray-600">{positioning.studentBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
