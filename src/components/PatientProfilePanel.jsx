import { useState } from 'react';
import { CDL_CONDITIONS, DISCOVERY_PLANS } from '../data/authiData';

const CONDITION_PAGE_SIZE = 8;

const PlanCard = ({ plan, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(plan.id)}
    className={`group flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all ${
      selected
        ? 'border-cyan-400/60 bg-cyan-400/10 ring-1 ring-cyan-400/40'
        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
    }`}
  >
    <span
      className={`text-sm font-semibold ${selected ? 'text-cyan-200' : 'text-white'}`}
    >
      {plan.label}
    </span>
    <span className="text-xs leading-5 text-slate-400 group-hover:text-slate-300">
      {plan.tagline}
    </span>
  </button>
);

const ConditionChip = ({ condition, selected, onToggle }) => (
  <button
    type="button"
    onClick={() => onToggle(condition.id)}
    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
      selected
        ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200'
        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
    }`}
  >
    {condition.label}
  </button>
);

export default function PatientProfilePanel({ onSave, onEdit, isEditing, savedProfile }) {
  const [name, setName] = useState(savedProfile?.name ?? '');
  const [plan, setPlan] = useState(savedProfile?.plan ?? '');
  const [conditions, setConditions] = useState(savedProfile?.conditions ?? []);
  const [showAllConditions, setShowAllConditions] = useState(false);

  const visibleConditions = showAllConditions
    ? CDL_CONDITIONS
    : CDL_CONDITIONS.slice(0, CONDITION_PAGE_SIZE);

  const toggleCondition = (id) => {
    setConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!plan) return;
    onSave({ name: name.trim(), plan, conditions });
  };

  if (!isEditing && savedProfile) {
    const savedPlan = DISCOVERY_PLANS.find((p) => p.id === savedProfile.plan);
    return (
      <div className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-slate-950/70 px-6 py-4 shadow-xl shadow-cyan-950/20 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-lg font-bold text-cyan-300">
            {savedProfile.name ? savedProfile.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {savedProfile.name || 'Member'}
              <span className="ml-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-xs font-medium text-cyan-300">
                {savedPlan?.label ?? savedProfile.plan}
              </span>
            </p>
            {savedProfile.conditions.length > 0 ? (
              <p className="mt-0.5 text-xs text-slate-400">
                Chronic:{' '}
                {savedProfile.conditions
                  .map((id) => CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id)
                  .join(', ')}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-slate-500">No chronic conditions on record</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/25 hover:text-white"
        >
          Edit profile
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Patient Profile
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-white">Set up your profile</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Authi uses your plan and conditions to show you the right coverage details instantly.
          </p>
        </div>
        {savedProfile && (
          <button
            type="button"
            onClick={onEdit}
            className="mt-1 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="profile-name" className="text-sm font-medium text-slate-200">
            Your name <span className="text-slate-500">(optional)</span>
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Thula"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
          />
        </div>

        {/* Plan */}
        <div>
          <p className="text-sm font-medium text-slate-200">
            Your Discovery Health plan <span className="text-rose-400">*</span>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {DISCOVERY_PLANS.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={plan === p.id}
                onSelect={setPlan}
              />
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div>
          <p className="text-sm font-medium text-slate-200">
            Chronic conditions{' '}
            <span className="text-slate-500">(select all that apply)</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            These are the 25 CDL conditions covered by Discovery Health.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {visibleConditions.map((condition) => (
              <ConditionChip
                key={condition.id}
                condition={condition}
                selected={conditions.includes(condition.id)}
                onToggle={toggleCondition}
              />
            ))}
          </div>
          {CDL_CONDITIONS.length > CONDITION_PAGE_SIZE && (
            <button
              type="button"
              onClick={() => setShowAllConditions((v) => !v)}
              className="mt-3 text-xs text-cyan-400 hover:text-cyan-300"
            >
              {showAllConditions
                ? 'Show fewer conditions'
                : `Show all ${CDL_CONDITIONS.length} conditions`}
            </button>
          )}
          {conditions.length > 0 && (
            <p className="mt-2 text-xs text-cyan-300">
              {conditions.length} condition{conditions.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!plan}
            className="rounded-full bg-cyan-300 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save profile
          </button>
          {!plan && (
            <p className="text-xs text-slate-500">Select a plan to continue.</p>
          )}
        </div>
      </form>
    </div>
  );
}
