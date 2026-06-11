import { AUTHI_GRADIENT } from '../lib/authiTheme';

const CheckIcon = () => (
  <svg className="h-3 w-3 text-amber-700" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const BasketItemRow = ({ item, highlighted, bare = false }) => {
  const total = item.count ?? 1;
  const used = item.used ?? 0;
  const received = used > 0;
  const hasUsage = !bare && received && item.used != null;
  const remaining = hasUsage ? Math.max(0, total - used) : total;
  const exhausted = hasUsage && remaining === 0;

  return (
    <div
      className={`rounded-xl border px-3 py-3 transition ${
        highlighted
          ? 'border-[#9F62ED] ring-2 ring-[#9F62ED]/30'
          : exhausted
            ? 'border-amber-300 bg-amber-50'
            : received
              ? 'border-amber-200 bg-amber-50/60'
              : 'border-[#EAECF0] bg-[#F9FAFB]'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
            received ? 'border-amber-500 bg-amber-100' : 'border-[#E5E7EB] bg-white'
          }`}
        >
          {received ? <CheckIcon /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-xs font-semibold leading-snug ${exhausted ? 'text-amber-900' : 'text-[#111827]'}`}>
              {item.desc}
            </p>
            {!bare && (
              <div className="shrink-0 text-right">
                <p className={`text-xs font-bold tabular-nums ${exhausted ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {hasUsage
                    ? exhausted
                      ? '0 left'
                      : `${remaining} left`
                    : `Max: ${total}`}
                </p>
                <p className="text-[9px] text-[#9CA3AF]">covered/yr</p>
              </div>
            )}
          </div>
          {item.code && (
            <p className="mt-0.5 font-mono text-[9px] text-[#9CA3AF]">{item.code}</p>
          )}
          {!bare && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {exhausted && (
              <span className="rounded-full border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800">
                Benefit used
              </span>
            )}
            {hasUsage && !exhausted && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800">
                {used} of {total} used
              </span>
            )}
            {!received && (
              <span className="rounded-full border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-800">
                Available
              </span>
            )}
          </div>
          )}
          {hasUsage && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (used / total) * 100)}%`,
                  background: AUTHI_GRADIENT,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Mini treatment basket — same language as TreatmentView, for literacy quiz.
 * Data comes from CDL treatment PDF (via API or authiData).
 */
export default function QuizTreatmentBasketVisual({ sections, sourceNote, bare = false }) {
  if (!sections?.length) return null;

  return (
    <div className="rounded-2xl border border-[#EAECF0] bg-white p-3 shadow-sm">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
        From the 2026 treatment basket PDF
      </p>
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#9F62ED]">
              {section.title}
            </p>
            <div className="space-y-2">
              {section.items.map((item) => (
                <BasketItemRow
                  key={`${section.title}-${item.code}-${item.desc}`}
                  item={item}
                  highlighted={item.highlight}
                  bare={bare}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {sourceNote && (
        <p className="mt-2 text-[9px] text-[#9CA3AF]">{sourceNote}</p>
      )}
    </div>
  );
}
