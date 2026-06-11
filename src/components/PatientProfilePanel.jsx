import { useEffect, useState } from 'react';
import { CDL_CONDITIONS, DISCOVERY_PLANS } from '../data/authiData';
import { AUTHI_GRADIENT, PATIENT_CLASSES } from '../lib/authiTheme';
import { PROVINCES } from '../lib/profileContext';
import GradientChip from './GradientChip';
import { PatientButtonPrimary, PatientButtonSecondary } from './PatientButton';

const fieldInput = `mt-2 ${PATIENT_CLASSES.input}`;
const fieldLabel = 'text-sm font-medium text-[#374151]';

const CONDITION_PAGE_SIZE = 8;
const MEDICAL_AID_OPTIONS = [{ id: 'discovery', label: 'Discovery Health' }];

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
    <span
      className={`text-sm font-semibold ${selected ? 'text-[#9F62ED]' : 'text-[#111827]'}`}
    >
      {plan.label}
    </span>
    <span className="text-xs leading-5 text-[#6B7280]">
      {plan.tagline}
    </span>
  </button>
);

const MemberCounter = ({ label, hint, value, onChange, min = 0, max = 10 }) => (
  <div className={`flex items-center justify-between ${PATIENT_CLASSES.innerCard}`}>
    <div>
      <p className="text-sm font-medium text-[#111827]">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-[#9CA3AF]">{hint}</p>}
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Remove one ${label.toLowerCase()}`}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-lg text-[#374151] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-30"
      >
        −
      </button>
      <span className="min-w-[2ch] text-center text-lg font-semibold tabular-nums text-[#111827]">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Add one ${label.toLowerCase()}`}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#9F62ED]/40 bg-[#9F62ED]/10 text-lg text-[#9F62ED] transition hover:bg-[#9F62ED]/20 disabled:cursor-not-allowed disabled:opacity-30"
      >
        +
      </button>
    </div>
  </div>
);

const ConditionChip = ({ condition, selected, onToggle }) => (
  <GradientChip selected={selected} onClick={() => onToggle(condition.id)}>
    {condition.label}
  </GradientChip>
);

export default function PatientProfilePanel({
  onSave,
  onEdit,
  isEditing,
  savedProfile,
  characterLabel,
  householdMode = 'solo',
}) {
  const [name, setName] = useState(savedProfile?.name ?? '');
  const [idNumber, setIdNumber] = useState(savedProfile?.idNumber ?? '');
  const [email, setEmail] = useState(savedProfile?.email ?? '');
  const [medicalAid, setMedicalAid] = useState(savedProfile?.medicalAid ?? 'discovery');
  const [planThemeId, setPlanThemeId] = useState(savedProfile?.planThemeId ?? savedProfile?.plan ?? '');
  const [planSubThemeId, setPlanSubThemeId] = useState(savedProfile?.planSubThemeId ?? '');
  const [additionalAdults, setAdditionalAdults] = useState(savedProfile?.additionalAdults ?? 0);
  const [children, setChildren] = useState(savedProfile?.children ?? 0);
  const [hasDependants, setHasDependants] = useState(
    (savedProfile?.additionalAdults ?? 0) > 0 || (savedProfile?.children ?? 0) > 0
  );
  const [conditions, setConditions] = useState(savedProfile?.conditions ?? []);
  const [province, setProvince] = useState(savedProfile?.province ?? '');
  const [town, setTown] = useState(savedProfile?.town ?? '');
  const [towns, setTowns] = useState([]);
  const [showAllConditions, setShowAllConditions] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [planSetupPhase, setPlanSetupPhase] = useState('plan');

  const selectedPlanTheme = DISCOVERY_PLANS.find((plan) => plan.id === planThemeId) ?? null;
  const availableSubThemes = selectedPlanTheme?.subThemes ?? [];
  const selectedSubTheme =
    availableSubThemes.find((subTheme) => subTheme.id === planSubThemeId) ??
    availableSubThemes.find((subTheme) => subTheme.id === selectedPlanTheme?.defaultSubThemeId) ??
    availableSubThemes[0] ??
    null;

  const canContinueStep1 = name.trim().length > 0 && medicalAid;
  const canContinueStep2 = Boolean(planThemeId && selectedSubTheme);

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
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handlePlanThemeSelect = (nextPlanThemeId) => {
    setPlanThemeId(nextPlanThemeId);
    const nextPlanTheme = DISCOVERY_PLANS.find((plan) => plan.id === nextPlanThemeId);
    const nextSubTheme =
      nextPlanTheme?.subThemes?.find((subTheme) => subTheme.id === nextPlanTheme.defaultSubThemeId) ??
      nextPlanTheme?.subThemes?.[0] ??
      null;
    setPlanSubThemeId(nextSubTheme?.id ?? '');
  };

  const adultCount = Number.parseInt(additionalAdults, 10) || 0;
  const childCount = Number.parseInt(children, 10) || 0;
  const showHouseholdSection = householdMode === 'family';

  useEffect(() => {
    if (!showHouseholdSection) {
      setHasDependants(false);
      setAdditionalAdults(0);
      setChildren(0);
      setPlanSetupPhase('plan');
    }
  }, [showHouseholdSection]);

  const handleJustMe = () => {
    setHasDependants(false);
    setAdditionalAdults(0);
    setChildren(0);
    setPlanSetupPhase('plan');
  };

  const syncHouseholdFromCounts = () => {
    if (adultCount === 0 && childCount === 0) {
      setHasDependants(false);
    } else {
      setHasDependants(true);
    }
  };

  const exitHouseholdPhase = () => {
    syncHouseholdFromCounts();
    setPlanSetupPhase('plan');
  };

  const handleAddMembers = () => {
    setHasDependants(true);
    if ((Number.parseInt(additionalAdults, 10) || 0) === 0 && (Number.parseInt(children, 10) || 0) === 0) {
      setAdditionalAdults(1);
    }
    setPlanSetupPhase('household');
  };

  const handlePlanSetupBack = () => {
    if (currentStep === 2 && planSetupPhase === 'household') {
      exitHouseholdPhase();
      return;
    }
    if (currentStep === 2) setPlanSetupPhase('plan');
    setCurrentStep((step) => Math.max(1, step - 1));
  };

  const handleNextStep = () => {
    if (currentStep === 2 && planSetupPhase === 'household') {
      exitHouseholdPhase();
    }
    setCurrentStep((step) => Math.min(3, step + 1));
  };

  const householdSummary =
    hasDependants && (adultCount > 0 || childCount > 0)
      ? [
          adultCount > 0 ? `${adultCount} adult${adultCount > 1 ? 's' : ''}` : null,
          childCount > 0 ? `${childCount} child${childCount > 1 ? 'ren' : ''}` : null,
        ]
          .filter(Boolean)
          .join(', ')
      : null;

  const handleSave = (event) => {
    event.preventDefault();
    if (!canContinueStep1 || !canContinueStep2) return;
    onSave({
      ...(savedProfile?.characterId ? { characterId: savedProfile.characterId } : {}),
      name: name.trim(),
      idNumber: idNumber.trim(),
      email: email.trim(),
      medicalAid,
      plan: planThemeId,
      planThemeId,
      planSubThemeId: selectedSubTheme.id,
      additionalAdults: showHouseholdSection && hasDependants ? adultCount : 0,
      children: showHouseholdSection && hasDependants ? childCount : 0,
      conditions,
      province,
      town: town.trim(),
    });
  };

  if (!isEditing && savedProfile) {
    const savedPlan = DISCOVERY_PLANS.find(
      (p) => p.id === (savedProfile.planThemeId ?? savedProfile.plan)
    );
    const savedSubTheme = savedPlan?.subThemes?.find(
      (subTheme) => subTheme.id === savedProfile.planSubThemeId
    );
    const savedAdults = savedProfile.additionalAdults ?? 0;
    const savedChildren = savedProfile.children ?? 0;
    const householdLabel =
      savedAdults > 0 || savedChildren > 0
        ? [
            savedAdults > 0 ? `${savedAdults} adult${savedAdults > 1 ? 's' : ''}` : null,
            savedChildren > 0 ? `${savedChildren} child${savedChildren > 1 ? 'ren' : ''}` : null,
          ]
            .filter(Boolean)
            .join(', ')
        : 'Just me';
    return (
      <div className={`flex items-center justify-between ${PATIENT_CLASSES.card}`}>
        <div className="flex items-center gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ background: AUTHI_GRADIENT }}
          >
            {savedProfile.name ? savedProfile.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">
              {savedProfile.name || 'Member'}
              {savedProfile.medicalAid && (
                <span className="ml-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-xs font-medium text-[#6B7280]">
                  {MEDICAL_AID_OPTIONS.find((opt) => opt.id === savedProfile.medicalAid)?.label ??
                    savedProfile.medicalAid}
                </span>
              )}
              <span className="ml-2 rounded-full border border-[#9F62ED]/30 bg-[#9F62ED]/10 px-2 py-0.5 text-xs font-medium text-[#9F62ED]">
                {savedPlan?.label ?? savedProfile.plan}
              </span>
              {savedSubTheme && (
                <span className="ml-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-xs font-medium text-[#6B7280]">
                  {savedSubTheme.label}
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">Household: {householdLabel}</p>
            {savedProfile.conditions.length > 0 ? (
              <p className="mt-0.5 text-xs text-[#6B7280]">
                Chronic:{' '}
                {savedProfile.conditions
                  .map((id) => CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id)
                  .join(', ')}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-[#9CA3AF]">No chronic conditions on record</p>
            )}
          </div>
        </div>
        <PatientButtonSecondary type="button" onClick={onEdit} className="!px-4 !py-1.5 !text-xs">
          Edit profile
        </PatientButtonSecondary>
      </div>
    );
  }

  return (
    <div className={PATIENT_CLASSES.cardLg}>
      <div className="flex items-start justify-between">
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
            {characterLabel ? `Build your ${characterLabel.toLowerCase()} profile` : 'Set up your profile'}
          </h2>
          <p className={`mt-1 ${PATIENT_CLASSES.body}`}>
            {characterLabel
              ? 'Add your details and location, choose your plan — then explore what your scheme covers.'
              : 'Tell us your plan and health context so we can show what your scheme covers.'}
          </p>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            For testing — fake details are fine. Nothing is linked to Discovery Health.
          </p>
        </div>
        {savedProfile && !savedProfile.characterId && (
          <PatientButtonSecondary type="button" onClick={onEdit} className="!px-4 !py-1.5 !text-xs">
            Cancel
          </PatientButtonSecondary>
        )}
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <div className="flex items-center gap-2 text-xs">
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => {
                if (step === 1) {
                  setPlanSetupPhase('plan');
                  setCurrentStep(1);
                }
                if (step === 2 && canContinueStep1) {
                  setPlanSetupPhase('plan');
                  setCurrentStep(2);
                }
                if (step === 3 && canContinueStep1 && canContinueStep2) {
                  setPlanSetupPhase('plan');
                  setCurrentStep(3);
                }
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                currentStep === step
                  ? 'bg-[#9F62ED]/15 text-[#9F62ED]'
                  : 'bg-[#F9FAFB] text-[#9CA3AF]'
              }`}
            >
              {step === 1 ? '1. About you' : step === 2 ? '2. Your plan' : '3. Your chronic conditions'}
            </button>
          ))}
        </div>

        {currentStep === 1 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-id-number" className={fieldLabel}>
                  ID number <span className="text-slate-500">(optional for testing)</span>
                </label>
                <input
                  id="profile-id-number"
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. 9001011234088"
                  className={fieldInput}
                />
              </div>
              <div>
                <label htmlFor="profile-name" className={fieldLabel}>
                  Full name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Thula Moipolai"
                  className={fieldInput}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-email" className={fieldLabel}>
                  Email <span className="text-slate-500">(optional for testing)</span>
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. member@email.com"
                  className={fieldInput}
                />
              </div>
              <div>
                <label htmlFor="profile-medical-aid" className={fieldLabel}>
                  Medical aid <span className="text-rose-400">*</span>
                </label>
                <select
                  id="profile-medical-aid"
                  value={medicalAid}
                  onChange={(e) => setMedicalAid(e.target.value)}
                  className={fieldInput}
                >
                  {MEDICAL_AID_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-province" className={fieldLabel}>
                  Province <span className="text-slate-500">(optional)</span>
                </label>
                <div className="relative mt-2">
                  <select
                    id="profile-province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className={PATIENT_CLASSES.select}
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
                <label htmlFor="profile-town" className={fieldLabel}>
                  Town / city <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  id="profile-town"
                  type="text"
                  list="profile-towns-list"
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  placeholder="e.g. Randburg"
                  className={fieldInput}
                />
                <datalist id="profile-towns-list">
                  {towns.map((t) => <option key={t} value={t} />)}
                </datalist>
              </div>
            </div>
          </>
        )}

        {currentStep === 2 && planSetupPhase === 'plan' && (
          <>
        <div>
          <p className={fieldLabel}>
            Your Discovery Health plan <span className="text-rose-400">*</span>
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
          <label htmlFor="profile-sub-theme" className={fieldLabel}>
            Your plan type <span className="text-rose-400">*</span>
          </label>
          <div className="relative mt-2">
            <select
              id="profile-sub-theme"
              value={selectedSubTheme?.id ?? ''}
              onChange={(event) => setPlanSubThemeId(event.target.value)}
              disabled={!selectedPlanTheme}
              className={`${PATIENT_CLASSES.select} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {!selectedPlanTheme && <option value="">Select a plan first...</option>}
              {selectedPlanTheme &&
                availableSubThemes.map((subTheme) => (
                  <option key={subTheme.id} value={subTheme.id}>
                    {subTheme.label}
                  </option>
                ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {showHouseholdSection && (
        <div className={PATIENT_CLASSES.innerCard}>
          <p className={fieldLabel}>Household on your membership</p>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            This scenario includes family on your plan — adjust who is covered.
          </p>
          {hasDependants && householdSummary ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#9F62ED]/10 px-3 py-1.5 text-xs text-[#9F62ED]">
                {householdSummary} added
              </span>
              <button
                type="button"
                onClick={() => setPlanSetupPhase('household')}
                className={PATIENT_CLASSES.chip}
              >
                Edit members
              </button>
              <button
                type="button"
                onClick={handleJustMe}
                className="rounded-full px-3 py-1.5 text-xs text-[#9CA3AF] transition hover:text-[#6B7280]"
              >
                Remove all
              </button>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleJustMe}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                  !hasDependants ? 'bg-[#9F62ED]/15 text-[#9F62ED]' : 'bg-[#F9FAFB] text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                No, just me
              </button>
              <button
                type="button"
                onClick={handleAddMembers}
                disabled={!canContinueStep2}
                className="rounded-full bg-[#9F62ED]/10 px-4 py-2 text-xs font-medium text-[#9F62ED] ring-1 ring-[#9F62ED]/30 transition hover:bg-[#9F62ED]/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Yes, add members →
              </button>
            </div>
          )}
        </div>
        )}
        </>
        )}

        {showHouseholdSection && currentStep === 2 && planSetupPhase === 'household' && (
          <>
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
              <button
                type="button"
                onClick={exitHouseholdPhase}
                className="text-[#9F62ED] transition hover:text-[#7c4fd4]"
              >
                Your plan
              </button>
              <span>/</span>
              <span className="text-[#374151]">Household members</span>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#111827]">Add family members</h3>
              <p className="mt-1 text-sm text-[#6B7280]">
                {selectedPlanTheme?.label} · {selectedSubTheme?.label}
              </p>
            </div>

            <div className="space-y-3">
              <MemberCounter
                label="Additional adults"
                hint="Spouse or partner on your plan"
                value={adultCount}
                onChange={setAdditionalAdults}
              />
              <MemberCounter
                label="Children"
                hint="Dependants under 21 on your plan"
                value={childCount}
                onChange={setChildren}
              />
            </div>

            {(adultCount > 0 || childCount > 0) && (
              <p className="text-sm text-[#374151]">
                Your household: you +{' '}
                {[
                  adultCount > 0 ? `${adultCount} adult${adultCount > 1 ? 's' : ''}` : null,
                  childCount > 0 ? `${childCount} child${childCount > 1 ? 'ren' : ''}` : null,
                ]
                  .filter(Boolean)
                  .join(' and ')}
              </p>
            )}

            {adultCount === 0 && childCount === 0 && (
              <p className="text-xs text-slate-500">
                Add at least one adult or child, or go back and choose &ldquo;No, just me&rdquo;.
              </p>
            )}
          </>
        )}

        {currentStep === 3 && (
        <div>
          <p className={fieldLabel}>
            Your chronic conditions{' '}
            <span className="text-slate-500">(select all that apply)</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Pick the conditions you want to explore — this unlocks care and medicine cover in the app.
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
              className="mt-3 text-xs text-[#9F62ED] hover:text-[#7c4fd4]"
            >
              {showAllConditions
                ? 'Show fewer conditions'
                : `Show all ${CDL_CONDITIONS.length} conditions`}
            </button>
          )}
          {conditions.length > 0 && (
            <p className="mt-2 text-xs text-[#9F62ED]">
              {conditions.length} condition{conditions.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          {currentStep > 1 && (
            <PatientButtonSecondary type="button" onClick={handlePlanSetupBack}>
              Back
            </PatientButtonSecondary>
          )}
          {currentStep < 3 && (
            <PatientButtonPrimary
              type="button"
              onClick={handleNextStep}
              disabled={
                (currentStep === 1 && !canContinueStep1) ||
                (currentStep === 2 && !canContinueStep2) ||
                (showHouseholdSection &&
                  currentStep === 2 &&
                  planSetupPhase === 'household' &&
                  adultCount === 0 &&
                  childCount === 0)
              }
            >
              {currentStep === 2 && showHouseholdSection && planSetupPhase === 'household'
                ? 'Done adding members'
                : 'Next step'}
            </PatientButtonPrimary>
          )}
          {currentStep === 3 && (
            <PatientButtonPrimary type="submit">
              Save profile
            </PatientButtonPrimary>
          )}
          {currentStep === 1 && !canContinueStep1 && (
            <p className="text-xs text-slate-500">Enter your name to continue.</p>
          )}
          {currentStep === 2 && !canContinueStep2 && (
            <p className="text-xs text-slate-500">Select your plan and plan type to continue.</p>
          )}
        </div>
      </form>
    </div>
  );
}
