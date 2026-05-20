import { useState } from 'react';
import { CDL_CONDITION_DETAILS, CDL_CONDITIONS, DISCOVERY_PLANS } from '../data/authiData';

const PROVINCES = [
  'Gauteng',
  'KwaZulu-Natal',
  'Western Cape',
  'Eastern Cape',
  'Mpumalanga',
  'Limpopo',
  'North West',
  'Free State',
  'Northern Cape',
];

const SectionRow = ({ label, detail }) => (
  <li className="flex items-start justify-between gap-4 border-b border-white/5 py-2.5 last:border-0">
    <span className="text-sm text-slate-300">{label}</span>
    {detail && <span className="shrink-0 text-xs font-medium text-cyan-300">{detail}</span>}
  </li>
);

const ConditionCoverageCard = ({ conditionId, onAsk }) => {
  const details = CDL_CONDITION_DETAILS[conditionId];
  const conditionLabel = CDL_CONDITIONS.find((c) => c.id === conditionId)?.label ?? conditionId;

  if (!details) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <h3 className="text-lg font-semibold text-white">{conditionLabel}</h3>
        <p className="mt-2 text-sm text-slate-400">
          Detailed coverage data is not yet available. Ask Authi for guidance.
        </p>
        <button
          type="button"
          onClick={() => onAsk(`What are the benefits for ${conditionLabel}?`)}
          className="mt-4 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/15"
        >
          Ask Authi about {conditionLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-lg shadow-cyan-950/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{details.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{details.summary}</p>
        </div>
        <button
          type="button"
          onClick={() => onAsk(`What are the treatment benefits for ${details.title}?`)}
          className="shrink-0 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/15"
        >
          Ask Authi
        </button>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {/* Treatment basket */}
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Treatment basket
          </p>
          <ul className="mt-3 divide-y divide-white/5">
            {details.treatment.diagnostic.map((item) => (
              <SectionRow
                key={item.code}
                label={item.desc}
                detail={`×${item.count} diagnostic`}
              />
            ))}
            {details.treatment.ongoing.map((item) => (
              <SectionRow
                key={item.code}
                label={item.desc}
                detail={`×${item.count} ongoing`}
              />
            ))}
          </ul>
        </div>

        {/* Medications */}
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Covered medications
          </p>
          <ul className="mt-3 space-y-2">
            {details.medications.map((med) => (
              <li key={med} className="flex items-center gap-2 text-sm text-slate-300">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/70" />
                {med}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Guidance */}
      {details.guidance?.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/80">
            Member guidance
          </p>
          <ul className="mt-2 space-y-1.5">
            {details.guidance.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs leading-5 text-amber-50/80">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400/60" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const PlanCoverageView = ({ profile, onAsk }) => {
  const [selectedProvince, setSelectedProvince] = useState('');
  const plan = DISCOVERY_PLANS.find((p) => p.id === profile.plan);
  if (!plan) return null;

  const handleFindHospitals = () => {
    const networkNames = plan.hospitalNetworkNames.join(' and ');
    const prompt = selectedProvince
      ? `List all hospitals in the ${networkNames} in ${selectedProvince}`
      : `List all hospitals in the ${networkNames}`;
    onAsk(prompt, { networkCodes: plan.hospitalNetworkCodes, planId: plan.id });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-lg shadow-cyan-950/20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Your plan
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{plan.label}</h3>
        <p className="mt-1 text-sm text-slate-400">{plan.tagline}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* Hospital networks */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Hospital networks
            </p>
            <ul className="mt-3 space-y-2">
              {plan.hospitalNetworkNames.map((network) => (
                <li key={network} className="flex items-center gap-2 text-sm text-slate-200">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                  {network}
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-400/40"
              >
                <option value="">All provinces (no filter)</option>
                {PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleFindHospitals}
                className="w-full rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/15"
              >
                {selectedProvince ? `Find hospitals in ${selectedProvince}` : 'List plan hospitals'}
              </button>
            </div>
          </div>

          {/* Key benefits */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Key benefit notes
            </p>
            <ul className="mt-3 space-y-2.5">
              {plan.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-xs leading-5 text-slate-300">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Explore CDL conditions */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Explore chronic conditions on your plan
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Select any CDL condition below to ask Authi about the coverage details.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CDL_CONDITIONS.map((condition) => (
            <button
              key={condition.id}
              type="button"
              onClick={() =>
                onAsk(
                  `What are the ${plan.label} plan benefits for ${condition.label}?`
                )
              }
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/8 hover:text-cyan-300"
            >
              {condition.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function MyCoveragePanel({ profile, onAsk }) {
  if (!profile) return null;

  const hasConditions = profile.conditions && profile.conditions.length > 0;
  const name = profile.name || 'Member';
  const plan = DISCOVERY_PLANS.find((p) => p.id === profile.plan);

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            My coverage
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            {hasConditions
              ? `${name}'s condition coverage`
              : `What the ${plan?.label ?? ''} plan covers`}
          </h2>
          {hasConditions && (
            <p className="mt-1 text-sm text-slate-400">
              Showing treatment details for your{' '}
              {profile.conditions.length === 1 ? 'condition' : `${profile.conditions.length} conditions`}.
            </p>
          )}
        </div>
      </div>

      {hasConditions ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {profile.conditions.map((conditionId) => (
            <ConditionCoverageCard key={conditionId} conditionId={conditionId} onAsk={onAsk} />
          ))}
        </div>
      ) : (
        <PlanCoverageView profile={profile} onAsk={onAsk} />
      )}
    </section>
  );
}
