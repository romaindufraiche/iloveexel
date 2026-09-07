import { getDictionary, type Locale } from "@/lib/i18n";

const ICONS = ["lock", "trash", "user"] as const;

function BadgeIcon({ icon }: { icon: (typeof ICONS)[number] }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2}>
      {icon === "lock" ? (
        <>
          <rect x="5" y="11" width="14" height="9" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : icon === "trash" ? (
        <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

// Sits directly under the upload card: the reassurance has to be visible at
// the exact moment someone is deciding whether to hand over their file.
export default function PrivacyBadges({ locale }: { locale: Locale }) {
  const { privacy } = getDictionary(locale);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {privacy.badges.map((label, i) => (
          <span
            key={label}
            className="flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-sm font-semibold text-brand-700"
          >
            <BadgeIcon icon={ICONS[i] ?? "lock"} />
            {label}
          </span>
        ))}
      </div>
      <p className="mx-auto mt-3 max-w-md text-center text-xs text-gray-500">{privacy.note}</p>
    </div>
  );
}
