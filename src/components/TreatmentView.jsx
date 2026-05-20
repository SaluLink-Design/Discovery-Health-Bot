import { useEffect, useState } from 'react';
import { CDL_CONDITIONS } from '../data/authiData';
import {
  getProfileConditionLabels,
  getProfileConditions,
  hasProfileConditions,
} from '../lib/profileContext';
import { getUsedCount, isTreatmentReceived } from '../lib/prescriptionStore';
import FeaturePageHeader from './FeaturePageHeader';

const selectClass =
  'w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-violet-400/40 focus:ring-1 focus:ring-violet-400/20 appearance-none';

const CheckIcon = () => (
  <svg className="h-3.5 w-3.5 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Treatment card — Chronic App style
───────────────────────────────────────────────────────────── */
const TreatmentCard = ({ item, received, usedCount }) => {
  const total = item.count;
  const hasUsage = received && usedCount !== null;
  const used = hasUsage ? usedCount : received ? 1 : 0;
  const remaining = hasUsage ? Math.max(0, total - used) : received ? 0 : total;
  const fullyDone = received && !hasUsage;

  return (
    <div className={`rounded-2xl border px-5 py-4 transition ${
      received
        ? 'border-amber-400/40 bg-amber-400/8 shadow-md shadow-amber-950/20'
        : 'border-white/8 bg-white/4'
    }`}>
      <div className="flex items-start gap-3">
        {/* Tick — received care */}
        <div
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
            received
              ? 'border-amber-400 bg-amber-400/25'
              : 'border-slate-600 bg-slate-900/80'
          }`}
          aria-hidden
        >
          {received ? <CheckIcon /> : null}
        </div>

        <div className="flex flex-1 min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold leading-snug ${received ? 'text-amber-100' : 'text-slate-100'}`}>
              {item.desc}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Code: <span className="font-mono text-slate-400">{item.code}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {fullyDone && (
                <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                  ✓ Received
                </span>
              )}
              {hasUsage && (
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                  In progress
                </span>
              )}
              {!received && (
                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/8 px-2 py-0.5 text-[10px] font-medium text-emerald-300/90">
                  Available
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className={`text-base font-bold tabular-nums ${received ? 'text-amber-400' : 'text-emerald-400/90'}`}>
              {hasUsage ? `${remaining} left` : fullyDone ? 'Done' : `Max: ${total}`}
            </p>
            <p className="text-[10px] text-slate-600">
              {hasUsage ? `of ${total} covered/yr` : fullyDone ? 'completed' : 'covered/yr'}
            </p>
          </div>
        </div>
      </div>

      {/* Usage progress bar */}
      {hasUsage && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-amber-300">
              {used} of {total} used this year
              {remaining > 0 && (
                <span className="ml-1.5 text-emerald-300">· {remaining} remaining covered</span>
              )}
              {remaining === 0 && (
                <span className="ml-1.5 text-slate-500">· benefit used for this year</span>
              )}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${Math.min(100, (used / total) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Section (Diagnostic Basket / Ongoing Management)
───────────────────────────────────────────────────────────── */
const BasketSection = ({ title, basketType, items, prescriptions, conditionId, accentColour }) => {
  if (!items || items.length === 0) return null;
  const received = items.filter((it) =>
    isTreatmentReceived(prescriptions, conditionId, basketType, it.code)
  ).length;

  const accents = {
    violet: {
      section: 'border-violet-400/15 bg-violet-400/5',
      badge: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
      dot: 'bg-violet-400',
    },
    cyan: {
      section: 'border-cyan-400/15 bg-cyan-400/5',
      badge: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
      dot: 'bg-cyan-400',
    },
  };
  const ac = accents[accentColour] ?? accents.violet;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className={`flex items-center justify-between rounded-2xl border px-5 py-3.5 ${ac.section}`}>
        <div className="flex items-center gap-2.5">
          <span className={`flex h-2 w-2 rounded-full ${ac.dot}`} />
          <p className="text-sm font-semibold text-slate-100">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {items.length} procedure{items.length !== 1 ? 's' : ''}
          </span>
          {received > 0 && (
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ac.badge}`}>
              {received} received
            </span>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {items.map((item) => {
          const isReceived = isTreatmentReceived(prescriptions, conditionId, basketType, item.code);
          const uc = isReceived ? getUsedCount(prescriptions, conditionId, item.code) : null;
          return (
            <TreatmentCard
              key={`${basketType}-${item.code}-${item.count}`}
              item={item}
              received={isReceived}
              usedCount={uc}
            />
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */
export default function TreatmentView({ profile, onNavigate, prescriptions }) {
  const profileConditionIds = getProfileConditions(profile);
  const usesProfileConditions = hasProfileConditions(profile);
  const profileConditionLabels = getProfileConditionLabels(profile);

  const [browseAllConditions, setBrowseAllConditions] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(
    profileConditionIds[0] ?? CDL_CONDITIONS[0].id
  );
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(false);

  const showFullConditionDropdown = !usesProfileConditions || browseAllConditions;

  const conditionLabel =
    CDL_CONDITIONS.find((c) => c.id === selectedCondition)?.label ?? selectedCondition;

  const conditionRx = prescriptions?.[selectedCondition];
  const receivedCount = conditionRx?.treatments?.length ?? 0;

  /* Fetch structured treatment basket from PDF-backed endpoint */
  useEffect(() => {
    let cancelled = false;
    setPdfData(null);
    setLoading(true);

    fetch(`/api/treatments?condition_id=${encodeURIComponent(selectedCondition)}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setPdfData(data); })
      .catch(() => { if (!cancelled) setPdfData({ diagnostic: [], ongoing: [] }); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [selectedCondition]);

  const profileContextLine = usesProfileConditions && !showFullConditionDropdown
    ? `Treatment basket for: ${profileConditionLabels.join(', ')}`
    : null;

  const hasDiagnostic = pdfData?.diagnostic?.length > 0;
  const hasOngoing = pdfData?.ongoing?.length > 0;
  const hasPdfData = hasDiagnostic || hasOngoing;

  return (
    <div className="space-y-6">
      <FeaturePageHeader
        eyebrow="Treatment Plans"
        eyebrowClassName="text-violet-300"
        title="Treatment basket"
        description="Your PMB treatment basket from the 2026 Chronic Disease List — showing covered diagnostic tests and ongoing management procedures."
        onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
        profileContext={profileContextLine}
      />

      {/* ── Condition selector ───────────────────── */}
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-xl backdrop-blur">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Select condition
        </p>

        {showFullConditionDropdown && (
          <div className="relative">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className={selectClass}
            >
              {CDL_CONDITIONS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        )}

        {usesProfileConditions && !showFullConditionDropdown && (
          <div className="flex flex-wrap items-center gap-2">
            {profileConditionIds.map((id) => {
              const label = CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedCondition(id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selectedCondition === id
                      ? 'border-violet-400/50 bg-violet-400/15 text-violet-300'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:text-violet-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {usesProfileConditions && (
          <button
            type="button"
            onClick={() => setBrowseAllConditions((v) => !v)}
            className="mt-3 text-xs text-slate-500 hover:text-violet-300"
          >
            {browseAllConditions ? '← Back to my profile conditions' : 'Browse all conditions'}
          </button>
        )}
      </div>

      {/* ── Loading ───────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-white/8 bg-white/3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
          <p className="mt-3 text-sm text-slate-500">Loading treatment basket from PDF…</p>
        </div>
      )}

      {/* ── Empty state ───────────────────────────── */}
      {!loading && pdfData && !hasPdfData && (
        <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/3 p-8 text-center">
          <p className="text-sm text-slate-400">No treatment basket data found for {conditionLabel}.</p>
        </div>
      )}

      {/* ── Prescription summary banner ───────────── */}
      {!loading && hasPdfData && receivedCount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-400/20">
            <CheckIcon />
          </span>
          <div>
            <p className="text-xs font-semibold text-amber-300">
              {conditionLabel} — your treatment history
            </p>
            <p className="text-[11px] text-slate-500">
              Ticked items are care you have already received. Others show what is still available on your basket.
            </p>
          </div>
        </div>
      )}

      {/* ── Diagnostic Basket ─────────────────────── */}
      {!loading && hasDiagnostic && (
        <BasketSection
          title="Diagnostic Basket"
          basketType="diagnostic"
          items={pdfData.diagnostic}
          prescriptions={prescriptions}
          conditionId={selectedCondition}
          accentColour="violet"
        />
      )}

      {/* ── Ongoing Management ───────────────────── */}
      {!loading && hasOngoing && (
        <BasketSection
          title="Ongoing Management Basket"
          basketType="ongoing"
          items={pdfData.ongoing}
          prescriptions={prescriptions}
          conditionId={selectedCondition}
          accentColour="cyan"
        />
      )}
    </div>
  );
}
