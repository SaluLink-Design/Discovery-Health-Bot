import { CDL_CONDITION_DETAILS, CDL_CONDITIONS } from '../data/authiData';
import { getProfileConditions } from '../lib/profileContext';
import FeaturePageHeader from './FeaturePageHeader';

const IconStethoscope = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
  </svg>
);

const CheckItem = ({ label, sublabel, checked, onToggle, accent = 'amber' }) => {
  const accentMap = {
    amber: {
      checked: 'border-amber-400/50 bg-amber-400/10',
      dot: 'bg-amber-400',
      label: 'text-amber-200',
      checkbox: 'accent-amber-400',
    },
    violet: {
      checked: 'border-violet-400/40 bg-violet-400/8',
      dot: 'bg-violet-400',
      label: 'text-violet-200',
      checkbox: 'accent-violet-400',
    },
    emerald: {
      checked: 'border-emerald-400/40 bg-emerald-400/8',
      dot: 'bg-emerald-400',
      label: 'text-emerald-200',
      checkbox: 'accent-emerald-400',
    },
  };
  const c = accentMap[accent] ?? accentMap.amber;

  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
        checked
          ? `${c.checked}`
          : 'border-white/8 bg-white/3 hover:border-white/15'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className={`mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-slate-900 ${c.checkbox}`}
      />
      <div className="min-w-0">
        <p className={`text-sm font-medium ${checked ? c.label : 'text-slate-200'}`}>{label}</p>
        {sublabel && <p className="mt-0.5 text-xs text-slate-500">{sublabel}</p>}
      </div>
    </label>
  );
};

const ConditionPanel = ({ conditionId, prescriptions, onPrescriptionsChange }) => {
  const details = CDL_CONDITION_DETAILS[conditionId];
  const conditionLabel =
    CDL_CONDITIONS.find((c) => c.id === conditionId)?.label ?? conditionId;

  if (!details) return null;

  const current = prescriptions?.[conditionId] ?? { treatments: [], medications: [] };

  const toggleTreatment = (code) => {
    const treatments = current.treatments.includes(code)
      ? current.treatments.filter((c) => c !== code)
      : [...current.treatments, code];
    onPrescriptionsChange({
      ...prescriptions,
      [conditionId]: { ...current, treatments },
    });
  };

  const toggleMedication = (name) => {
    const medications = current.medications.includes(name)
      ? current.medications.filter((m) => m !== name)
      : [...current.medications, name];
    onPrescriptionsChange({
      ...prescriptions,
      [conditionId]: { ...current, medications },
    });
  };

  const clearAll = () => {
    onPrescriptionsChange({
      ...prescriptions,
      [conditionId]: { treatments: [], medications: [] },
    });
  };

  const totalSelected =
    current.treatments.length + current.medications.length;

  const diagnosticItems = details.treatment?.diagnostic ?? [];
  const ongoingItems = details.treatment?.ongoing ?? [];
  const medications = details.medications ?? [];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-amber-950/10 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{conditionLabel}</h3>
          {totalSelected > 0 && (
            <p className="mt-0.5 text-xs text-amber-300">
              {totalSelected} item{totalSelected !== 1 ? 's' : ''} prescribed
            </p>
          )}
        </div>
        {totalSelected > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="shrink-0 text-xs text-slate-500 underline-offset-2 hover:text-rose-300 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="mt-5 space-y-5">
        {diagnosticItems.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-400/80">
              Diagnostic treatments
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {diagnosticItems.map((item) => (
                <CheckItem
                  key={item.code}
                  label={item.desc}
                  sublabel={`Code: ${item.code} · ×${item.count}/yr`}
                  checked={current.treatments.includes(item.code)}
                  onToggle={() => toggleTreatment(item.code)}
                  accent="violet"
                />
              ))}
            </div>
          </div>
        )}

        {ongoingItems.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400/80">
              Ongoing management
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ongoingItems.map((item) => (
                <CheckItem
                  key={item.code}
                  label={item.desc}
                  sublabel={`Code: ${item.code} · ×${item.count}/yr`}
                  checked={current.treatments.includes(item.code)}
                  onToggle={() => toggleTreatment(item.code)}
                  accent="amber"
                />
              ))}
            </div>
          </div>
        )}

        {medications.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
              Medications prescribed
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {medications.map((med) => (
                <CheckItem
                  key={med}
                  label={med}
                  checked={current.medications.includes(med)}
                  onToggle={() => toggleMedication(med)}
                  accent="emerald"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function DoctorView({ profile, onNavigate, prescriptions, onPrescriptionsChange }) {
  const conditionIds = getProfileConditions(profile);

  return (
    <div className="space-y-8">
      <FeaturePageHeader
        eyebrow="Health Log"
        eyebrowClassName="text-amber-300"
        title="My treatment history"
        description={
          conditionIds.length > 0
            ? "Items marked as received appear highlighted in your Treatment Plans and Medication views."
            : "Add chronic conditions to your profile to track treatments and medications you have received."
        }
        onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
      />

      {conditionIds.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-amber-400/20 bg-amber-400/5 p-10 text-center">
          <p className="text-sm text-slate-400">No chronic conditions on the patient profile yet.</p>
          <p className="mt-1 text-xs text-slate-500">
            Go to the patient profile and add your chronic conditions.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/8 px-5 py-3 text-sm text-amber-200">
            Tick any treatment or medication you have already received. Ticked items appear as <span className="font-semibold">Received</span> badges in your Treatment Plans and Medication views.
          </div>

          <div className="space-y-6">
            {conditionIds.map((id) => (
              <ConditionPanel
                key={id}
                conditionId={id}
                prescriptions={prescriptions}
                onPrescriptionsChange={onPrescriptionsChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
