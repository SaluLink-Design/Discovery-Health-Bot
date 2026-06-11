import { formatRand } from './speechText';
import { getPlanFromProfile } from './profileContext';
import { getCdaAmount } from './medicinePaymentRules';
import { TREATMENT_BASKET_COPY } from './literacyContent';
import { HOSPITAL_COVER_COPY, MEDICINE_COVER_COPY } from './literacyModuleCopy';

/** Literacy quiz — hard reasoning, plain language, embedded scenario visuals. */

export const CAMPAIGN_MODULE_IDS = ['treatment', 'medication', 'hospitals'];

export const CAMPAIGN_MODULES = {
  treatment: {
    id: 'treatment',
    eyebrow: 'Care covered',
    title: 'Treatment basket basics',
    intro: TREATMENT_BASKET_COPY.moduleIntro,
    introSpeech: TREATMENT_BASKET_COPY.introSpeech,
    introQuizPitch: TREATMENT_BASKET_COPY.moduleIntroQuizPitch,
    theme: 'treatment basket',
    exploreLabel: 'Explore my care cover',
    watchScenarioLabel: 'Watch Thabo\'s full story',
  },
  medication: {
    id: 'medication',
    eyebrow: 'Medicines',
    title: 'Medicine cover basics',
    intro: MEDICINE_COVER_COPY.moduleIntroQuizPitch,
    introSpeech: null,
    introQuizPitch: MEDICINE_COVER_COPY.moduleIntroQuizPitch,
    theme: 'medicine cover',
    exploreLabel: 'Explore medicine cover',
    watchScenarioLabel: 'Watch the pharmacy story',
  },
  hospitals: {
    id: 'hospitals',
    eyebrow: 'Hospitals',
    title: 'Hospital network basics',
    intro: HOSPITAL_COVER_COPY.moduleIntroQuizPitch,
    introSpeech: HOSPITAL_COVER_COPY.introSpeech,
    introQuizPitch: HOSPITAL_COVER_COPY.moduleIntroQuizPitch,
    theme: 'hospital networks',
    exploreLabel: 'Find hospitals on my plan',
    watchScenarioLabel: 'Watch the hospital story',
  },
};

const personaName = (profile) => profile?.name?.trim() || 'Thabo';

export const getModuleQuestions = (moduleId, profile) => {
  const name = personaName(profile);
  const plan = getPlanFromProfile(profile);
  const planLabel = plan?.label ?? 'your plan';
  const cda = getCdaAmount(plan?.id, { cdaCore: 187, cdaExec: 250 }) ?? 187;
  const pharmacyPrice = 265;
  const memberPays = pharmacyPrice - cda;

  const banks = {
    treatment: [
      {
        id: 't1',
        context: `${name} has diabetes. Twice this year he needs a diabetes blood test (HbA1c).`,
        glossary: 'Tests and screening sit in the "tests covered" bucket — separate from follow-up GP visits.',
        prompt: 'Where does this blood test belong?',
        visual: 'two-baskets',
        options: [
          { id: 'diagnostic', label: 'Tests & screening bucket' },
          { id: 'ongoing', label: 'Follow-up visits bucket' },
          { id: 'both', label: 'Both buckets at once' },
        ],
        correct: 'diagnostic',
        correction:
          'Blood tests and screening monitor the condition — they use the tests bucket, not your follow-up visit allowance.',
        speechPrompt: `${name} has diabetes and needs a diabetes blood test twice this year. Tests and screening are separate from follow-up visits. Where does this blood test belong?`,
      },
      {
        id: 't2',
        context: `${name} has asthma. Discovery covers 3 follow-up visits per year.`,
        glossary: 'Each visit uses one slot on the counter below.',
        prompt: 'All 3 visits are used. A 4th is medically necessary. What happens next?',
        visual: 'progress-full',
        visualMeta: { used: 3, total: 3, label: `${name}'s asthma follow-ups this year` },
        options: [
          { id: 'motivation', label: 'Doctor sends a motivation letter — Discovery reviews it' },
          { id: 'automatic', label: 'Cover continues automatically — no limit really applies' },
          { id: 'msa', label: 'Only paid from the day-to-day savings account' },
        ],
        correct: 'motivation',
        correction:
          'When the yearly count is full, Discovery may ask your doctor to explain why another visit is needed. Approval is not guaranteed.',
        visualAfter: 'motivation',
        speechPrompt: `${name} used all 3 asthma follow-up visits covered per year. A fourth is needed. What happens next?`,
      },
      {
        id: 't3',
        context: `A GP follow-up visit allows "up to 4 per year". ${name} has had all 4.`,
        glossary: '"Up to 4" is the normal allowance — not unlimited.',
        prompt: 'Could a 5th visit ever be paid by Discovery?',
        visual: 'progress-partial',
        visualMeta: { used: 4, total: 4, label: 'GP follow-up visits used' },
        options: [
          { id: 'never', label: 'Never — the limit is absolute' },
          { id: 'maybe', label: 'Maybe — if a doctor motivates medical necessity' },
          { id: 'always', label: 'Always — "up to" is just a rough guide' },
        ],
        correct: 'maybe',
        correction:
          'A 5th visit is not automatic, but your doctor can motivate why it is needed. Discovery decides case by case.',
        speechPrompt: `${name} used all 4 GP follow-up visits allowed per year. Could a fifth visit ever be paid?`,
      },
      {
        id: 't4',
        context: `${name} needs annual eye screening for diabetes complications.`,
        glossary: 'Screening tests usually count as tests & screening — not a GP follow-up visit.',
        prompt: 'Which bucket does eye screening belong in?',
        visual: 'two-baskets',
        options: [
          { id: 'diagnostic', label: 'Tests & screening' },
          { id: 'ongoing', label: 'Follow-up visits' },
          { id: 'neither', label: 'Not covered on the chronic list' },
        ],
        correct: 'diagnostic',
        correction:
          'Eye screening monitors disease — it is a test, not a routine GP check-in.',
        speechPrompt: `${name} needs annual eye screening for diabetes. Which bucket does this belong in, tests and screening or follow-up visits?`,
      },
    ],
    medication: [
      {
        id: 'm1',
        context: `The pharmacy charges R${pharmacyPrice} for a brand that is NOT on the approved list.`,
        glossary: `Chronic Drug Amount (CDA) on ${planLabel}: R${cda} — the most Discovery pays for that unlisted brand.`,
        prompt: `How much does ${name} pay out of pocket?`,
        visual: 'cda-maths',
        visualMeta: { pharmacyPrice, cda, memberPays, discoveryPays: cda },
        options: [
          { id: 'member', label: `R${memberPays} (pharmacy price minus R${cda})` },
          { id: 'cda', label: `R${cda} — always exactly the CDA` },
          { id: 'zero', label: 'R0 — chronic medicine is always free' },
        ],
        correct: 'member',
        correction:
          `Discovery pays up to R${cda}. You always pay the difference between the pharmacy price and that amount.`,
        speechPrompt: `The pharmacy charges ${formatRand(pharmacyPrice)} for an unlisted brand. The Chronic Drug Amount on ${planLabel} is ${formatRand(cda)}. How much does ${name} pay out of pocket?`,
      },
      {
        id: 'm2',
        context: 'A listed brand from the approved medicine list is collected at Clicks as named on the script.',
        glossary: 'DSP = designated service provider pharmacy (e.g. Clicks, Dis-Chem).',
        prompt: `On ${planLabel}, who typically pays the full pharmacy price?`,
        visual: 'listed',
        visualMeta: { example: 'Listed brand · Clicks pharmacy' },
        options: [
          { id: 'full', label: 'Discovery pays the full price' },
          { id: 'cda', label: `Discovery pays only R${cda} (CDA cap)` },
          { id: 'half', label: 'Discovery pays half — you pay half' },
        ],
        correct: 'full',
        correction:
          'Listed brands at a DSP pharmacy are usually paid in full. The CDA cap applies to unlisted alternatives only.',
        speechPrompt: `A listed brand from the approved medicine list is collected at Clicks as named. On ${planLabel}, who pays the full pharmacy price?`,
      },
      {
        id: 'm3',
        context: `${name}'s doctor wants a different active ingredient because of side effects — it is not on the approved list.`,
        glossary: 'Switching ingredients is not the same as swapping to another brand of the same ingredient.',
        prompt: 'What is most likely before Discovery pays?',
        visual: 'motivation',
        options: [
          { id: 'motivation', label: 'Doctor motivation — you may pay full price until approved' },
          { id: 'cda_auto', label: 'CDA applies automatically like any unlisted brand' },
          { id: 'listed', label: 'Treated as listed — full cover immediately' },
        ],
        correct: 'motivation',
        correction:
          'A new ingredient often needs approval. Until then you may pay the full pharmacy price yourself.',
        speechPrompt: `${name}'s doctor wants a different active ingredient not on the approved list because of side effects. What is most likely before Discovery pays?`,
      },
      {
        id: 'm4',
        context: 'Two brands have the same active ingredient — one is on the approved list, one is not.',
        glossary: 'Same ingredient does not mean same payment rules.',
        prompt: 'True or false: Discovery must pay the same way for both brands.',
        visual: 'cda-intro',
        visualMeta: { cda },
        options: [
          { id: 'false', label: 'False — listed vs unlisted is paid differently' },
          { id: 'true', label: 'True — only the ingredient matters' },
        ],
        correct: 'false',
        correction:
          'The listed brand is often paid in full at a DSP. The unlisted brand is capped at the Chronic Drug Amount.',
        speechPrompt: 'Two brands share the same ingredient but one is on the approved list and one is not. True or false, Discovery must pay the same way for both.',
      },
    ],
    hospitals: [
      {
        id: 'h1',
        context: `${name} books a planned hip replacement at a hospital outside his ${planLabel} networks.`,
        glossary: 'Planned = scheduled in advance, not an emergency casualty visit.',
        prompt: 'Why might they pay more out of pocket?',
        visual: 'off-plan',
        options: [
          { id: 'oop', label: 'Higher out-of-pocket costs — hospital is outside the plan network' },
          { id: 'full', label: 'Full cover — all private hospitals are the same' },
          { id: 'emergency', label: 'Same as emergency — Discovery pays everything' },
        ],
        correct: 'oop',
        correction:
          'To avoid out-of-pocket costs, planned procedures should be done at hospitals within your plan network. Outside those networks, you could pay much more out of pocket.',
        speechPrompt: `${name} books a planned hip replacement outside his plan hospital networks. Why might he pay more out of pocket?`,
      },
      {
        id: 'h2',
        context: `No "on my plan" hospitals show in ${name}'s town, but he needs a planned admission nearby.`,
        glossary: 'Other hospitals may still exist — they are just outside your plan networks.',
        prompt: 'What should he realistically expect?',
        visual: 'on-plan',
        options: [
          { id: 'out_of_pocket', label: 'Nearest hospital may work but may cost more on the plan' },
          { id: 'free', label: 'Discovery must cover the nearest at network rates' },
          { id: 'no_cover', label: 'No cover — he cannot be admitted' },
        ],
        correct: 'out_of_pocket',
        correction:
          'You can still go elsewhere, but planned procedures outside your plan network usually mean paying much more out of pocket.',
        speechPrompt: `No on my plan hospitals appear in ${name}'s town but he needs a planned admission. What should he expect?`,
      },
      {
        id: 'h3',
        context: 'Compare: casualty after a car accident vs booking a colonoscopy for next month.',
        glossary: 'Emergency and planned care follow different rules on most plans.',
        prompt: 'Which situation has stricter network rules?',
        visual: 'planned-emergency',
        options: [
          { id: 'planned', label: 'Planned colonoscopy — hospital choice matters more' },
          { id: 'emergency', label: 'Emergency casualty — always stricter' },
          { id: 'same', label: 'Identical rules for both' },
        ],
        correct: 'planned',
        correction:
          'Planned procedures are where picking an in-network hospital saves you the most money.',
        speechPrompt: 'Compare an emergency casualty visit after a car accident with a colonoscopy booked for next month. Which has stricter network rules?',
      },
      {
        id: 'h4',
        context: 'A hospital is marked "On my plan" in this app.',
        glossary: 'On my plan = matches your plan hospital networks list.',
        prompt: 'For a planned admission, this most likely means:',
        visual: 'on-plan',
        options: [
          { id: 'network', label: 'On your networks — usually lowest out-of-pocket for planned care' },
          { id: 'any', label: 'Any procedure at any price is fully covered' },
          { id: 'gp', label: 'Only GP visits — not hospital stays' },
        ],
        correct: 'network',
        correction:
          '"On my plan" means the hospital is on your network list. It does not mean unlimited cover for every procedure.',
        speechPrompt: 'A hospital shows on my plan in the app. For a planned admission, what does this most likely mean?',
      },
    ],
  };

  return banks[moduleId] ?? [];
};
