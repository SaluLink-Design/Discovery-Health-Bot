import { useEffect, useState } from 'react';
import {
  PROVINCES,
  formatPlanNetworkSummary,
  getPlanFromProfile,
  getPlanHospitalNetworks,
  isUnrestrictedHospitalPlan,
} from '../lib/profileContext';
import FeaturePageHeader from './FeaturePageHeader';
import ResultCard from './ResultCard';

const selectClass =
  'w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 appearance-none';

export default function HospitalNetworkView({ profile, onNavigate }) {
  const plan = getPlanFromProfile(profile);
  const planNetworks = getPlanHospitalNetworks(profile);
  const unrestricted = isUnrestrictedHospitalPlan(profile);
  const networkSummary = formatPlanNetworkSummary(profile);

  const [province, setProvince] = useState(profile?.province ?? '');
  const [town, setTown] = useState(profile?.town ?? '');
  const hasProfileLocation = Boolean(profile?.province || profile?.town);
  const [towns, setTowns] = useState([]);
  const [searchOutsidePlan, setSearchOutsidePlan] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (province) params.append('province', province);
    fetch(`/api/hospitals/towns?${params}`)
      .then((r) => r.json())
      .then((data) => setTowns(data.towns ?? []))
      .catch(() => {});
  }, [province]);

  const applyPlanNetworks = planNetworks && !searchOutsidePlan;

  const handleSearch = async () => {
    if (!province) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const params = new URLSearchParams({ province });
      if (applyPlanNetworks) {
        params.append('networks', planNetworks.join(','));
      }
      if (town.trim()) params.append('town', town.trim());
      const res = await fetch(`/api/hospitals/search?${params}`);
      if (!res.ok) throw new Error('Could not reach the hospital directory.');
      const data = await res.json();
      if (data.error) throw new Error(data.message || 'Unknown error from the hospital directory.');
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const planLabel = plan?.label ?? 'your plan';
  const description = unrestricted
    ? `Select a province (and optional town). As an ${planLabel} member you can use hospitals across all networks in that province.`
    : `Select a province (and optional town). Results are limited to hospitals on your ${planLabel} plan networks — no extra network filter needed.`;

  return (
    <div className="space-y-8">
      <FeaturePageHeader
        eyebrow="Hospital Network"
        eyebrowClassName="text-cyan-300"
        title="Find hospitals near you"
        description={description}
        onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
        profileContext={networkSummary}
      />

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-xl backdrop-blur">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Search hospitals
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Province <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className={selectClass}
              >
                <option value="">Select province…</option>
                {PROVINCES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Town (optional)</label>
            <input
              type="text"
              list="hospital-towns-list"
              value={town}
              onChange={(e) => setTown(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Johannesburg"
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
            />
            <datalist id="hospital-towns-list">
              {towns.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSearch}
              disabled={!province || loading}
              className="w-full rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? 'Searching…' : 'Search hospitals'}
            </button>
          </div>
        </div>

        {hasProfileLocation && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <svg className="h-3.5 w-3.5 text-cyan-400/70" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            Using your saved location
            <button
              type="button"
              onClick={() => { setProvince(''); setTown(''); }}
              className="ml-1 text-slate-600 underline underline-offset-2 hover:text-cyan-300"
            >
              Clear
            </button>
          </p>
        )}

        {planNetworks && (
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={searchOutsidePlan}
              onChange={(e) => setSearchOutsidePlan(e.target.checked)}
              className="rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-cyan-400/30"
            />
            Search outside my plan networks (all networks in province)
          </label>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-300/30 bg-rose-400/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Found{' '}
              <span className="font-semibold text-white">{results.count}</span>{' '}
              {results.count === 1 ? 'hospital' : 'hospitals'}
              {results.province ? ` in ${results.province.replace(/\b\w/g, (c) => c.toUpperCase())}` : ''}
              {results.networks?.length ? ` · ${results.networks.join(', ')}` : ''}
            </p>
          </div>

          {results.hints?.length > 0 && (
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/8 p-4 text-sm leading-6 text-cyan-100">
              {results.hints.map((hint, i) => (
                <p key={i} className="mt-1 first:mt-0">{hint}</p>
              ))}
            </div>
          )}

          <div className="grid gap-5">
            {results.sections.map((section, i) => (
              <ResultCard key={`${section.title}-${i}`} title={section.title} items={section.items} />
            ))}
          </div>
        </div>
      )}

      {!results && !loading && !error && (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/15 bg-white/3 py-20 text-center">
          <svg className="h-10 w-10 text-slate-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
          </svg>
          <p className="mt-4 text-sm text-slate-500">
            Select a province to see hospitals
            {applyPlanNetworks ? ' on your plan networks' : ' in that province'}.
          </p>
        </div>
      )}
    </div>
  );
}
