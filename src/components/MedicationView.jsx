import { useEffect, useMemo, useState } from 'react';
import { CDL_CONDITIONS } from '../data/authiData';
import {
  coverageBadge,
  groupMedicinesByClass,
  normalizeLabel,
} from '../lib/medicineClassifier';
import {
  getActiveMedicationsByCondition,
} from '../lib/prescriptionStore';
import {
  getPlanFromProfile,
  getProfileConditions,
  hasProfileConditions,
} from '../lib/profileContext';
import FeaturePageHeader from './FeaturePageHeader';

const ALL_CONDITIONS_CHIP = '__all__';

const selectCls =
  'w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20 appearance-none';

/* ── Coverage badge chip ─────────────────────────────────── */
const CoverageBadge = ({ med, planId }) => {
  const { covered, label, colour } = coverageBadge(med, planId);
  const colours = {
    emerald: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    amber: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
    orange: 'border-orange-400/40 bg-orange-400/10 text-orange-300',
  };
  return (
    <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colours[colour]}`}>
      {covered ? (
        <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-8a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
        </svg>
      )}
      {label}
    </span>
  );
};

/* ── Medicine card (inside a class drill-down) ─────────────── */
const MedicineCard = ({ med, planId, prescribed }) => {
  const { covered } = coverageBadge(med, planId);
  return (
    <div className={`flex flex-col gap-2 rounded-2xl border px-4 py-3.5 transition ${
      prescribed
        ? 'border-amber-400/40 bg-amber-400/5 shadow-amber-950/20 shadow-md'
        : !covered
        ? 'border-orange-400/15 bg-orange-400/3'
        : 'border-white/8 bg-white/4'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm font-medium leading-snug ${covered ? 'text-slate-100' : 'text-slate-400'}`}>
          {normalizeLabel(med.label)}
        </p>
        {!covered && (
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-orange-400/70" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <CoverageBadge med={med} planId={planId} />
        {prescribed && (
          <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
            ● Active prescription
          </span>
        )}
      </div>
      {med.note && (
        <p className="text-[11px] leading-4 text-slate-500">{med.note}</p>
      )}
    </div>
  );
};

/* ── Active prescriptions — shown at top of Medication page ─ */
const ActivePrescriptionsPanel = ({ rows, plan }) => {
  if (!rows.length) return null;

  return (
    <section className="rounded-[2rem] border border-amber-400/30 bg-gradient-to-br from-amber-400/10 via-amber-950/20 to-slate-950/80 p-6 shadow-xl shadow-amber-950/15">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            Active prescriptions
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Medicines you are currently using — across all your profile conditions.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold text-amber-300">
          {rows.reduce((n, r) => n + r.medications.length, 0)} active
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {rows.map(({ conditionId, medications }) => {
          const label = CDL_CONDITIONS.find((c) => c.id === conditionId)?.label ?? conditionId;
          return (
            <div key={conditionId}>
              <p className="mb-2 text-xs font-semibold text-slate-400">{label}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {medications.map((med) => (
                  <div
                    key={med}
                    className="flex flex-col gap-2 rounded-2xl border border-amber-400/40 bg-amber-400/8 px-4 py-3.5"
                  >
                    <p className="text-sm font-semibold leading-snug text-amber-100">
                      {normalizeLabel(med)}
                    </p>
                    <span className="w-fit rounded-full border border-amber-400/45 bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                      ● Active prescription
                    </span>
                    {plan && (
                      <p className="text-[10px] text-slate-500">
                        Covered on your {plan.label} plan — browse classes below for alternatives.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/* ── Class summary card (the top-level list) ────────────────── */
const ClassCard = ({ cls, planId, hasPrescribed, onClick }) => {
  const pct = cls.medicines.length ? Math.round((cls.coveredCount / cls.medicines.length) * 100) : 0;
  const uncoveredCount = cls.medicines.length - cls.coveredCount;
  const barColour = pct === 100 ? 'bg-emerald-400' : pct === 0 ? 'bg-slate-700' : 'bg-amber-400';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-white/8 bg-white/4 px-5 py-4 text-left transition hover:border-emerald-400/25 hover:bg-white/6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-100 group-hover:text-white transition">
              {cls.name}
            </p>
            {hasPrescribed && (
              <span className="rounded-full border border-amber-400/40 bg-amber-400/12 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-300">
                Active Rx
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {cls.medicines.length} medicine{cls.medicines.length !== 1 ? 's' : ''}
            {uncoveredCount > 0 && planId && (
              <span className="ml-1.5 text-amber-400/80">
                · {uncoveredCount} not covered by your plan
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-base font-bold ${pct === 100 ? 'text-emerald-400' : pct === 0 ? 'text-slate-600' : 'text-amber-400'}`}>
            {planId ? `${pct}%` : '–'}
          </span>
          <span className="text-[10px] text-slate-600">covered</span>
        </div>
      </div>
      {planId && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${barColour}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-600">
          {cls.coveredCount} covered · {uncoveredCount} restricted
        </span>
        <svg className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </button>
  );
};

/* ── Main component ────────────────────────────────────────── */
export default function MedicationView({ profile, onNavigate, onEditProfile, prescriptions }) {
  const plan = getPlanFromProfile(profile);
  const planId = plan?.id ?? null;
  const profileConditionIds = getProfileConditions(profile);
  const usesProfileConditions = hasProfileConditions(profile);

  const [browseAllConditions, setBrowseAllConditions] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(
    profileConditionIds[0] ?? CDL_CONDITIONS[0].id
  );
  const [narrowCondition, setNarrowCondition] = useState(ALL_CONDITIONS_CHIP);
  const [searchText, setSearchText] = useState('');
  const [medicineData, setMedicineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const showFullConditionDropdown = !usesProfileConditions || browseAllConditions;

  const effectiveCondition =
    usesProfileConditions && !showFullConditionDropdown && narrowCondition !== ALL_CONDITIONS_CHIP
      ? narrowCondition
      : selectedCondition;

  const conditionLabel =
    CDL_CONDITIONS.find((c) => c.id === effectiveCondition)?.label ?? effectiveCondition;

  /* Fetch medicine data from PDF-backed API */
  useEffect(() => {
    let cancelled = false;
    setMedicineData(null);
    setLoading(true);
    setSelectedClassId(null);

    fetch(`/api/medications?condition_id=${encodeURIComponent(effectiveCondition)}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setMedicineData(data); })
      .catch(() => { if (!cancelled) setMedicineData({ conditionId: effectiveCondition, medicines: [] }); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [effectiveCondition]);

  /* Group into classes using the frontend classifier */
  const classGroups = useMemo(
    () => groupMedicinesByClass(medicineData?.medicines ?? [], planId),
    [medicineData, planId]
  );

  /* Search filters across all classes */
  const filteredGroups = useMemo(() => {
    if (!searchText.trim()) return classGroups;
    const q = searchText.toLowerCase();
    return classGroups
      .map((cls) => ({
        ...cls,
        medicines: cls.medicines.filter((m) =>
          normalizeLabel(m.label).toLowerCase().includes(q) ||
          cls.name.toLowerCase().includes(q)
        ),
      }))
      .filter((cls) => cls.medicines.length > 0);
  }, [classGroups, searchText]);

  /* Drill-down data */
  const selectedClass = filteredGroups.find((c) => c.id === selectedClassId) ?? null;

  /* Prescribed medicines for the current condition */
  const prescribedMeds = prescriptions?.[effectiveCondition]?.medications ?? [];
  const hasPrescribed = (cls) =>
    cls.medicines.some((m) =>
      prescribedMeds.some(
        (p) => normalizeLabel(p).toLowerCase() === normalizeLabel(m.label).toLowerCase()
      )
    );

  const isPrescribed = (med) =>
    prescribedMeds.some(
      (p) => normalizeLabel(p).toLowerCase() === normalizeLabel(med.label).toLowerCase()
    );

  const planContext = plan ? `${plan.label} plan · Chronic Illness Benefit` : null;

  const activeMedicationRows = useMemo(() => {
    const ids =
      usesProfileConditions && !browseAllConditions
        ? profileConditionIds
        : [effectiveCondition];
    return getActiveMedicationsByCondition(prescriptions, ids);
  }, [
    prescriptions,
    profileConditionIds,
    usesProfileConditions,
    browseAllConditions,
    effectiveCondition,
  ]);

  /* ── No profile conditions ─────────────────────────────── */
  if (!usesProfileConditions && !browseAllConditions) {
    return (
      <div className="space-y-8">
        <FeaturePageHeader
          eyebrow="Medication"
          eyebrowClassName="text-emerald-300"
          title="Chronic illness medicines"
          description="Add chronic conditions in your profile to see formulary medicines broken down by class with plan coverage."
          onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
          profileContext={planContext}
        />
        <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/3 p-10 text-center">
          <p className="text-sm text-slate-300">No chronic conditions on your profile yet.</p>
          <p className="mt-2 text-xs text-slate-500">
            Add conditions like Hypertension or Asthma so Authi can show you which medicines are covered.
          </p>
          {onEditProfile && (
            <button
              type="button"
              onClick={onEditProfile}
              className="mt-6 rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Edit profile
            </button>
          )}
          <button
            type="button"
            onClick={() => setBrowseAllConditions(true)}
            className="mt-4 block w-full text-xs text-slate-500 underline-offset-2 hover:text-emerald-300 hover:underline"
          >
            Browse all conditions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FeaturePageHeader
        eyebrow="Medication"
        eyebrowClassName="text-emerald-300"
        title="Medicine classes"
        description={
          plan
            ? `Formulary medicines for your conditions, showing what's covered on your ${plan.label} plan.`
            : 'Browse formulary medicines from the 2026 Chronic Illness Benefit list by pharmacological class.'
        }
        onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
        profileContext={planContext}
      />

      {/* ── Active prescriptions (always at top) ──────── */}
      <ActivePrescriptionsPanel rows={activeMedicationRows} plan={plan} />

      {/* ── Filter panel ────────────────────────────────── */}
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-xl backdrop-blur">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Medicine selection
        </p>

        {showFullConditionDropdown && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Condition</label>
            <div className="relative">
              <select
                value={selectedCondition}
                onChange={(e) => {
                  setSelectedCondition(e.target.value);
                  setSearchText('');
                  setSelectedClassId(null);
                }}
                className={selectCls}
              >
                {CDL_CONDITIONS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">
            Search by medicine name or class
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setSelectedClassId(null);
              }}
              placeholder="e.g. Salbutamol, ICS, Enalapril…"
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-9 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20"
            />
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>

        {/* Condition narrow chips */}
        {usesProfileConditions && !showFullConditionDropdown && profileConditionIds.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-600">Condition:</span>
            <button
              type="button"
              onClick={() => setNarrowCondition(ALL_CONDITIONS_CHIP)}
              className={`rounded-full border px-3 py-0.5 text-xs font-medium transition ${
                narrowCondition === ALL_CONDITIONS_CHIP
                  ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-emerald-300'
              }`}
            >
              All mine
            </button>
            {profileConditionIds.map((id) => {
              const label = CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setNarrowCondition(id)}
                  className={`rounded-full border px-3 py-0.5 text-xs font-medium transition ${
                    narrowCondition === id
                      ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {usesProfileConditions && browseAllConditions && (
          <button
            type="button"
            onClick={() => { setBrowseAllConditions(false); setNarrowCondition(ALL_CONDITIONS_CHIP); }}
            className="mt-3 text-xs text-emerald-400/80 hover:text-emerald-300"
          >
            ← Back to my profile conditions
          </button>
        )}
        {usesProfileConditions && !browseAllConditions && (
          <button
            type="button"
            onClick={() => setBrowseAllConditions(true)}
            className="mt-3 text-xs text-slate-500 hover:text-emerald-300"
          >
            Browse all conditions
          </button>
        )}
      </div>

      {/* ── Plan coverage context banner ──────────────── */}
      {plan && medicineData && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
          <div>
            <p className="text-xs font-semibold text-emerald-300">{plan.label} plan — {conditionLabel}</p>
            <p className="text-[11px] text-slate-500">
              Coverage shown based on the 2026 Chronic Illness Benefit formulary.
              Items marked amber are not covered on your plan.
            </p>
          </div>
        </div>
      )}

      {/* ── Loading ────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-white/8 bg-white/3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
          <p className="mt-3 text-sm text-slate-500">Loading formulary from PDF…</p>
        </div>
      )}

      {/* ── No medicines from PDF ─────────────────────── */}
      {!loading && medicineData && filteredGroups.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/3 p-8 text-center">
          <p className="text-sm text-slate-400">
            {searchText ? `No medicines match "${searchText}".` : 'No formulary medicines found for this condition.'}
          </p>
        </div>
      )}

      {/* ── Drill-down breadcrumb ─────────────────────── */}
      {selectedClass && (
        <button
          type="button"
          onClick={() => setSelectedClassId(null)}
          className="flex items-center gap-1.5 text-xs text-emerald-400/80 hover:text-emerald-300 transition"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to classes
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">{selectedClass.name}</span>
        </button>
      )}

      {/* ── Class list view ───────────────────────────── */}
      {!loading && !selectedClass && filteredGroups.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Filter by medicine class
            </p>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
              {filteredGroups.reduce((n, c) => n + c.medicines.length, 0)} medicines
            </span>
          </div>

          {/* Summary row */}
          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">All Classes</p>
                <p className="text-xs text-slate-500">
                  {filteredGroups.reduce((n, c) => n + c.medicines.length, 0)} total medicines
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-400">
                  {filteredGroups.reduce((n, c) => n + c.medicines.length, 0) > 0
                    ? Math.round(
                        (filteredGroups.reduce((n, c) => n + c.coveredCount, 0) /
                          filteredGroups.reduce((n, c) => n + c.medicines.length, 0)) *
                          100
                      )
                    : 0}%
                </p>
                <p className="text-[10px] text-slate-600">
                  {plan ? `covered on ${plan.label}` : 'coverage'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {filteredGroups.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                planId={planId}
                hasPrescribed={hasPrescribed(cls)}
                onClick={() => setSelectedClassId(cls.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Medicine drill-down ───────────────────────── */}
      {!loading && selectedClass && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-300">{selectedClass.medicines.length} medicines</span>
              {' '}in <span className="text-emerald-300">{selectedClass.name}</span>
            </p>
            {plan && (
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                selectedClass.coveredCount === selectedClass.medicines.length
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                  : selectedClass.coveredCount === 0
                  ? 'border-slate-700 bg-slate-900 text-slate-500'
                  : 'border-amber-400/30 bg-amber-400/10 text-amber-300'
              }`}>
                {selectedClass.coveredCount}/{selectedClass.medicines.length} covered on {plan.label}
              </span>
            )}
          </div>

          {selectedClass.medicines.map((med) => (
            <MedicineCard
              key={med.label}
              med={med}
              planId={planId}
              prescribed={isPrescribed(med)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
