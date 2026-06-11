/**
 * Plain-English phrases for Authi TTS — derived from basket procedure names.
 * On-screen copy keeps PDF labels; speech uses these speakable forms.
 */

const stripParens = (desc) => String(desc ?? '').replace(/\s*\([^)]*\)/g, '').trim();

const DIAG_DESC_RULES = [
  [/flow volume|spirometry|lung function/i, 'lung function test'],
  [/hba1c/i, 'diabetes blood test'],
  [/eeg|electroencephalogram/i, 'brain wave test'],
  [/echocardiogram|echo/i, 'heart ultrasound'],
  [/holter/i, 'heart rhythm monitor test'],
  [/stress ecg|stress test/i, 'heart stress test'],
  [/coronary angiogram/i, 'heart artery scan'],
  [/angiogram/i, 'artery scan'],
  [/colonoscopy/i, 'colonoscopy'],
  [/endoscop/i, 'endoscopy'],
  [/ct chest|ct scan|ct /i, 'chest scan'],
  [/mri/i, 'M R I scan'],
  [/x-?ray|chest x/i, 'chest x-ray'],
  [/intraocular pressure/i, 'eye pressure test'],
  [/visual field/i, 'visual field test'],
  [/cd4|viral load/i, 'blood test'],
  [/clotting factor/i, 'clotting factor test'],
  [/water deprivation/i, 'fluid balance test'],
  [/urine analysis|dipstick/i, 'urine test'],
  [/lipid profile/i, 'cholesterol blood test'],
  [/nt-probnp/i, 'heart blood test'],
  [/faecal calprotectin|crp/i, 'inflammation blood test'],
  [/sputum culture/i, 'sputum test'],
  [/serum sodium|osmolality/i, 'blood salt test'],
  [/physiotherapy/i, 'physiotherapy sessions'],
  [/consultation|consult/i, 'specialist visit'],
  [/blood test|blood/i, 'blood test'],
  [/pressure/i, 'pressure test'],
  [/scan/i, 'scan'],
  [/test/i, 'test'],
];

const ONGOING_DESC_RULES = [
  [/peak flow/i, 'peak flow monitoring tests'],
  [/spirometry|lung function/i, 'lung function monitoring tests'],
  [/drug level monitoring/i, 'drug level monitoring tests'],
  [/visual field/i, 'visual field monitoring tests'],
  [/viral load/i, 'viral load monitoring tests'],
  [/cd4/i, 'C D 4 monitoring tests'],
  [/urine analysis|dipstick/i, 'urine monitoring tests'],
  [/nt-probnp|lipid profile|pathology/i, 'monitoring blood tests'],
  [/faecal calprotectin|crp/i, 'inflammation monitoring tests'],
  [/inhibitor titre/i, 'inhibitor monitoring tests'],
  [/ecg monitoring/i, 'heart monitoring tests'],
  [/echocardiogram/i, 'heart ultrasound checks'],
  [/physiotherapy/i, 'physiotherapy sessions'],
  [/gp consultation|gp visit/i, 'general practitioner visits'],
  [/consultation|consult|review|visit/i, 'follow-up visits'],
  [/monitor/i, 'monitoring tests'],
  [/test/i, 'monitoring tests'],
];

const CONDITION_DIAG_LABEL = {
  asthma: 'lung function test',
  copd: 'lung function test',
  bronchiectasis: 'chest scan',
  diabetes_type2: 'diabetes blood test',
  diabetes_type1: 'diabetes blood test',
  diabetes_insipidus: 'fluid balance test',
  epilepsy: 'brain wave test',
  hypertension: 'blood pressure check',
  glaucoma: 'eye pressure test',
  hiv: 'baseline blood test',
  hypothyroidism: 'thyroid blood test',
  hyperlipidaemia: 'cholesterol blood test',
  cardiac_failure: 'heart ultrasound',
  cardiomyopathy: 'heart ultrasound',
  dysrhythmias: 'heart rhythm monitor test',
  coronary_artery: 'heart stress test',
  crohns: 'colonoscopy',
  ulcerative_colitis: 'colonoscopy',
  haemophilia: 'clotting factor test',
};

const CONDITION_ONGOING_LABEL = {
  asthma: 'peak flow monitoring tests',
  copd: 'lung function monitoring tests',
  diabetes_type2: 'monitoring blood tests',
  diabetes_type1: 'monitoring blood tests',
  epilepsy: 'drug level monitoring tests',
  hypertension: 'blood pressure monitoring tests',
  hiv: 'viral load monitoring tests',
  glaucoma: 'visual field monitoring tests',
  cardiac_failure: 'heart blood tests',
  dysrhythmias: 'heart monitoring tests',
};

const matchRule = (desc, rules, fallback) => {
  const base = stripParens(desc);
  for (const [pattern, label] of rules) {
    if (pattern.test(base)) return label;
  }
  return fallback(base);
};

/** Noun phrase without article — e.g. "lung function test" */
export const speakableDiagnosticName = (desc, conditionId) => {
  if (CONDITION_DIAG_LABEL[conditionId]) return CONDITION_DIAG_LABEL[conditionId];
  return matchRule(desc, DIAG_DESC_RULES, () => 'assessment test');
};

/** Plural monitoring phrase — e.g. "peak flow monitoring tests" */
export const speakableOngoingName = (desc, conditionId) => {
  if (CONDITION_ONGOING_LABEL[conditionId]) return CONDITION_ONGOING_LABEL[conditionId];
  return matchRule(desc, ONGOING_DESC_RULES, (base) => {
    const simple = base.toLowerCase();
    if (/visit|consult|review/i.test(simple)) return 'follow-up visits';
    return 'yearly monitoring tests';
  });
};

const withArticle = (phrase) => {
  const p = phrase.trim();
  return /^[aeiou]/i.test(p) ? `an ${p}` : `a ${p}`;
};

export const buildQ1QuestionSpeech = ({ name, label, conditionId, focal, doctor }) => {
  const testName = speakableDiagnosticName(focal.desc, conditionId);
  return `${name} was just diagnosed with ${label}. ${doctor} orders ${withArticle(testName)}. Who pays for this test?`;
};

const singularOngoing = (phrase) =>
  phrase
    .replace(/\btests\b/i, 'test')
    .replace(/\bvisits\b/i, 'visit')
    .replace(/\bsessions\b/i, 'session')
    .replace(/\bchecks\b/i, 'check');

export const buildQ2QuestionSpeech = ({ name, usageTotal, usageItem, conditionId }) => {
  const ongoing = speakableOngoingName(usageItem.desc, conditionId);
  const isVisit = /visit|consult|review|session|physio/i.test(usageItem.desc ?? '');
  const unit = isVisit ? 'visit' : 'test';

  if (usageTotal === 1) {
    return `${name} has used ${singularOngoing(ongoing)} this year. Another ${unit} is needed. What happens next?`;
  }
  return `${name} has used all ${usageTotal} covered ${ongoing} this year. Another ${unit} is needed. What happens next?`;
};

export const buildQ1CorrectionSpeech = ({ label, focal, conditionId }) => {
  const testName = speakableDiagnosticName(focal.desc, conditionId);
  const count = focal.count ?? 1;
  const article = /^[aeiou]/i.test(label) ? 'an' : 'a';
  return `As ${article} ${label} patient you are covered for up to ${count} ${testName}${count === 1 ? '' : 's'} per year. Your scheme pays under Prescribed Minimum Benefits once your condition is registered.`;
};

export const buildQ2CorrectionSpeech = ({ usageTotal, usageItem, conditionId, doctor }) => {
  const ongoing = speakableOngoingName(usageItem.desc, conditionId);
  return `When all ${usageTotal} ${ongoing} are used, Discovery does not pay automatically. ${doctor} can submit a motivation. Discovery reviews it, and approval is not guaranteed.`;
};
