import { AUTHI_GRADIENT } from '../lib/authiTheme';
import QuizHospitalNetworkVisual from './QuizHospitalNetworkVisual';
import QuizMedicineCardVisual from './QuizMedicineCardVisual';
import QuizTreatmentBasketVisual from './QuizTreatmentBasketVisual';

const ProgressVisual = ({ used, total, label }) => (
  <div className="rounded-xl border border-[#E9D5FF] bg-[#FAF5FF] p-4">
    <p className="text-xs font-semibold text-[#6B7280]">{label}</p>
    <div className="mt-2 flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-8 flex-1 rounded-lg transition-all"
          style={{
            background: i < used ? AUTHI_GRADIENT : '#E5E7EB',
            opacity: i < used ? 1 : 0.45,
          }}
        />
      ))}
    </div>
    <p className="mt-2 text-center text-sm font-bold tabular-nums text-[#111827]">
      {used} of {total} used
    </p>
  </div>
);

const CdaMathVisual = ({ pharmacyPrice, cda, memberPays, discoveryPays }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between rounded-xl border border-[#EAECF0] bg-white px-3 py-2.5">
      <span className="text-xs text-[#6B7280]">Pharmacy charges</span>
      <span className="text-xs font-bold text-[#111827]">R{pharmacyPrice}</span>
    </div>
    <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
      <span className="text-xs text-emerald-800">Discovery pays (CDA)</span>
      <span className="text-xs font-bold text-emerald-900">R{discoveryPays ?? cda}</span>
    </div>
    <div className="flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5">
      <span className="text-xs font-semibold text-amber-900">You pay</span>
      <span className="text-sm font-bold text-amber-900">R{memberPays}</span>
    </div>
  </div>
);

const TwoBasketsVisual = () => (
  <div className="grid grid-cols-2 gap-2">
    <div className="rounded-xl border-2 border-violet-300 bg-violet-50 p-3 text-center">
      <p className="text-[10px] font-bold uppercase text-violet-800">Tests & screening</p>
      <p className="mt-1 text-[10px] text-violet-700">Blood tests, eye screening</p>
    </div>
    <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-center">
      <p className="text-[10px] font-bold uppercase text-cyan-800">Follow-up visits</p>
      <p className="mt-1 text-[10px] text-cyan-700">GP or specialist check-ins</p>
    </div>
  </div>
);

const PlannedEmergencyVisual = () => (
  <div className="grid grid-cols-2 gap-2">
    <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-3 text-center">
      <p className="text-[10px] font-bold uppercase text-[#6B7280]">Emergency casualty</p>
      <p className="mt-1 text-[10px] text-[#9CA3AF]">Different rules may apply</p>
    </div>
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-center">
      <p className="text-[10px] font-bold uppercase text-amber-900">Planned procedure</p>
      <p className="mt-1 text-[10px] text-amber-800">Network choice matters most</p>
    </div>
  </div>
);

/** Shared mini visuals for quiz questions and full walkthrough. */
export default function ScenarioVisual({ visual, meta }) {
  if (!visual) return null;

  if (visual === 'treatment-basket' && meta?.sections) {
    return (
      <QuizTreatmentBasketVisual
        sections={meta.sections}
        sourceNote={meta.sourceNote}
        bare={meta.bare}
      />
    );
  }

  if (visual === 'medicine-card' && meta) {
    return <QuizMedicineCardVisual {...meta} />;
  }

  if (visual === 'hospital-card' && meta) {
    return <QuizHospitalNetworkVisual {...meta} />;
  }

  if (visual === 'progress-empty' || visual === 'progress-full' || visual === 'progress-partial') {
    return (
      <ProgressVisual
        used={meta?.used ?? 0}
        total={meta?.total ?? 3}
        label={meta?.label ?? 'Covered per year'}
      />
    );
  }

  if (visual === 'motivation') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
        <p className="text-3xl">📋</p>
        <p className="mt-1 text-xs font-semibold text-amber-900">Doctor motivation letter</p>
        <p className="mt-0.5 text-[10px] text-[#6B7280]">Discovery reviews before paying</p>
      </div>
    );
  }

  if (visual === 'cda-maths' && meta) {
    return <CdaMathVisual {...meta} />;
  }

  if (visual === 'cda-intro' && meta) {
    return (
      <div className="rounded-xl border border-[#E9D5FF] bg-[#FAF5FF] p-4 text-center">
        <p className="text-xs font-semibold text-[#111827]">Chronic Drug Amount (CDA)</p>
        <p className="mt-1 text-lg font-bold text-[#9F62ED]">R{meta.cda}</p>
        <p className="mt-1 text-[10px] text-[#6B7280]">Max Discovery pays for unlisted brand</p>
      </div>
    );
  }

  if (visual === 'listed' && meta) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
        <p className="text-xs font-semibold text-emerald-900">{meta.example ?? 'Listed brand'}</p>
        <p className="mt-1 text-[10px] text-emerald-800">Usually paid in full at DSP pharmacy</p>
      </div>
    );
  }

  if (visual === 'two-baskets') return <TwoBasketsVisual />;
  if (visual === 'planned-emergency') return <PlannedEmergencyVisual />;

  if (visual === 'on-plan') {
    return (
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-emerald-800">On my plan</p>
          <p className="mt-1 text-[10px] text-emerald-700">Lowest cost for planned care</p>
        </div>
        <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-3 text-center opacity-70">
          <p className="text-[10px] font-bold uppercase text-[#6B7280]">Outside plan</p>
          <p className="mt-1 text-[10px] text-[#9CA3AF]">May cost more</p>
        </div>
      </div>
    );
  }

  if (visual === 'off-plan') {
    return (
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-center">
        <p className="text-[10px] font-bold uppercase text-amber-900">Outside my plan</p>
        <p className="mt-1 text-xs text-amber-900">Higher out-of-pocket cost likely</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E9D5FF] bg-[#FAF5FF] px-3 py-4 text-center">
      <p className="text-xl">💡</p>
      <p className="mt-1 text-[10px] text-[#6B7280]">See this on your profile below</p>
    </div>
  );
}
