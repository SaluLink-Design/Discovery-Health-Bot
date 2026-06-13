/** Story-first intros for literacy quick-check modules. */

export const buildMedicineIntroSpeech = () =>
  'When your doctor prescribes medicine for a chronic condition, Discovery does not pay the same way for every brand. Listed brands on your plan are usually paid in full at a scheme pharmacy. Some medicines are not included on your plan at all unless your doctor motivates with supporting documentation. For unlisted brands, Discovery pays up to a Chronic Drug Amount — and that cap is set per active ingredient, not one flat amount for every medicine.';

export const MEDICINE_COVER_COPY = {
  getIntroSpeech: buildMedicineIntroSpeech,
  moduleIntroQuizPitch:
    'I have two quick questions for you. When you are ready, tap Test what I know — or skip to view your medicine cover and see which brands are listed on your plan.',
  startQuizLabel: 'Test what I know',
  skipLabel: 'Skip — explore my medicines',
  eyebrowSuffix: 'medicine cover',
};

export const HOSPITAL_COVER_COPY = {
  introSpeech:
    'For planned hospital care — like booking a hip replacement or a colonoscopy — which hospital you choose matters. To avoid out-of-pocket costs, planned procedures should be done at hospitals within your plan\'s network. Go outside those networks and you could pay much more out of pocket.',
  moduleIntroQuizPitch:
    'I have two quick questions for you. When you are ready, tap Test what I know — or skip to view hospital networks on your plan and see which hospitals cost you less out of pocket.',
  startQuizLabel: 'Test what I know',
  skipLabel: 'Skip — find hospitals on my plan',
  eyebrowSuffix: 'hospital networks',
};
