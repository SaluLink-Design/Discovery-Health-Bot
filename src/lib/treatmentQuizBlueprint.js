import {
  buildQ1CorrectionSpeech,
  buildQ1QuestionSpeech,
  buildQ2CorrectionSpeech,
  buildQ2QuestionSpeech,
  speakableDiagnosticName,
  speakableOngoingName,
} from './treatmentSpeech';
import { articleBefore } from './quizShared';

const TEST_LIKE =
  /test|scan|x-?ray|ecg|eeg|hba1c|flow|spirometry|culture|analysis|pressure|angiogram|colonoscopy|mri|holter|assay|titre|screen|pathology|imaging|volume|calprotectin|protein|monitor|dipstick|cd4|viral load|osmolality|sodium|lipid|nt-probnp|faecal/i;

const CONSULT_LIKE =
  /consultation|consult|counselling|counseling|specialist visit|gp visit|gp consultation|physician visit/i;

const REVIEW_ONLY = /annual.*review|routine.*review|specialist review$/i;

/** Prefer a real test/procedure for Q1 — not a consultation row. */
export const pickDiagnosticForQuiz = (items = []) => {
  if (!items.length) return { desc: 'Diagnostic test', code: '', count: 1 };

  const tests = items.filter(
    (item) => TEST_LIKE.test(item.desc ?? '') && !CONSULT_LIKE.test(item.desc ?? '')
  );
  if (tests.length) return tests[0];

  const semiTests = items.filter((item) => TEST_LIKE.test(item.desc ?? ''));
  if (semiTests.length) return semiTests[0];

  return items[0];
};

/** Prefer a monitoring test with a usable yearly limit for Q2. */
export const pickOngoingForQuiz = (items = []) => {
  if (!items.length) return { desc: 'Follow-up monitoring', code: '', count: 3 };

  const tests = items.filter(
    (item) =>
      TEST_LIKE.test(item.desc ?? '') &&
      !CONSULT_LIKE.test(item.desc ?? '') &&
      !REVIEW_ONLY.test(item.desc ?? '')
  );

  const pool = tests.length ? tests : items.filter((item) => !REVIEW_ONLY.test(item.desc ?? ''));
  const ranked = [...(pool.length ? pool : items)].sort(
    (a, b) => (b.count ?? 0) - (a.count ?? 0)
  );
  return ranked[0] ?? items[0];
};

const stripParens = (desc) => String(desc ?? '').replace(/\s*\([^)]*\)/g, '').trim();

const CONDITION_PURPOSE = {
  asthma: (obj) => `how ${obj} lungs are working`,
  copd: (obj) => `how ${obj} lungs are working`,
  bronchiectasis: (obj) => `how ${obj} lungs are affected`,
  diabetes_type2: (obj) => `${obj} blood sugar control`,
  diabetes_type1: (obj) => `${obj} blood sugar control`,
  diabetes_insipidus: (obj) => `${obj} fluid balance`,
  epilepsy: (obj) => `how ${obj} brain activity looks`,
  hypertension: (obj) => `${obj} blood pressure`,
  cardiac_failure: (obj) => `how ${obj} heart is pumping`,
  cardiomyopathy: (obj) => `how ${obj} heart muscle is working`,
  coronary_artery: (obj) => `${obj} heart blood flow`,
  dysrhythmias: (obj) => `${obj} heart rhythm`,
  glaucoma: (obj) => `${obj} eye pressure`,
  hiv: (obj) => `${obj} viral load`,
  hypothyroidism: (obj) => `${obj} thyroid levels`,
  crohns: (obj) => `${obj} inflammation levels`,
  ulcerative_colitis: (obj) => `${obj} inflammation levels`,
};

export const slotNoun = (desc) =>
  /consult|visit|review|session|physio/i.test(desc ?? '') ? 'visits' : 'tests';

export const coverageLine = (label, focal, conditionId) => {
  const testName = speakableDiagnosticName(focal.desc, conditionId);
  const count = focal.count ?? 1;
  return `As ${articleBefore(label)} ${label} patient you are covered for up to ${count} ${testName}${count === 1 ? '' : 's'} per year in this section.`;
};

const PMB_LINE =
  'This is funded under Prescribed Minimum Benefits once your condition is registered — Discovery pays up to the basket limit, not from your pocket.';

export const buildQ1Context = (name, label, conditionId, focal, prons) => {
  const { narrativeDoctor, obj } = prons;
  const purpose = CONDITION_PURPOSE[conditionId]?.(obj) ?? `${obj} condition`;
  const testName = speakableDiagnosticName(focal.desc, conditionId);
  const article = /^[aeiou]/i.test(testName) ? 'an' : 'a';

  return `${name} was just diagnosed with ${label}. ${narrativeDoctor} orders ${article} ${testName} to check ${purpose}.`;
};

export const buildQ1Copy = ({ name, label, conditionId, focal, doctor }) => {
  const coverage = coverageLine(label, focal, conditionId);
  return {
    questionSpeech: buildQ1QuestionSpeech({ name, label, conditionId, focal, doctor }),
    correction: `${coverage} ${PMB_LINE}`,
    correctionBrief: buildQ1CorrectionSpeech({ label, focal, conditionId }),
  };
};

export const buildQ2Context = (name, usageTotal, usageItem) => {
  const noun = slotNoun(usageItem.desc);
  const label = stripParens(usageItem.desc);
  return `${name} has used all ${usageTotal} covered ${label} ${noun} this year (see the basket below).`;
};

export const buildQ2Copy = ({ name, conditionId, usageTotal, usageItem, doctor, subj }) => {
  const needNoun = slotNoun(usageItem.desc) === 'visits' ? 'visit' : 'test';
  const itemLabel = stripParens(usageItem.desc);
  const ongoingLabel = speakableOngoingName(usageItem.desc, conditionId);

  return {
    questionSpeech: buildQ2QuestionSpeech({ name, usageTotal, usageItem, conditionId }),
    prompt: `${subj} needs another ${itemLabel} and it is medically necessary. What happens next?`,
    options: [
      { id: 'oop', label: `${subj} pays out of pocket` },
      { id: 'automatic', label: 'Discovery pays automatically — the limit does not apply' },
      {
        id: 'motivation',
        label: `${doctor} fills in a clinical assessment that motivates why another ${needNoun} is needed`,
      },
    ],
    correction: `When all ${usageTotal} ${itemLabel} slots are used, Discovery does not pay automatically. ${doctor} must submit a clinical motivation with supporting documentation. Discovery reviews it — approval is not guaranteed. Until then you may pay the full cost yourself.`,
    correctionBrief: buildQ2CorrectionSpeech({ usageTotal, usageItem, conditionId, doctor }),
    glossarySpeech: `Discovery allows up to ${usageTotal} ${ongoingLabel} per benefit year. Each use fills one slot until none are left.`,
  };
};
