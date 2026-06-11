import { getPlanFromProfile } from './profileContext';

/** Plain network names for literacy copy (no codes). */
export const getPlanNetworkNamesPlain = (profile) => {
  const plan = getPlanFromProfile(profile);
  return plan?.hospitalNetworkNames ?? [];
};

export const hospitalNoOnPlanLiteracy = ({ profile, province, town }) => {
  const plan = getPlanFromProfile(profile);
  const networks = getPlanNetworkNamesPlain(profile).join(' and ') || 'your plan networks';
  const place = [town, province?.replace(/-/g, ' ')].filter(Boolean).join(', ') || 'this area';
  return {
    title: `No ${plan?.label ?? 'plan'} hospitals in this area`,
    body: `Your ${plan?.label ?? 'plan'} covers planned hospital admissions on the ${networks}. None are listed in ${place} — but other hospitals may still exist nearby.`,
    nextSteps: [
      'You can still go to another hospital, but planned procedures outside your plan network may cost you more.',
      'You may pay much more out of pocket if the hospital is outside your plan network.',
      'Switch to "Outside my plan" to see the 3 nearest non-network hospitals.',
      'For emergencies, different rules may apply — check with Discovery Health.',
    ],
  };
};

export const hospitalOutsidePlanLiteracy = ({ profile }) => {
  const plan = getPlanFromProfile(profile);
  const networks = getPlanNetworkNamesPlain(profile).join(' and ') || 'your plan networks';
  return {
    title: 'These hospitals may cost you more',
    body: `You are viewing hospitals outside the ${networks} on your ${plan?.label ?? 'plan'}. To avoid out-of-pocket costs, planned procedures should be done at hospitals within your plan's network. Outside those networks, you may pay much more out of pocket than at an in-network hospital.`,
    nextSteps: [
      'Ask Discovery Health before a planned admission what your out-of-pocket cost could be.',
      'Focus on hospitals marked "On your plan" for the lowest out-of-pocket cost on planned care.',
      'Emergency care may follow different rules — confirm with Discovery Health.',
    ],
  };
};

export const treatmentBenefitExhaustedLiteracy = ({ itemDesc }) => ({
  title: 'Need this care again this year?',
  body: `You have used your covered allowance for "${itemDesc ?? 'this item'}" this benefit year. Discovery Health may not pay for another one unless your doctor motivates that it is medically necessary.`,
  nextSteps: [
    'Your doctor writes a motivation letter explaining why the test or visit is needed again.',
    'Discovery Health reviews the motivation — approval is not guaranteed.',
    'Without approval, you may need to pay the full cost yourself.',
  ],
});

export const medicationCdaCopayLiteracy = ({ cdaAmount, planLabel }) => {
  if (cdaAmount == null) return null;
  const examplePrice = cdaAmount + 80;
  const outOfPocket = examplePrice - cdaAmount;
  return {
    title: 'Listed brand vs unlisted — what you pay',
    body: `On ${planLabel}, Discovery pays up to R${cdaAmount} for an unlisted brand of the same ingredient (this is the CDA — Chronic Drug Amount). Listed brands on the formulary are usually paid in full when dispensed as named at a DSP pharmacy (e.g. Clicks or Dis-Chem).`,
    nextSteps: [
      `Example: pharmacy charges R${examplePrice} for an unlisted brand → Discovery pays R${cdaAmount} → you pay R${outOfPocket} out of pocket.`,
      'The difference between the pharmacy price and the CDA is always your cost for unlisted alternatives.',
      'Ask your pharmacist if a listed brand is available before you pay.',
    ],
  };
};

/** Shared copy for treatment basket literacy quiz, result screen, and Care covered view. */
export const TREATMENT_BASKET_COPY = {
  introSpeech:
    'On Discovery, chronic conditions like yours are covered through something called a treatment basket. It has two funded parts: assessment tests when you are first diagnosed, and ongoing tests each year to monitor you. Both are paid by Discovery once your condition is registered.',
  moduleIntroQuizPitch:
    'I have two quick questions for you. When you are ready, tap Test what I know — or skip straight to your treatment basket.',
  startQuizLabel: 'Test what I know',
  skipToBasketLabel: 'Skip — see what I\'m covered for',
  moduleIntro:
    'On Discovery, chronic conditions like yours are covered through something called a treatment basket. It has two funded parts: assessment tests when you are first diagnosed, and ongoing tests each year to monitor you. Two quick questions — then you can see your full basket.',
  diagnosticSectionTitle: 'Assessment at diagnosis — for your doctor to confirm and plan care',
  ongoingSectionTitle: 'Monitoring each year — repeat tests to track your condition',
  diagnosticSectionShort: 'Assessment at diagnosis',
  ongoingSectionShort: 'Monitoring each year',
  diagnosticResultHeading: 'Assessment at diagnosis',
  ongoingResultHeading: 'Monitoring each year',
  diagnosticResultIntro:
    'Tests your doctor uses to confirm your condition and plan treatment when you are first diagnosed.',
  ongoingResultIntro:
    'Repeat tests each year to track how your condition is doing. Different tests and limits from diagnosis — not duplicate cover.',
  bothFundedNote:
    'Discovery funds both sections under Prescribed Minimum Benefits. Different tests, different annual limits — not double-billing, and not optional extras.',
  q1Bridge:
    'This is not your yearly monitoring test — that sits in a different bucket with its own limit, but Discovery still funds it under the same rules.',
  diagnosticViewTitle: 'Assessment at diagnosis',
  diagnosticViewSubtitle: 'Tests your doctor uses to confirm your condition and plan treatment.',
  ongoingViewTitle: 'Monitoring each year',
  ongoingViewSubtitle: 'Repeat tests to track how your condition is doing.',
};

export const medicationSideEffectMotivationLiteracy = ({ medicineName }) => ({
  title: 'Switching medicine because of side effects?',
  body: `You are currently on ${medicineName ?? 'this medicine'}. If it causes side effects and your doctor wants a different brand or ingredient not on the formulary, Discovery Health may require a motivation before they pay.`,
  nextSteps: [
    'Your doctor submits a motivation explaining why the alternative is needed.',
    'Until approved, you may pay the full price or the out-of-pocket amount above the CDA.',
    'Do not stop chronic medicine without speaking to your doctor first.',
  ],
});
