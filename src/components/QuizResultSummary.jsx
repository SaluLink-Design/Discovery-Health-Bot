/** Authi summary after the treatment literacy quiz. */

export default function QuizResultSummary({ summary, moduleId }) {
  if (!summary) return null;

  if (moduleId === 'treatment' && summary.diagnosticItems) {
    return (
      <div className="mt-4 space-y-3 rounded-xl border border-[#E9D5FF] bg-[#FAF5FF] px-4 py-4 text-sm text-[#374151]">
        <p className="font-semibold text-[#111827]">{summary.headline}</p>
        <p className="text-xs leading-relaxed text-[#6B7280]">{summary.intro}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[#E9D5FF] bg-white/70 px-3 py-2.5">
            <p className="text-xs font-semibold text-[#9F62ED]">
              {summary.diagnosticHeading ?? 'Assessment at diagnosis'}
            </p>
            <p className="mt-0.5 text-[11px] text-[#6B7280]">{summary.diagnosticIntro}</p>
            <ul className="mt-1.5 space-y-0.5 text-xs text-[#374151]">
              {summary.diagnosticItems.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-[#E9D5FF] bg-white/70 px-3 py-2.5">
            <p className="text-xs font-semibold text-[#9F62ED]">
              {summary.ongoingHeading ?? 'Monitoring each year'}
            </p>
            <p className="mt-0.5 text-[11px] text-[#6B7280]">{summary.ongoingIntro}</p>
            <ul className="mt-1.5 space-y-0.5 text-xs text-[#374151]">
              {summary.ongoingItems.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        </div>
        {summary.cta && (
          <p className="text-xs font-medium text-[#9F62ED]">{summary.cta}</p>
        )}
      </div>
    );
  }

  if (summary.bullets?.length) {
    return (
      <div className="mt-4 space-y-3 rounded-xl border border-[#E9D5FF] bg-[#FAF5FF] px-4 py-4 text-sm text-[#374151]">
        <p className="font-semibold text-[#111827]">{summary.headline}</p>
        {summary.intro && <p className="text-xs text-[#6B7280]">{summary.intro}</p>}
        <ul className="list-inside list-disc space-y-1.5 text-xs leading-relaxed">
          {summary.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}
