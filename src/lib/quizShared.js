import { CDL_CONDITIONS } from '../data/authiData';

export const personaName = (profile) =>
  profile?.name?.trim() || 'Thabo';

export const pronouns = () => ({
  subj: 'He',
  obj: 'his',
  needs: 'he',
  doctor: 'His doctor',
});

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
