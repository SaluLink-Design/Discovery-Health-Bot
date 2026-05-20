import { useMemo, useState } from 'react';
import { CDL_CONDITION_DETAILS, CDL_CONDITIONS } from '../data/authiData';
import {
  getPlanFromProfile,
  getProfileConditionLabels,
  getProfileConditions,
  hasProfileConditions,
} from '../lib/profileContext';
import FeaturePageHeader from './FeaturePageHeader';

const selectClass =
  'w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20 appearance-none';

const ALL_CONDITIONS_CHIP = '__all__';

const buildProfileMedications = (conditionIds) => {
  const seen = new Set();
  const items = [];
  for (const conditionId of conditionIds) {
    const meds = CDL_CONDITION_DETAILS[conditionId]?.medications ?? [];
    const conditionLabel =
      CDL_CONDITIONS.find((c) => c.id === conditionId)?.label ?? conditionId;
    for (const name of meds) {
      const key = `${conditionId}:${name.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ name, conditionId, conditionLabel });
    }
  }
  return items.sort((a, b) => a.name.localeCompare(b.name));
};

export default function MedicationView({ profile, onNavigate, onEditProfile }) {
  const plan = getPlanFromProfile(profile);
  const profileConditionIds = getProfileConditions(profile);
  const usesProfileConditions = hasProfileConditions(profile);
  const profileConditionLabels = getProfileConditionLabels(profile);

  const [browseAllConditions, setBrowseAllConditions] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(
    profileConditionIds[0] ?? CDL_CONDITIONS[0].id
  );
  const [narrowCondition, setNarrowCondition] = useState(ALL_CONDITIONS_CHIP);
  const [searchText, setSearchText] = useState('');
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const showFullConditionDropdown = !usesProfileConditions || browseAllConditions;

  const profileMeds = useMemo(
    () => buildProfileMedications(profileConditionIds),
    [profileConditionIds.join(',')]
  );

  const conditionLabel =
    CDL_CONDITIONS.find((c) => c.id === selectedCondition)?.label ?? selectedCondition;

  const localMeds = usesProfileConditions && !showFullConditionDropdown
    ? profileMeds
    : (CDL_CONDITION_DETAILS[selectedCondition]?.medications ?? []).map((name) => ({
        name,
        conditionId: selectedCondition,
        conditionLabel,
      }));

  const scopedMeds = useMemo(() => {
    if (!usesProfileConditions || showFullConditionDropdown) return localMeds;
    if (narrowCondition === ALL_CONDITIONS_CHIP) return localMeds;
    return localMeds.filter((m) => m.conditionId === narrowCondition);
  }, [localMeds, narrowCondition, usesProfileConditions, showFullConditionDropdown]);

  const filteredMeds = useMemo(() => {
    if (!searchText.trim()) return scopedMeds;
    const q = searchText.toLowerCase();
    return scopedMeds.filter((m) => m.name.toLowerCase().includes(q));
  }, [scopedMeds, searchText]);

  const fetchFromApi = async () => {
    setLoading(true);
    setError('');
    setApiResult(null);
    try {
      const conditionIds =
        usesProfileConditions && narrowCondition === ALL_CONDITIONS_CHIP && !showFullConditionDropdown
          ? profileConditionIds
          : [selectedCondition];

      const responses = await Promise.all(
        conditionIds.map(async (id) => {
          const label = CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id;
          const res = await fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: `Chronic medicine formulary for ${label}` }),
          });
          if (!res.ok) throw new Error('Could not reach the backend.');
          return res.json();
        })
      );

      const mergedSections = responses.flatMap((data, idx) => {
        const id = conditionIds[idx];
        const label = CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id;
        return (data.sections ?? []).map((section) => ({
          ...section,
          title: `${label} — ${section.title}`,
        }));
      });

      setApiResult({
        headline: conditionIds.length > 1 ? 'Your chronic conditions' : conditionLabel,
        sections: mergedSections,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const planContext = plan
    ? `${plan.label} plan · Chronic Illness Benefit`
    : null;

  const profileContextLine = usesProfileConditions && !showFullConditionDropdown
    ? `Searching medicines for: ${profileConditionLabels.join(', ')}`
    : planContext;

  const hasLocalData = scopedMeds.length > 0;

  if (!usesProfileConditions && !browseAllConditions) {
    return (
      <div className="space-y-8">
        <FeaturePageHeader
          eyebrow="Medication"
          eyebrowClassName="text-emerald-300"
          title="Chronic illness medicines"
          description="Add chronic conditions in your profile to search formulary medicines tailored to you."
          onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
          profileContext={planContext}
        />
        <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/3 p-10 text-center">
          <p className="text-sm text-slate-300">
            No chronic conditions on your profile yet.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Add conditions such as Hypertension or Diabetes so Authi can search across your formulary.
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
    <div className="space-y-8">
      <FeaturePageHeader
        eyebrow="Medication"
        eyebrowClassName="text-emerald-300"
        title="Chronic illness medicines"
        description={
          usesProfileConditions && !showFullConditionDropdown
            ? 'Search across all medicines listed for your profile conditions. Results are tagged by condition.'
            : 'Browse formulary medicines from the 2026 Chronic Illness Benefit medicine list.'
        }
        onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
        profileContext={profileContextLine}
      />

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-xl backdrop-blur">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Search medication
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
                  setApiResult(null);
                  setError('');
                }}
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

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Search medication</label>
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="e.g. Metformin, insulin…"
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-9 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20"
            />
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>

        {usesProfileConditions && !showFullConditionDropdown && profileConditionIds.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-600">Narrow to:</span>
            <button
              type="button"
              onClick={() => setNarrowCondition(ALL_CONDITIONS_CHIP)}
              className={`rounded-full border px-3 py-0.5 text-xs font-medium transition ${
                narrowCondition === ALL_CONDITIONS_CHIP
                  ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-emerald-400/30 hover:text-emerald-300'
              }`}
            >
              All my conditions
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
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-emerald-400/30 hover:text-emerald-300'
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
            onClick={() => {
              setBrowseAllConditions(false);
              setNarrowCondition(ALL_CONDITIONS_CHIP);
            }}
            className="mt-3 text-xs text-emerald-400/80 hover:text-emerald-300"
          >
            Back to my profile conditions
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

      {hasLocalData && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
            {filteredMeds.length} of {scopedMeds.length} medicine{scopedMeds.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {hasLocalData ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMeds.length > 0 ? (
            filteredMeds.map((med) => (
              <div
                key={`${med.conditionId}-${med.name}`}
                className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-white/4 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-400/70" />
                  <span className="text-sm text-slate-200">{med.name}</span>
                </div>
                {usesProfileConditions && !showFullConditionDropdown && (
                  <span className="w-fit rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    {med.conditionLabel}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-white/10 py-8 text-center">
              <p className="text-sm text-slate-500">
                No medicines match &quot;{searchText}&quot;
                {narrowCondition !== ALL_CONDITIONS_CHIP
                  ? ` for ${CDL_CONDITIONS.find((c) => c.id === narrowCondition)?.label}`
                  : ' across your conditions'}.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/3 p-8 text-center">
          <p className="text-sm text-slate-400">
            No local medicine data for your selected scope.
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
            className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-400/15 disabled:opacity-50"
          >
            {loading ? 'Loading extended formulary…' : 'Load full PDF-backed formulary'}
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
            PDF-backed formulary — {apiResult.headline}
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
