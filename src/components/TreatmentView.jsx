import { useState } from 'react';
import { CDL_CONDITION_DETAILS, CDL_CONDITIONS } from '../data/authiData';
import {
  getProfileConditionLabels,
  getProfileConditions,
  hasProfileConditions,
} from '../lib/profileContext';
import FeaturePageHeader from './FeaturePageHeader';

const TYPE_FILTERS = [
  { value: 'all', label: 'All items' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'ongoing', label: 'Ongoing' },
];

const selectClass =
  'w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 appearance-none';

const TreatmentItem = ({ item, type }) => (
  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium text-slate-100">{item.desc}</p>
        <p className="mt-0.5 text-xs text-slate-500">Code: {item.code}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
          type === 'diagnostic'
            ? 'border-violet-400/30 bg-violet-400/10 text-violet-300'
            : 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
        }`}>
          {type}
        </span>
        <span className="text-xs text-slate-400">×{item.count} per year</span>
      </div>
    </div>
  </div>
);

export default function TreatmentView({ profile, onNavigate }) {
  const profileConditionIds = getProfileConditions(profile);
  const usesProfileConditions = hasProfileConditions(profile);
  const profileConditionLabels = getProfileConditionLabels(profile);

  const [browseAllConditions, setBrowseAllConditions] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(
    profileConditionIds[0] ?? CDL_CONDITIONS[0].id
  );
  const [typeFilter, setTypeFilter] = useState('all');
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const showFullConditionDropdown = !usesProfileConditions || browseAllConditions;

  const details = CDL_CONDITION_DETAILS[selectedCondition];
  const conditionLabel =
    CDL_CONDITIONS.find((c) => c.id === selectedCondition)?.label ?? selectedCondition;

  const diagnosticItems = details?.treatment?.diagnostic ?? [];
  const ongoingItems = details?.treatment?.ongoing ?? [];

  const visibleDiagnostic =
    typeFilter === 'ongoing' ? [] : diagnosticItems;
  const visibleOngoing =
    typeFilter === 'diagnostic' ? [] : ongoingItems;

  const hasLocalData = diagnosticItems.length > 0 || ongoingItems.length > 0;

  const fetchFromApi = async () => {
    setLoading(true);
    setError('');
    setApiResult(null);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `Treatment basket for ${conditionLabel}` }),
      });
      if (!res.ok) throw new Error('Could not reach the backend.');
      const data = await res.json();
      setApiResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalVisible = visibleDiagnostic.length + visibleOngoing.length;

  const profileContextLine = usesProfileConditions && !showFullConditionDropdown
    ? `Treatment basket for: ${profileConditionLabels.join(', ')}`
    : null;

  return (
    <div className="space-y-8">
      <FeaturePageHeader
        eyebrow="Treatment Plans"
        eyebrowClassName="text-violet-300"
        title="Treatment basket"
        description={
          usesProfileConditions && !showFullConditionDropdown
            ? 'View diagnostic and ongoing items for your profile conditions. Switch condition using the chips below.'
            : 'View diagnostic and ongoing treatment items from the PMB Chronic Disease List basket.'
        }
        onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
        profileContext={profileContextLine}
      />

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-xl backdrop-blur">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Filter treatment items
        </p>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          {showFullConditionDropdown && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Condition</label>
              <div className="relative">
                <select
                  value={selectedCondition}
                  onChange={(e) => { setSelectedCondition(e.target.value); setApiResult(null); }}
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
            </div>
          )}

          <div className={showFullConditionDropdown ? '' : 'sm:col-span-2'}>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Type</label>
            <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              {TYPE_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTypeFilter(value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    typeFilter === value
                      ? 'bg-violet-400/20 text-violet-200'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {usesProfileConditions && !showFullConditionDropdown && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-600">Your conditions:</span>
            {profileConditionIds.map((id) => {
              const label = CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setSelectedCondition(id); setApiResult(null); }}
                  className={`rounded-full border px-3 py-0.5 text-xs font-medium transition ${
                    selectedCondition === id
                      ? 'border-violet-400/50 bg-violet-400/15 text-violet-300'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-violet-400/30 hover:text-violet-300'
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
            {browseAllConditions ? 'Back to my profile conditions' : 'Browse all conditions'}
          </button>
        )}
      </div>

      {hasLocalData && (
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-white">{conditionLabel}</h3>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
            {totalVisible} item{totalVisible !== 1 ? 's' : ''} shown
          </span>
          {typeFilter === 'all' && (
            <>
              <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-0.5 text-xs text-violet-300">
                {visibleDiagnostic.length} diagnostic
              </span>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-xs text-cyan-300">
                {visibleOngoing.length} ongoing
              </span>
            </>
          )}
        </div>
      )}

      {hasLocalData ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {typeFilter !== 'ongoing' && visibleDiagnostic.map((item) => (
            <TreatmentItem key={item.code} item={item} type="diagnostic" />
          ))}
          {typeFilter !== 'diagnostic' && visibleOngoing.map((item) => (
            <TreatmentItem key={item.code} item={item} type="ongoing" />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/3 p-8 text-center">
          <p className="text-sm text-slate-400">
            No local treatment basket data for{' '}
            <span className="font-medium text-white">{conditionLabel}</span>.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Use the button below to fetch PDF-backed guidance from the Authi backend.
          </p>
          <button
            type="button"
            onClick={fetchFromApi}
            disabled={loading}
            className="mt-4 rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
          >
            {loading ? 'Fetching…' : 'Fetch from Authi'}
          </button>
        </div>
      )}

      {hasLocalData && !apiResult && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={fetchFromApi}
            disabled={loading}
            className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/15 disabled:opacity-50"
          >
            {loading ? 'Fetching PDF guidance…' : 'Load full PDF-backed guidance'}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-300/30 bg-rose-400/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {apiResult && (
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            PDF-backed results — {apiResult.headline}
          </p>
          {apiResult.sections.map((section, i) => (
            <section
              key={`${section.title}-${i}`}
              className="rounded-3xl border border-slate-200/10 bg-slate-950/60 p-5 shadow-lg shadow-cyan-950/20"
            >
              <h4 className="text-lg font-semibold text-white">{section.title}</h4>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {section.items.map((item) => (
                  <article
                    key={`${section.title}-${item.label}`}
                    className="rounded-2xl border border-white/8 bg-white/5 p-4"
                  >
                    <p className="font-medium text-slate-100">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{item.detail}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
