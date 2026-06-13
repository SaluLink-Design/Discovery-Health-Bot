import { CDL_CONDITION_DETAILS } from '../data/authiData';
import { normalizeLabel } from './medicineClassifier';
import { getIngredientLabel } from './medicineIngredients';
import { getPlanFromProfile } from './profileContext';
import { buildMedicationQuizFromData } from './medicationQuizBlueprint';
import {
  conditionLabel,
  personaName,
  pickPrimaryCondition,
  planOnPhrase,
} from './quizShared';

export const fetchMedications = async (conditionId) => {
  const fallback = (CDL_CONDITION_DETAILS[conditionId]?.medications ?? []).map((label, i) => ({
    label,
    classHint: 'Formulary',
    cdaCore: 187,
    cdaExec: 250,
    id: `fallback-${i}`,
  }));

  try {
    const res = await fetch(`/api/medications?condition_id=${encodeURIComponent(conditionId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.medicines?.length) return data.medicines;
    }
  } catch {
    // offline
  }

  return fallback;
};

export const buildMedicationResultSummary = (
  profile,
  conditionId,
  listedBrand,
  cda,
  planLabel,
  ingredientName
) => {
  const name = personaName(profile);
  const label = conditionLabel(conditionId);

  const cdaBullet =
    ingredientName && cda != null
      ? `Unlisted brands of the same ingredient (${ingredientName}) are capped ${planOnPhrase(planLabel)} — Discovery pays up to R${cda} for that ingredient and you pay the pharmacy difference. Other active ingredients have different CDA caps.`
      : 'Unlisted brands are capped by active ingredient — the Chronic Drug Amount differs for each one on your plan. You pay the pharmacy difference above that cap.';

  const cdaSpeech =
    ingredientName && cda != null
      ? `Unlisted brands of ${ingredientName} are capped at ${cda} rand for that ingredient on your plan — other ingredients have different caps. You pay the pharmacy difference.`
      : 'Unlisted brands are capped by active ingredient — each one has its own Chronic Drug Amount on your plan. You pay the pharmacy difference.';

  return {
    headline: 'How medicine cover works on your profile',
    intro: `${name}, on ${planLabel} for ${label}:`,
    bullets: [
      `Listed brands on the approved medicine list (like ${normalizeLabel(listedBrand.label)}) are usually paid in full when you collect at Clicks or Dis-Chem.`,
      `Medicines not included on your plan tier may need a doctor's clinical motivation with supporting documentation before Discovery pays.`,
      cdaBullet,
      'Open Medicines below to search brands, see ingredients, and check what is on your approved list.',
    ],
    speechText: `Listed medicines on the approved list are usually paid in full at a scheme pharmacy. Medicines excluded from your plan need a doctor motivation with supporting documentation. ${cdaSpeech} When you are ready, scroll down to view your medicine cover and see which brands are listed on your plan.`,
    cta: 'View your medicine cover below to search brands and check what is on your approved list.',
  };
};

export const loadMedicationModuleQuestions = async (profile) => {
  const conditionId = pickPrimaryCondition(profile);
  const label = conditionLabel(conditionId);
  const plan = getPlanFromProfile(profile);
  const planId = plan?.id ?? null;
  const planLabel = plan?.label ?? 'your plan';
  const medicines = await fetchMedications(conditionId);

  const { questions, listedMed, cda } = buildMedicationQuizFromData(
    profile,
    medicines,
    label,
    planId,
    planLabel
  );

  const ingredientName = getIngredientLabel(listedMed);

  return {
    questions,
    resultSummary: buildMedicationResultSummary(
      profile,
      conditionId,
      listedMed,
      cda,
      planLabel,
      ingredientName
    ),
  };
};
