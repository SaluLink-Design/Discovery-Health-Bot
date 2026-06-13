import { CDL_CONDITIONS } from '../data/authiData';

export const personaName = (profile) =>
  profile?.name?.trim() || 'Thabo';

export const possessiveName = (profile) => {
  const name = personaName(profile);
  return /s$/i.test(name) ? `${name}'` : `${name}'s`;
};

export const pronouns = (profile) => {
  const poss = possessiveName(profile);
  const subj = 'He';
  const obj = 'his';
  return {
    subj,
    obj,
    needs: 'he',
    /** Medicine quiz — "Thabo's doctor prescribes…" */
    doctor: `${poss} doctor`,
    /** Treatment narrative — "His doctor orders…" after naming the member */
    narrativeDoctor: subj === 'She' ? 'Her doctor' : 'His doctor',
  };
};

/** TTS-friendly plan name — "Priority" → "the Priority plan". */
export const speakablePlanLabel = (planLabel) => {
  const label = String(planLabel ?? '').trim();
  if (!label || label === 'your plan') return 'your plan';
  if (/\bplan\b/i.test(label)) return `the ${label}`;
  return `the ${label} plan`;
};

/** "on the Priority plan" / "on your plan" for sentence insertion. */
export const planOnPhrase = (planLabel) => {
  const spoken = speakablePlanLabel(planLabel);
  return spoken === 'your plan' ? 'on your plan' : `on ${spoken}`;
};

/** Sentence start — "On the Priority plan" / "On your plan". */
export const planOnSentenceStart = (planLabel) => {
  const spoken = speakablePlanLabel(planLabel);
  if (spoken === 'your plan') return 'On your plan';
  return `On ${spoken}`;
};

/** "an Asthma" vs "a Diabetes" */
export const articleBefore = (phrase) =>
  /^[aeiou]/i.test(String(phrase).trim()) ? 'an' : 'a';

/** Condition drives CDL treatment basket — not plan theme. */
export const pickPrimaryCondition = (profile) => {
  const ids = profile?.conditions ?? [];
  if (ids.includes('asthma') && !ids.includes('diabetes_type2')) return 'asthma';
  if (ids.includes('diabetes_type2')) return 'diabetes_type2';
  if (ids.includes('asthma')) return 'asthma';
  return ids[0] ?? 'diabetes_type2';
};

export const conditionLabel = (id) =>
  CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id;
