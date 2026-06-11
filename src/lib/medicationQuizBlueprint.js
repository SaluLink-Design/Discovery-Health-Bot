import { coverageBadge, isCoveredByPlan, normalizeLabel } from './medicineClassifier';
import { getIngredientLabel, isBrandMedicine } from './medicineIngredients';
import { getCdaAmount } from './medicinePaymentRules';
import {
  buildExcludedCorrectionSpeech,
  buildExcludedQ1Speech,
  buildListedCorrectionSpeech,
  buildListedQ1Speech,
  buildUnlistedCorrectionSpeech,
  buildUnlistedQ2Speech,
  speakableBrand,
} from './medicationSpeech';
import { personaName, pronouns } from './quizShared';

const EXEC_COMP_PLANS = new Set(['executive', 'comprehensive']);

export const planHasTierExclusions = (planId) => Boolean(planId && !EXEC_COMP_PLANS.has(planId));

const FALLBACK_EXCLUDED = {
  label: 'Trelegy Ellipta 92/55/22',
  execCompOnly: true,
  classHint: 'Triple combination inhalers',
  ingredientHint: 'Fluticasone/Umeclidinium/Vilanterol',
  cdaCore: 187,
  cdaExec: 250,
  id: 'fallback-excluded',
};

const FALLBACK_UNLISTED = {
  label: 'AeroMax 100mcg inhaler',
  classHint: 'Short-acting bronchodilators (SABA)',
  ingredientHint: 'Salbutamol',
  cdaCore: 187,
  cdaExec: 250,
  id: 'fallback-unlisted',
};

export const pickExcludedMedicine = (medicines = [], planId) => {
  const execOnly = medicines.find((m) => isBrandMedicine(m.label) && m.execCompOnly);
  if (execOnly) return execOnly;
  if (planId && ['core', 'keycare'].includes(planId)) {
    const keycareExcluded = medicines.find(
      (m) => isBrandMedicine(m.label) && m.notCoveredKeycare
    );
    if (keycareExcluded) return keycareExcluded;
  }
  return FALLBACK_EXCLUDED;
};

export const pickListedMedicine = (medicines = [], planId) => {
  const covered = medicines.find((m) => isBrandMedicine(m.label) && isCoveredByPlan(m, planId));
  if (covered) return covered;
  const anyBrand = medicines.find((m) => isBrandMedicine(m.label));
  return anyBrand ?? { label: 'Ventolin Evohaler 100mcg', classHint: 'SABA', ingredientHint: 'Salbutamol' };
};

export const pickUnlistedBrand = (medicines = [], planId, listedMed) => {
  const ingredient = getIngredientLabel(listedMed);
  const unlisted = medicines.find(
    (m) =>
      isBrandMedicine(m.label) &&
      normalizeLabel(m.label) !== normalizeLabel(listedMed.label) &&
      getIngredientLabel(m) === ingredient &&
      !isCoveredByPlan(m, planId)
  );
  if (unlisted) return unlisted;

  const anyUnlisted = medicines.find(
    (m) => isBrandMedicine(m.label) && !isCoveredByPlan(m, planId) && !m.execCompOnly
  );
  return anyUnlisted ?? { ...FALLBACK_UNLISTED, ingredientHint: ingredient };
};

export const buildExcludedQ1 = ({ name, label, med, planLabel, planId, doctor, subj }) => {
  const brandName = normalizeLabel(med.label);
  const ingredientName = getIngredientLabel(med);
  const badge = coverageBadge(med, planId);

  return {
    id: 'm1',
    context: `${doctor} prescribes ${brandName} for ${name}'s ${label.toLowerCase()}. The scheme reviews the claim.`,
    glossary: null,
    prompt: 'What happens next?',
    questionSpeech: buildExcludedQ1Speech({ name, brandLabel: brandName, doctor }),
    visual: 'medicine-card',
    visualMeta: {
      bare: true,
      brandName,
      ingredientName,
      pharmacy: 'Pharmacy claim',
      listed: true,
      sourceNote: `${label} · prescribed brand`,
    },
    visualAfter: 'medicine-card',
    visualAfterMeta: {
      bare: false,
      brandName,
      ingredientName,
      excludedFromPlan: true,
      exclusionLabel: badge.label,
      showMotivationNote: true,
      sourceNote: `${planLabel} · not included without motivation`,
    },
    options: [
      { id: 'full', label: 'Discovery pays the full pharmacy price' },
      { id: 'rejected', label: 'The scheme rejects it — not included on this plan' },
      { id: 'cda', label: `${subj} pays only a small amount out of pocket` },
    ],
    correct: 'rejected',
    correction: `This medicine is not included on ${planLabel}. ${doctor} must submit a clinical motivation with supporting documentation before Discovery will consider paying. Approval is not guaranteed — until then ${subj.toLowerCase()} may pay the full price.`,
    correctionBrief: buildExcludedCorrectionSpeech({ doctor, planLabel }),
    visualAfterSecondary: 'motivation',
  };
};

export const buildListedQ1 = ({ name, label, med, doctor, subj }) => {
  const brandName = normalizeLabel(med.label);
  const ingredientName = getIngredientLabel(med);

  return {
    id: 'm1',
    context: `${name} collects ${brandName} at Clicks as named on ${subj.toLowerCase()} script.`,
    glossary: null,
    prompt: 'Who pays?',
    questionSpeech: buildListedQ1Speech({ name, brandLabel: brandName }),
    visual: 'medicine-card',
    visualMeta: {
      bare: true,
      brandName,
      ingredientName,
      pharmacy: 'Clicks',
      listed: true,
      sourceNote: `${label} · on the approved list`,
    },
    visualAfter: 'medicine-card',
    visualAfterMeta: {
      bare: false,
      brandName,
      ingredientName,
      pharmacy: 'Clicks',
      listed: true,
      sourceNote: `${label} · approved medicine list`,
    },
    options: [
      { id: 'scheme', label: 'Your medical scheme' },
      { id: 'oop', label: `${subj} — out of pocket` },
      { id: 'split', label: 'Medical scheme pays half, you pay half' },
    ],
    correct: 'scheme',
    correction: `${speakableBrand(brandName)} is on the approved list. At Clicks or Dis-Chem, your medical scheme usually pays the full pharmacy price — not from your pocket.`,
    correctionBrief: buildListedCorrectionSpeech({ brandLabel: brandName }),
  };
};

export const buildUnlistedQ2 = ({ name, label, med, listedMed, planId, planLabel, cda }) => {
  const brandName = normalizeLabel(med.label);
  const ingredientName = getIngredientLabel(med);
  const pharmacyPrice = cda + 78;
  const memberPays = pharmacyPrice - cda;

  return {
    id: 'm2',
    context: `${name} goes to Clicks but only finds ${brandName} — not on the approved list.`,
    glossary: null,
    prompt: 'Your out-of-pocket cost?',
    questionSpeech: buildUnlistedQ2Speech({ name, brandLabel: brandName, pharmacyPrice, cda }),
    visual: 'medicine-card',
    visualMeta: {
      bare: true,
      brandName,
      ingredientName,
      pharmacy: 'Clicks',
      listed: false,
      sourceNote: `${label} · unlisted alternative`,
    },
    visualAfter: 'medicine-card',
    visualAfterMeta: {
      bare: false,
      brandName,
      ingredientName,
      pharmacy: 'Clicks',
      listed: false,
      showPaymentSplit: true,
      pharmacyPrice,
      schemePays: cda,
      memberPays,
      sourceNote: `Pharmacy R${pharmacyPrice} − Discovery R${cda} = you pay R${memberPays}`,
    },
    options: [
      { id: 'member', label: `R${memberPays} (pharmacy price minus R${cda})` },
      { id: 'zero', label: 'R0 — chronic medicine is always free' },
      { id: 'full', label: `R${pharmacyPrice} — you pay the full pharmacy price` },
    ],
    correct: 'member',
    correction: `On ${planLabel}, Discovery pays up to R${cda} for this ingredient. The pharmacy charged R${pharmacyPrice} — ${name} pays the difference, R${memberPays} out of pocket.`,
    correctionBrief: buildUnlistedCorrectionSpeech({ memberPays, cda }),
  };
};

export const buildMedicationQuizFromData = (profile, medicines, label, planId, planLabel) => {
  const name = personaName(profile);
  const { subj, doctor } = pronouns(profile);

  const listedMed = pickListedMedicine(medicines, planId);
  const cda = getCdaAmount(planId, listedMed) ?? 187;
  const unlistedMed = pickUnlistedBrand(medicines, planId, listedMed);

  const q1 = planHasTierExclusions(planId)
    ? buildExcludedQ1({
        name,
        label,
        med: pickExcludedMedicine(medicines, planId),
        planLabel,
        planId,
        doctor,
        subj,
      })
    : buildListedQ1({ name, label, med: listedMed, doctor, subj });

  const q2 = buildUnlistedQ2({
    name,
    label,
    med: unlistedMed,
    listedMed,
    planId,
    planLabel,
    cda,
  });

  return { questions: [q1, q2], listedMed, cda };
};
