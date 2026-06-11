import { CDL_CONDITION_DETAILS } from '../data/authiData';
import { normalizeLabel } from './medicineClassifier';
import { getPlanFromProfile } from './profileContext';
import { buildMedicationQuizFromData } from './medicationQuizBlueprint';
import {
  conditionLabel,
  personaName,
  pickPrimaryCondition,
} from './quizShared';

export const fetchMedications = async (conditionId) => {
  try {
    const res = await fetch(`/api/medications?condition_id=${encodeURIComponent(conditionId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.medicines?.length) return data.medicines;
    }
  } catch {
    // offline
  }
  const fallback = CDL_CONDITION_DETAILS[conditionId]?.medications ?? [];
  return fallback.map((label, i) => ({
    label,
    classHint: 'Formulary',
    cdaCore: 187,
    cdaExec: 250,
    id: `fallback-${i}`,
  }));
};

export const buildMedicationResultSummary = (profile, conditionId, listedBrand, cda, planLabel) => {
  const name = personaName(profile);
  const label = conditionLabel(conditionId);

  return {
    headline: 'How medicine cover works on your profile',
    intro: `${name}, on ${planLabel} for ${label}:`,
    bullets: [
      `Listed brands on the approved medicine list (like ${normalizeLabel(listedBrand.label)}) are usually paid in full when you collect at Clicks or Dis-Chem.`,
      `Medicines not included on your plan tier may need a doctor's clinical motivation with supporting documentation before Discovery pays.`,
      `Unlisted brands are capped — Discovery pays up to R${cda} and you pay the pharmacy difference.`,
      'Open Medicines below to search brands, see ingredients, and check what is on your approved list.',
    ],
    speechText: `Listed medicines on the approved list are usually paid in full at a scheme pharmacy. Medicines excluded from your plan need a doctor motivation. Unlisted brands are capped at ${cda} rand — you pay the difference.`,
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

  return {
    questions,
    resultSummary: buildMedicationResultSummary(profile, conditionId, listedMed, cda, planLabel),
  };
};
