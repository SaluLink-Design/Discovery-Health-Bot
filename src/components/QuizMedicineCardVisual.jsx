/** Mini medicine card for literacy quiz — mirrors MedicationView brand rows. */

export default function QuizMedicineCardVisual({
  brandName,
  ingredientName,
  pharmacy = 'Clicks',
  listed = true,
  bare = false,
  excludedFromPlan = false,
  exclusionLabel,
  showMotivationNote = false,
  showPaymentSplit = false,
  pharmacyPrice,
  schemePays,
  memberPays,
  sourceNote,
}) {
  return (
    <div className="rounded-2xl border border-[#EAECF0] bg-white p-3 shadow-sm">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
        From the approved medicine list PDF
      </p>
      <div
        className={`rounded-xl border px-3 py-3 ${
          excludedFromPlan && !bare
            ? 'border-red-300 bg-red-50/60'
            : listed && !bare
            ? 'border-[#EAECF0] bg-[#F9FAFB]'
            : 'border-orange-200 bg-orange-50/40'
        }`}
      >
        <p className="text-xs font-semibold text-[#111827]">{brandName}</p>
        {ingredientName && (
          <p className="mt-0.5 text-[10px] text-[#6B7280]">{ingredientName}</p>
        )}
        {!bare && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {excludedFromPlan ? (
              <span className="rounded-full border border-red-400 bg-red-50 px-2 py-0.5 text-[9px] font-semibold text-red-900">
                {exclusionLabel ?? 'Not included on your plan'}
              </span>
            ) : listed ? (
              <>
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-800">
                  On approved list
                </span>
                <span className="rounded-full border border-[#E5E7EB] bg-white px-2 py-0.5 text-[9px] text-[#6B7280]">
                  {pharmacy}
                </span>
              </>
            ) : (
              <span className="rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[9px] font-semibold text-orange-800">
                Not on approved list
              </span>
            )}
          </div>
        )}
      </div>
      {showPaymentSplit && pharmacyPrice != null && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-[#EAECF0] bg-white px-3 py-2">
            <span className="text-[10px] text-[#6B7280]">Pharmacy charges</span>
            <span className="text-[10px] font-bold text-[#111827]">R{pharmacyPrice}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <span className="text-[10px] text-emerald-800">Discovery pays up to</span>
            <span className="text-[10px] font-bold text-emerald-900">R{schemePays}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
            <span className="text-[10px] font-semibold text-amber-900">You pay</span>
            <span className="text-xs font-bold text-amber-900">R{memberPays}</span>
          </div>
        </div>
      )}
      {showMotivationNote && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
          <p className="text-lg">📋</p>
          <p className="mt-1 text-[10px] font-semibold text-amber-900">Clinical motivation required</p>
          <p className="mt-0.5 text-[9px] text-[#6B7280]">
            Doctor submits supporting documentation — Discovery reviews before paying
          </p>
        </div>
      )}
      {sourceNote && <p className="mt-2 text-[9px] text-[#9CA3AF]">{sourceNote}</p>}
    </div>
  );
}
