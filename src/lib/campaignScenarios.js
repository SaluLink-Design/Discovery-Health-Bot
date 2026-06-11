import { treatmentKey } from './prescriptionStore';

/**
 * Dramatic demo states for "Run scenario" — shows literacy cards in context.
 */

const pickCondition = (profile, preferred = 'asthma') => {
  const ids = profile?.conditions ?? [];
  if (ids.includes(preferred)) return preferred;
  return ids[0] ?? preferred;
};

/** Exhausted ongoing visit allowance — triggers motivation literacy on TreatmentView. */
export const buildTreatmentScenario = (profile, existing = {}) => {
  const conditionId = pickCondition(profile, 'asthma');
  const updated = { ...existing };

  updated[conditionId] = {
    treatments: [
      treatmentKey('diagnostic', '1188 or 1186'),
      treatmentKey('ongoing', '1192'),
    ],
    usedCounts: { '1192': 3 },
    medications: existing[conditionId]?.medications ?? [
      'Lumont                                              4mg; 5mg; 10mg',
    ],
  };

  return { prescriptions: updated, focusConditionId: conditionId };
};

/** Active prescription on a real formulary medicine — surfaces CDA / side-effect literacy. */
export const buildMedicationScenario = (profile, existing = {}) => {
  const conditionId = pickCondition(profile, 'hypertension');
  const updated = { ...existing };

  updated[conditionId] = {
    treatments: existing[conditionId]?.treatments ?? [
      treatmentKey('diagnostic', '1232 or 1233'),
    ],
    usedCounts: existing[conditionId]?.usedCounts ?? {},
    medications: ['Amlessa                  4/5mg; 4/10mg; 8/5mg; 8/10mg'],
  };

  return { prescriptions: updated, focusConditionId: conditionId };
};

/** Hospital scenario — switch to outside-plan view after search. */
export const HOSPITAL_SCENARIO = {
  highlightOffPlan: true,
  explanation:
    'This scenario shows hospitals outside your plan network — where you may pay much more out of pocket for planned procedures.',
};

export const getScenarioExplanation = (moduleId) => {
  const copy = {
    treatment:
      'Thabo has used all 3 covered asthma follow-up visits. Scroll to ongoing care to see what happens when an allowance runs out.',
    medication:
      'You are on an active prescription. Open an ingredient group to see listed vs unlisted cover and what the CDA means for your wallet.',
    hospitals:
      'We switched to "Outside my plan" so you can see the literacy guidance for non-network hospitals.',
  };
  return copy[moduleId] ?? '';
};
