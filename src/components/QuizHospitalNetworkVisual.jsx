/** Mini hospital network card for literacy quiz. */

export default function QuizHospitalNetworkVisual({
  hospitalName = 'Example Hospital',
  town,
  onPlan = true,
  bare = false,
  networkLabel,
  showCoPayWarning = false,
  sourceNote,
}) {
  return (
    <div className="rounded-2xl border border-[#EAECF0] bg-white p-3 shadow-sm">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
        Planned hospital admission
      </p>
      <div
        className={`rounded-xl border px-3 py-3 ${
          onPlan && !bare
            ? 'border-emerald-300 bg-emerald-50'
            : 'border-amber-300 bg-amber-50'
        }`}
      >
        <p className="text-xs font-semibold text-[#111827]">{hospitalName}</p>
        {town && <p className="mt-0.5 text-[10px] text-[#6B7280]">{town}</p>}
        {!bare && (
          <div className="mt-2">
            {onPlan ? (
              <span className="rounded-full border border-emerald-400 bg-white px-2 py-0.5 text-[9px] font-semibold text-emerald-800">
                On my plan
              </span>
            ) : (
              <span className="rounded-full border border-amber-400 bg-white px-2 py-0.5 text-[9px] font-semibold text-amber-900">
                Outside my plan
              </span>
            )}
          </div>
        )}
      </div>
      {!bare && networkLabel && (
        <p className="mt-2 text-[9px] text-[#6B7280]">
          Networks on your plan: {networkLabel}
        </p>
      )}
      {showCoPayWarning && (
        <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5">
          <p className="text-[10px] font-semibold text-amber-900">Higher out-of-pocket likely</p>
          <p className="mt-0.5 text-[9px] text-amber-800">
            Higher out-of-pocket cost — hospital is outside your plan network
          </p>
        </div>
      )}
      {sourceNote && <p className="mt-1 text-[9px] text-[#9CA3AF]">{sourceNote}</p>}
    </div>
  );
}
