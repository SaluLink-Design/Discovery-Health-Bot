import { useEffect, useMemo, useState } from 'react';
import { CDL_CONDITIONS } from '../data/authiData';
import {
  coverageBadge,
  groupMedicinesByClass,
  normalizeLabel,
} from '../lib/medicineClassifier';
import {
  filterIngredientGroups,
  groupMedicinesByIngredient,
} from '../lib/medicineIngredients';
import {
  formatCdaBadge,
  formatCdaLine,
  getCdaAmount,
  getMedicinePaymentRule,
} from '../lib/medicinePaymentRules';
import {
  medicationCdaCopayLiteracy,
  medicationSideEffectMotivationLiteracy,
} from '../lib/literacyContent';
import { getActiveMedicationsByCondition } from '../lib/prescriptionStore';
import {
  getPlanFromProfile,
  getProfileConditions,
  hasProfileConditions,
} from '../lib/profileContext';
import {
  AUTHI_GRADIENT,
  AUTHI_GRADIENT_SOFT,
  AUTHI_PURPLE,
  PATIENT_CLASSES,
} from '../lib/authiTheme';
import BrandEyebrow from './BrandEyebrow';
import { CAMPAIGN_LITERACY_ENABLED, CAMPAIGN_MEMBER_MODE } from '../lib/campaignConfig';
import { isModuleUnlocked } from '../lib/campaignStore';
import { buildMedicineIntroSpeech, MEDICINE_COVER_COPY } from '../lib/literacyModuleCopy';
import LiteracyModuleQuickCheck from './LiteracyModuleQuickCheck';
import FeaturePageHeader from './FeaturePageHeader';
import GoodToKnowCard from './GoodToKnowCard';
import GradientChip from './GradientChip';
import { GradientSegmentButton, GradientSegmentTrack } from './GradientSegment';
import { PatientButtonPrimary } from './PatientButton';

const ALL_CONDITIONS_CHIP = '__all__';

/* ── Coverage badge chip ─────────────────────────────────── */
const CoverageBadge = ({ med, planId }) => {
  const { covered, label, colour } = coverageBadge(med, planId);
  const colours = {
    emerald: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    amber: 'border-amber-300 bg-amber-50 text-amber-800',
    orange: 'border-orange-300 bg-orange-50 text-orange-800',
  };
  return (
    <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colours[colour]}`}>
      {covered ? '✓' : '!'} {label}
    </span>
  );
};

/* ── Brand medicine card (inside ingredient detail) ──────── */
const BrandMedicineCard = ({ med, planId, prescribed, conditionId }) => {
  const { covered } = coverageBadge(med, planId);
  const paymentRule = getMedicinePaymentRule(conditionId, med.label);

  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border px-4 py-3.5 transition ${
        prescribed
          ? 'border-amber-300 bg-amber-50'
          : !covered
          ? 'border-orange-200 bg-orange-50/50'
          : 'border-[#EAECF0] bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm font-medium leading-snug ${covered ? 'text-[#111827]' : 'text-[#6B7280]'}`}>
          {normalizeLabel(med.label)}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full border border-[#BAE6FD] bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
          Brand name
        </span>
        <CoverageBadge med={med} planId={planId} />
        {prescribed && (
          <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            Active prescription
          </span>
        )}
      </div>
      {med.note && <p className="text-[11px] leading-4 text-[#9CA3AF]">{med.note}</p>}
      {paymentRule?.kind === 'listed_brand' && (
        <p className="text-[11px] leading-4 text-emerald-700">
          Listed brand — generally paid in full at a DSP pharmacy (does not use the R{paymentRule.cap} cap).
        </p>
      )}
    </div>
  );
};

/* ── Ingredient row on the main list ─────────────────────── */
const IngredientCard = ({ group, planId, hasPrescribed, onClick }) => {
  const brandCount = group.brands.length;
  const uncovered = brandCount - group.coveredCount;
  const cdaBadge = formatCdaBadge(planId, group);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-[#EAECF0] bg-white px-5 py-4 text-left shadow-sm transition hover:border-[#9F62ED]/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-[#111827] group-hover:text-[#9F62ED]">
              {group.label}
            </p>
            {hasPrescribed && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-800">
                Active Rx
              </span>
            )}
            {cdaBadge && planId && (
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-semibold text-white"
                style={{ background: AUTHI_GRADIENT }}
              >
                {cdaBadge}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#6B7280]">{group.className}</p>
          <p className="mt-0.5 text-xs text-[#9CA3AF]">
            {brandCount} listed brand{brandCount !== 1 ? 's' : ''}
            {uncovered > 0 && planId && (
              <span className="ml-1.5 text-amber-700">· {uncovered} not on your plan</span>
            )}
          </p>
        </div>
        <svg
          className="mt-1 h-5 w-5 shrink-0 text-[#9CA3AF] transition group-hover:text-[#9F62ED]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </button>
  );
};

/* ── Ingredient detail (brands + class + CDA) ────────────── */
const IngredientDetail = ({ group, planId, planLabel, conditionId, isPrescribed, showSideEffectLiteracy }) => {
  const cdaLine = formatCdaLine(planId, group, planLabel);
  const cdaAmount = getCdaAmount(planId, group);
  const cdaLiteracy = medicationCdaCopayLiteracy({ cdaAmount, planLabel });
  const uncovered = group.brands.length - group.coveredCount;

  return (
    <div className="space-y-4">
      <div className={PATIENT_CLASSES.card}>
        <BrandEyebrow>Active ingredient</BrandEyebrow>
        <h2 className="mt-2 text-2xl font-semibold text-[#111827]">{group.label}</h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Medicine class: <span className="text-[#111827]">{group.className}</span>
        </p>
        {planId && (
          <p className="mt-2 text-xs text-[#9CA3AF]">
            {group.coveredCount} of {group.brands.length} listed brands covered on {planLabel}
            {uncovered > 0 && (
              <span className="text-amber-700"> · {uncovered} restricted on your plan</span>
            )}
          </p>
        )}
        {cdaLiteracy && (
          <div className="mt-4">
            <GoodToKnowCard tone="authi" {...cdaLiteracy} />
          </div>
        )}
        {cdaLine && !cdaLiteracy && (
          <div className={`mt-4 ${PATIENT_CLASSES.innerCard}`}>
            <BrandEyebrow className="!text-[10px]">What Discovery pays (CDA)</BrandEyebrow>
            <p className="mt-2 text-sm leading-6 text-[#374151]">{cdaLine}</p>
          </div>
        )}
        {showSideEffectLiteracy && (
          <div className="mt-4">
            <GoodToKnowCard
              tone="amber"
              {...medicationSideEffectMotivationLiteracy({
                medicineName: group.brands.find((b) => isPrescribed(b))?.label ?? group.label,
              })}
            />
          </div>
        )}
      </div>

      <div>
        <BrandEyebrow className="mb-3">Listed brand names</BrandEyebrow>
        <div className="space-y-2">
          {group.brands.map((med) => (
            <BrandMedicineCard
              key={med.label}
              med={med}
              planId={planId}
              prescribed={isPrescribed(med)}
              conditionId={conditionId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Class browse card (secondary view) ──────────────────── */
const ClassCard = ({ cls, planId, hasPrescribed, onClick }) => {
  const pct = cls.medicines.length ? Math.round((cls.coveredCount / cls.medicines.length) * 100) : 0;
  const uncoveredCount = cls.medicines.length - cls.coveredCount;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-[#EAECF0] bg-white px-5 py-4 text-left shadow-sm transition hover:border-[#9F62ED]/40"
    >
      <p className="text-sm font-semibold text-[#111827]">{cls.name}</p>
      <p className="mt-0.5 text-xs text-[#6B7280]">
        {cls.medicines.length} medicines
        {uncoveredCount > 0 && planId && ` · ${uncoveredCount} not on your plan`}
      </p>
      {planId && (
        <p className="mt-1 text-xs" style={{ color: AUTHI_PURPLE }}>{pct}% covered on your plan</p>
      )}
    </button>
  );
};

/* ── Active prescriptions panel ──────────────────────────── */
const ActivePrescriptionsPanel = ({ rows, plan, conditionId }) => {
  if (!rows.length) return null;

  const showAsthmaSideEffectNote =
    conditionId === 'asthma' &&
    rows.some((r) =>
      r.medications.some((m) => /lumont|montelukast|singulair|montascend/i.test(m))
    );

  return (
    <section
      className={`${PATIENT_CLASSES.card} border-amber-200`}
      style={{ background: AUTHI_GRADIENT_SOFT }}
    >
      <BrandEyebrow>Active prescriptions</BrandEyebrow>
      <p className="mt-2 text-sm text-[#374151]">Medicines you are currently using (demo simulation).</p>
      {showAsthmaSideEffectNote && (
        <div className="mt-4">
          <GoodToKnowCard
            tone="amber"
            {...medicationSideEffectMotivationLiteracy({
              medicineName: 'Lumont (montelukast)',
            })}
          />
        </div>
      )}
      <div className="mt-5 space-y-4">
        {rows.map(({ conditionId, medications }) => {
          const label = CDL_CONDITIONS.find((c) => c.id === conditionId)?.label ?? conditionId;
          return (
            <div key={conditionId}>
              <BrandEyebrow className="mb-2 !text-[10px]">{label}</BrandEyebrow>
              <div className="grid gap-2 sm:grid-cols-2">
                {medications.map((med) => (
                  <div
                    key={med}
                    className="rounded-2xl border border-amber-200 bg-white px-4 py-3.5 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-[#111827]">{normalizeLabel(med)}</p>
                    {plan && (
                      <p className="mt-1 text-[10px] text-[#9CA3AF]">
                        On your {plan.label} plan — find the ingredient below for alternatives.
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

/* ── Main component ────────────────────────────────────────── */
export default function MedicationView({
  profile,
  focusConditionId,
  onNavigate,
  onEditProfile,
  prescriptions,
  campaignRefreshKey = 0,
  browseAllConditions = false,
  onBrowseAllConditionsChange,
}) {
  const hidePrescriptionUi = CAMPAIGN_MEMBER_MODE;
  const plan = getPlanFromProfile(profile);
  const planId = plan?.id ?? null;
  const profileConditionIds = getProfileConditions(profile);
  const usesProfileConditions = hasProfileConditions(profile);

  const initialCondition =
    focusConditionId && profileConditionIds.includes(focusConditionId)
      ? focusConditionId
      : profileConditionIds[0] ?? CDL_CONDITIONS[0].id;

  const [browseAllConditionsInternal, setBrowseAllConditionsInternal] = useState(false);
  const browseAll =
    onBrowseAllConditionsChange != null ? browseAllConditions : browseAllConditionsInternal;

  const [selectedCondition, setSelectedCondition] = useState(initialCondition);
  const [narrowCondition, setNarrowCondition] = useState(
    focusConditionId && profileConditionIds.includes(focusConditionId)
      ? focusConditionId
      : ALL_CONDITIONS_CHIP
  );

  useEffect(() => {
    if (
      focusConditionId &&
      profileConditionIds.includes(focusConditionId) &&
      !browseAll
    ) {
      setSelectedCondition(focusConditionId);
      setNarrowCondition(focusConditionId);
    }
  }, [focusConditionId, profileConditionIds, browseAll]);
  const [searchText, setSearchText] = useState('');
  const [medicineData, setMedicineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [browseMode, setBrowseMode] = useState('ingredient');
  const [selectedIngredientId, setSelectedIngredientId] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [moduleUnlocked, setModuleUnlocked] = useState(
    () => !CAMPAIGN_LITERACY_ENABLED || isModuleUnlocked('medication')
  );

  useEffect(() => {
    if (!CAMPAIGN_LITERACY_ENABLED) {
      setModuleUnlocked(true);
      return;
    }
    setModuleUnlocked(isModuleUnlocked('medication'));
  }, [campaignRefreshKey]);

  const showFullConditionDropdown = !usesProfileConditions || browseAll;

  const effectiveCondition =
    usesProfileConditions && !showFullConditionDropdown && narrowCondition !== ALL_CONDITIONS_CHIP
      ? narrowCondition
      : selectedCondition;

  const conditionLabel =
    CDL_CONDITIONS.find((c) => c.id === effectiveCondition)?.label ?? effectiveCondition;

  useEffect(() => {
    let cancelled = false;
    setMedicineData(null);
    setLoading(true);
    setSelectedIngredientId(null);
    setSelectedClassId(null);

    fetch(`/api/medications?condition_id=${encodeURIComponent(effectiveCondition)}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setMedicineData(data); })
      .catch(() => {
        if (!cancelled) setMedicineData({ conditionId: effectiveCondition, medicines: [] });
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [effectiveCondition]);

  const ingredientGroups = useMemo(
    () => groupMedicinesByIngredient(medicineData?.medicines ?? [], planId),
    [medicineData, planId]
  );

  const filteredIngredients = useMemo(
    () => filterIngredientGroups(ingredientGroups, searchText),
    [ingredientGroups, searchText]
  );

  const classGroups = useMemo(
    () => groupMedicinesByClass(medicineData?.medicines ?? [], planId),
    [medicineData, planId]
  );

  const filteredClasses = useMemo(() => {
    if (!searchText.trim()) return classGroups;
    const q = searchText.toLowerCase();
    return classGroups
      .map((cls) => ({
        ...cls,
        medicines: cls.medicines.filter(
          (m) =>
            normalizeLabel(m.label).toLowerCase().includes(q) ||
            cls.name.toLowerCase().includes(q)
        ),
      }))
      .filter((cls) => cls.medicines.length > 0);
  }, [classGroups, searchText]);

  const selectedIngredient =
    filteredIngredients.find((g) => g.id === selectedIngredientId) ??
    ingredientGroups.find((g) => g.id === selectedIngredientId) ??
    null;

  const selectedClass = filteredClasses.find((c) => c.id === selectedClassId) ?? null;

  const prescribedMeds = prescriptions?.[effectiveCondition]?.medications ?? [];

  const isPrescribed = hidePrescriptionUi
    ? () => false
    : (med) =>
        prescribedMeds.some(
          (p) => normalizeLabel(p).toLowerCase() === normalizeLabel(med.label).toLowerCase()
        );

  const ingredientHasPrescribed = hidePrescriptionUi
    ? () => false
    : (group) => group.brands.some((m) => isPrescribed(m));

  const classHasPrescribed = hidePrescriptionUi
    ? () => false
    : (cls) => cls.medicines.some((m) => isPrescribed(m));

  const medicineIntroSpeech = useMemo(() => buildMedicineIntroSpeech(), []);

  const planContext = plan ? `${plan.label} plan · Chronic Illness Benefit` : null;

  const activeMedicationRows = useMemo(() => {
    const ids =
      usesProfileConditions && !browseAll
        ? profileConditionIds
        : [effectiveCondition];
    return getActiveMedicationsByCondition(prescriptions, ids);
  }, [
    prescriptions,
    profileConditionIds,
    usesProfileConditions,
    browseAll,
    effectiveCondition,
  ]);

  if (!usesProfileConditions && !browseAll) {
    return (
      <div className="space-y-8">
        <FeaturePageHeader
          title="Is my medicine covered?"
          description="Add chronic conditions to your profile to see which medicines are covered on your plan."
          onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
          profileContext={planContext}
          sourceNote="Medicine lists from the 2026 Chronic Illness Benefit formulary."
        />
        <div className={PATIENT_CLASSES.emptyState}>
          <p className="text-sm font-medium text-[#111827]">
            Add a condition to your profile to see which medicines are covered.
          </p>
          {onEditProfile && (
            <PatientButtonPrimary type="button" onClick={onEditProfile} className="mt-6">
              Add conditions to my profile
            </PatientButtonPrimary>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FeaturePageHeader
        title="Is my medicine covered?"
        description={
          plan
            ? `Browse by active ingredient for ${conditionLabel} — see listed brands and what your ${plan.label} plan pays.`
            : 'Browse medicines by active ingredient and see listed brand names.'
        }
        onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
        profileContext={planContext}
        sourceNote="Medicine lists from the 2026 Chronic Illness Benefit formulary."
      />

      {CAMPAIGN_LITERACY_ENABLED && !moduleUnlocked && (
        <LiteracyModuleQuickCheck
          moduleId="medication"
          profile={profile}
          conditionId={effectiveCondition}
          refreshKey={campaignRefreshKey}
          onUnlock={() => setModuleUnlocked(true)}
          introSpeech={medicineIntroSpeech}
          moduleIntroQuizPitch={MEDICINE_COVER_COPY.moduleIntroQuizPitch}
          startQuizLabel={MEDICINE_COVER_COPY.startQuizLabel}
          skipLabel={MEDICINE_COVER_COPY.skipLabel}
          eyebrowLabel={`${conditionLabel} · medicine cover`}
        />
      )}

      {moduleUnlocked && (
        <>
      {!hidePrescriptionUi && (
        <ActivePrescriptionsPanel
          rows={activeMedicationRows}
          plan={plan}
          conditionId={effectiveCondition}
        />
      )}

      <div className={PATIENT_CLASSES.card}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className={PATIENT_CLASSES.eyebrow}>
            {conditionLabel}
          </p>
          <GradientSegmentTrack>
            <GradientSegmentButton
              active={browseMode === 'ingredient'}
              onClick={() => {
                setBrowseMode('ingredient');
                setSelectedClassId(null);
              }}
            >
              By ingredient
            </GradientSegmentButton>
            <GradientSegmentButton
              active={browseMode === 'class'}
              onClick={() => {
                setBrowseMode('class');
                setSelectedIngredientId(null);
              }}
            >
              By class
            </GradientSegmentButton>
          </GradientSegmentTrack>
        </div>

        {showFullConditionDropdown && (
          <div className="mb-4">
            <label className={PATIENT_CLASSES.label}>Condition</label>
            <select
              value={selectedCondition}
              onChange={(e) => {
                setSelectedCondition(e.target.value);
                setSearchText('');
                setSelectedIngredientId(null);
                setSelectedClassId(null);
              }}
              className={PATIENT_CLASSES.select}
            >
              {CDL_CONDITIONS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={PATIENT_CLASSES.label}>
            Search ingredient or brand name
          </label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setSelectedIngredientId(null);
              setSelectedClassId(null);
            }}
            placeholder="e.g. Montelukast, Ventimax, Salbutamol…"
            className={PATIENT_CLASSES.input}
          />
        </div>

        {usesProfileConditions && !showFullConditionDropdown && profileConditionIds.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profileConditionIds.map((id) => {
              const label = CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id;
              return (
                <GradientChip
                  key={id}
                  selected={narrowCondition === id}
                  onClick={() => setNarrowCondition(id)}
                >
                  {label}
                </GradientChip>
              );
            })}
          </div>
        )}
      </div>

      {plan && medicineData && (
        <div
          className="flex items-center gap-3 rounded-2xl border border-[#E9D5FF] px-4 py-3"
          style={{ background: AUTHI_GRADIENT_SOFT }}
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: AUTHI_GRADIENT }}
          />
          <p className="text-xs text-[#374151]">
            <span className="font-semibold" style={{ color: AUTHI_PURPLE }}>{plan.label}</span> — coverage and CDA
            amounts from the 2026 Chronic Illness Benefit formulary.
          </p>
        </div>
      )}

      {loading && (
        <div className={PATIENT_CLASSES.emptyState}>
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-[#9F62ED]/30"
            style={{ borderTopColor: AUTHI_PURPLE }}
          />
          <p className="mt-3 text-sm text-[#6B7280]">Loading formulary…</p>
        </div>
      )}

      {/* Ingredient browse */}
      {!loading && browseMode === 'ingredient' && (
        <>
          {selectedIngredient ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedIngredientId(null)}
                className="flex items-center gap-1.5 text-xs text-[#9F62ED] hover:text-[#7c4fd4]"
              >
                ← Back to ingredients
              </button>
              <IngredientDetail
                group={selectedIngredient}
                planId={planId}
                planLabel={plan?.label ?? 'your plan'}
                conditionId={effectiveCondition}
                isPrescribed={isPrescribed}
                showSideEffectLiteracy={
                  !hidePrescriptionUi &&
                  effectiveCondition === 'asthma' &&
                  selectedIngredient.label.toLowerCase().includes('montelukast') &&
                  ingredientHasPrescribed(selectedIngredient)
                }
              />
            </>
          ) : (
            <>
              <BrandEyebrow className="mb-3">Active ingredients — tap to see brands</BrandEyebrow>
              {filteredIngredients.length === 0 ? (
                <p className="text-sm text-[#6B7280]">No ingredients match your search.</p>
              ) : (
                <div className="space-y-2">
                  {filteredIngredients.map((group) => (
                    <IngredientCard
                      key={group.id}
                      group={group}
                      planId={planId}
                      hasPrescribed={ingredientHasPrescribed(group)}
                      onClick={() => setSelectedIngredientId(group.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Class browse (secondary) */}
      {!loading && browseMode === 'class' && (
        <>
          {selectedClass ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedClassId(null)}
                className="text-xs text-[#9F62ED] hover:text-[#7c4fd4]"
              >
                ← Back to classes
              </button>
              <p className="text-sm text-[#6B7280]">{selectedClass.name}</p>
              <div className="space-y-2">
                {groupMedicinesByIngredient(selectedClass.medicines, planId).map((group) => (
                  <IngredientCard
                    key={group.id}
                    group={group}
                    planId={planId}
                    hasPrescribed={ingredientHasPrescribed(group)}
                    onClick={() => {
                      setBrowseMode('ingredient');
                      setSelectedIngredientId(group.id);
                      setSelectedClassId(null);
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {filteredClasses.map((cls) => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  planId={planId}
                  hasPrescribed={classHasPrescribed(cls)}
                  onClick={() => setSelectedClassId(cls.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
        </>
      )}
    </div>
  );
}
