import { normalizeLabel } from './medicineClassifier';

const stripStrength = (label) =>
  normalizeLabel(label)
    .replace(/\s+\d+[\d./]*\s*(mcg|mg|g|ml|iu|units|dose)?\b/gi, '')
    .trim();

/** Speakable brand name for TTS. */
export const speakableBrand = (label) => {
  const name = normalizeLabel(label);
  if (/ellipta/i.test(name)) return name.replace(/Ellipta/i, 'ellipta inhaler');
  if (/evohaler/i.test(name)) return name.replace(/Evohaler/i, 'evohaler');
  if (/inhaler/i.test(name)) return name;
  return stripStrength(name) || name;
};

export const buildExcludedQ1Speech = ({ name, brandLabel, doctor }) =>
  `${doctor} prescribes ${speakableBrand(brandLabel)} for ${name}. The medical scheme reviews the claim. What happens next?`;

export const buildListedQ1Speech = ({ name, brandLabel }) =>
  `${name} collects ${speakableBrand(brandLabel)} at Clicks as named on the script. Who pays for this medication?`;

export const buildUnlistedQ2Speech = ({ name, brandLabel, pharmacyPrice, cda }) =>
  `${name} goes to Clicks but only finds ${speakableBrand(brandLabel)} — it is not on the approved list. The pharmacy charges ${pharmacyPrice} rand. Discovery pays up to ${cda} rand. How much does ${name} pay out of pocket?`;

export const buildExcludedCorrectionSpeech = ({ doctor, planLabel }) =>
  `This medicine is not included on ${planLabel}. The scheme rejects the claim until ${doctor.toLowerCase()} submits a clinical motivation with supporting documentation. Discovery reviews it — approval is not guaranteed.`;

export const buildListedCorrectionSpeech = ({ brandLabel }) =>
  `${speakableBrand(brandLabel)} is on the approved list for your condition. At Clicks or Dis-Chem, your medical scheme usually pays the full pharmacy price.`;

export const buildUnlistedCorrectionSpeech = ({ memberPays, cda }) =>
  `Discovery pays up to ${cda} rand for this ingredient. You pay the difference — ${memberPays} rand out of pocket.`;
