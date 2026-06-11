import { useEffect, useState } from 'react';
import { CDL_CONDITIONS, DISCOVERY_PLANS } from '../data/authiData';
import { DEFAULT_PERSONA_NAME } from '../data/demoCharacters';
import { AUTHI_GRADIENT, PATIENT_CLASSES } from '../lib/authiTheme';
import { PROVINCES } from '../lib/profileContext';
import GradientChip from './GradientChip';
import { PatientButtonPrimary, PatientButtonSecondary } from './PatientButton';

const fieldInput = `mt-2 ${PATIENT_CLASSES.input}`;
const fieldLabel = 'text-sm font-medium text-[#374151]';

const PlanCard = ({ plan, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(plan.id)}
    className={`group flex flex-col gap-1 rounded-2xl border p-4 text-left transition-all ${
      selected
        ? 'border-[#9F62ED]/50 bg-[#9F62ED]/10 ring-1 ring-[#9F62ED]/30'
        : 'border-[#EAECF0] bg-[#F9FAFB] hover:border-[#9F62ED]/30 hover:bg-white'
    }`}
  >
    <span className={`text-sm font-semibold ${selected ? 'text-[#9F62ED]' : 'text-[#111827]'}`}>
      {plan.label}
    </span>
    <span className="text-xs leading-5 text-[#6B7280]">{plan.tagline}</span>
  </button>
);

const CONDITION_PAGE_SIZE = 8;

export default function CampaignSetupPanel({ savedProfile, onSave, onBack }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [memberName, setMemberName] = useState(savedProfile?.name ?? DEFAULT_PERSONA_NAME);
  const [planThemeId, setPlanThemeId] = useState(savedProfile?.planThemeId ?? '');
  const [planSubThemeId, setPlanSubThemeId] = useState(savedProfile?.planSubThemeId ?? '');
  const [conditions, setConditions] = useState(savedProfile?.conditions ?? []);
  const [province, setProvince] = useState(savedProfile?.province ?? '');
  const [town, setTown] = useState(savedProfile?.town ?? '');
  const [additionalAdults, setAdditionalAdults] = useState(savedProfile?.additionalAdults ?? 0);
  const [children, setChildren] = useState(savedProfile?.children ?? 0);
  const [towns, setTowns] = useState([]);
  const [showAllConditions, setShowAllConditions] = useState(false);

  const displayName = memberName.trim() || DEFAULT_PERSONA_NAME;

  const selectedPlanTheme = DISCOVERY_PLANS.find((p) => p.id === planThemeId) ?? null;
  const availableSubThemes = selectedPlanTheme?.subThemes ?? [];
  const selectedSubTheme =
    availableSubThemes.find((s) => s.id === planSubThemeId) ??
    availableSubThemes.find((s) => s.id === selectedPlanTheme?.defaultSubThemeId) ??
    availableSubThemes[0] ??
    null;

  const canContinueStep1 = Boolean(planThemeId && selectedSubTheme);
  const canSave = canContinueStep1 && conditions.length > 0 && province;

  useEffect(() => {
    const params = new URLSearchParams();
    if (province) params.append('province', province);
    fetch(`/api/hospitals/towns?${params}`)
      .then((r) => r.json())
      .then((data) => setTowns(data.towns ?? []))
      .catch(() => setTowns([]));
  }, [province]);

  const visibleConditions = showAllConditions
    ? CDL_CONDITIONS
    : CDL_CONDITIONS.slice(0, CONDITION_PAGE_SIZE);

  const toggleCondition = (id) => {
    setConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handlePlanThemeSelect = (nextId) => {
    setPlanThemeId(nextId);
    const theme = DISCOVERY_PLANS.find((p) => p.id === nextId);
    const sub =
      theme?.subThemes?.find((s) => s.id === theme.defaultSubThemeId) ??
      theme?.subThemes?.[0] ??
      null;
    setPlanSubThemeId(sub?.id ?? '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      characterId: 'member',
      name: displayName,
      idNumber: '',
      email: '',
      medicalAid: 'discovery',
      plan: planThemeId,
      planThemeId,
      planSubThemeId: selectedSubTheme.id,
      additionalAdults: Math.max(0, Number(additionalAdults) || 0),
      children: Math.max(0, Number(children) || 0),
      conditions,
      province,
      town: town.trim(),
    });
  };

  return (
    <div className={PATIENT_CLASSES.cardLg}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="inline-flex text-xs font-bold uppercase tracking-[0.12em]"
            style={{
              background: AUTHI_GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Your profile
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[#111827]">
            Customise your plan
          </h2>
          <p className={`mt-1 ${PATIENT_CLASSES.body}`}>
            Pick your Discovery plan, chronic conditions, and location — then learn scheme literacy step by step with Authi.
          </p>
        </div>
        {onBack && (
          <PatientButtonSecondary type="button" onClick={onBack} className="shrink-0 !text-xs">
            Back
          </PatientButtonSecondary>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="flex gap-2 text-xs">
          {['1. Plan', '2. Health & location'].map((label, i) => {
            const step = i + 1;
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (step === 2 && !canContinueStep1) return;
                  setCurrentStep(step);
                }}
                className={`rounded-full px-3 py-1 font-medium ${
                  currentStep === step
                    ? 'bg-[#9F62ED]/15 text-[#9F62ED]'
                    : 'bg-[#F9FAFB] text-[#9CA3AF]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {currentStep === 1 && (
          <>
            <div>
              <label htmlFor="campaign-name" className={fieldLabel}>
                First name (for Authi&apos;s stories)
              </label>
              <input
                id="campaign-name"
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder={DEFAULT_PERSONA_NAME}
                className={fieldInput}
              />
            </div>
            <div>
              <p className={fieldLabel}>
                Discovery Health plan <span className="text-rose-400">*</span>
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {DISCOVERY_PLANS.map((p) => (
                  <PlanCard
                    key={p.id}
                    plan={p}
                    selected={planThemeId === p.id}
                    onSelect={handlePlanThemeSelect}
                  />
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="campaign-sub-theme" className={fieldLabel}>
                Plan type <span className="text-rose-400">*</span>
              </label>
              <select
                id="campaign-sub-theme"
                value={selectedSubTheme?.id ?? ''}
                onChange={(e) => setPlanSubThemeId(e.target.value)}
                disabled={!selectedPlanTheme}
                className={fieldInput}
              >
                {availableSubThemes.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <PatientButtonPrimary
              type="button"
              disabled={!canContinueStep1}
              onClick={() => setCurrentStep(2)}
            >
              Next — health & location
            </PatientButtonPrimary>
          </>
        )}

        {currentStep === 2 && (
          <>
            <div>
              <p className={fieldLabel}>
                Chronic conditions <span className="text-rose-400">*</span>
              </p>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                What chronic conditions are on {displayName}&apos;s profile?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {visibleConditions.map((c) => (
                  <GradientChip
                    key={c.id}
                    selected={conditions.includes(c.id)}
                    onClick={() => toggleCondition(c.id)}
                  >
                    {c.label}
                  </GradientChip>
                ))}
              </div>
              {CDL_CONDITIONS.length > CONDITION_PAGE_SIZE && (
                <button
                  type="button"
                  onClick={() => setShowAllConditions((v) => !v)}
                  className="mt-3 text-xs text-[#9F62ED] hover:underline"
                >
                  {showAllConditions ? 'Show fewer' : `Show all ${CDL_CONDITIONS.length} conditions`}
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="campaign-province" className={fieldLabel}>
                  Province <span className="text-rose-400">*</span>
                </label>
                <select
                  id="campaign-province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className={fieldInput}
                >
                  <option value="">Select province…</option>
                  {PROVINCES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="campaign-town" className={fieldLabel}>
                  Town / city
                </label>
                <input
                  id="campaign-town"
                  type="text"
                  list="campaign-towns"
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  placeholder="e.g. Sandton"
                  className={fieldInput}
                />
                <datalist id="campaign-towns">
                  {towns.map((t) => <option key={t} value={t} />)}
                </datalist>
              </div>
            </div>

            <div className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-4">
              <p className={fieldLabel}>Household on your plan (optional)</p>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Add other adults or children if you want to see household contribution on What I pay.
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="campaign-adults" className="text-xs text-[#6B7280]">
                    Additional adults
                  </label>
                  <input
                    id="campaign-adults"
                    type="number"
                    min={0}
                    max={10}
                    value={additionalAdults}
                    onChange={(e) => setAdditionalAdults(e.target.value)}
                    className={fieldInput}
                  />
                </div>
                <div>
                  <label htmlFor="campaign-children" className="text-xs text-[#6B7280]">
                    Children
                  </label>
                  <input
                    id="campaign-children"
                    type="number"
                    min={0}
                    max={10}
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                    className={fieldInput}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <PatientButtonSecondary type="button" onClick={() => setCurrentStep(1)}>
                Back
              </PatientButtonSecondary>
              <PatientButtonPrimary type="submit" disabled={!canSave}>
                Start literacy journey
              </PatientButtonPrimary>
            </div>
            {!canSave && (
              <p className="text-xs text-[#9CA3AF]">
                Select at least one condition and a province to continue.
              </p>
            )}
          </>
        )}
      </form>
    </div>
  );
}
