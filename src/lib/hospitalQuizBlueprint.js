import {
  buildOffPlanCorrectionSpeech,
  buildOffPlanQ1Speech,
  buildOnPlanCorrectionSpeech,
  buildOnPlanQ2Speech,
} from './hospitalSpeech';
import { personaName, pronouns } from './quizShared';

const FALLBACK_ON = { name: 'Life Fourways Hospital', town: 'Johannesburg' };
const FALLBACK_OFF = { name: 'Netcare Milpark Hospital', town: 'Johannesburg' };

export const pickHospitalExamples = (apiData, profileTown) => {
  const onPlan = apiData?.onPlan?.items?.[0];
  const offPlan = apiData?.offPlan?.items?.[0];

  return {
    onPlanHospital: {
      name: onPlan?.label ?? onPlan?.name ?? FALLBACK_ON.name,
      town: onPlan?.town ?? profileTown ?? FALLBACK_ON.town,
      address: onPlan?.address,
    },
    offPlanHospital: {
      name: offPlan?.label ?? offPlan?.name ?? FALLBACK_OFF.name,
      town: offPlan?.town ?? profileTown ?? FALLBACK_OFF.town,
      address: offPlan?.address,
    },
  };
};

export const buildOffPlanQ1 = ({
  name,
  hospital,
  town,
  planLabel,
  networks,
  subj,
  obj,
  procedure = 'planned hip replacement',
}) => ({
  id: 'h1',
  context: `${name} books a ${procedure} at ${hospital.name}${town ? ` in ${town}` : ''} — outside ${obj} plan networks.`,
  glossary: null,
  prompt: 'Why might they pay more out of pocket?',
  questionSpeech: buildOffPlanQ1Speech({
    name,
    hospitalName: hospital.name,
    procedure,
    possessive: obj,
  }),
  visual: 'hospital-card',
  visualMeta: {
    bare: true,
    hospitalName: hospital.name,
    town: hospital.town ?? town,
    onPlan: false,
    sourceNote: `${planLabel} · outside my plan`,
  },
  visualAfter: 'hospital-card',
  visualAfterMeta: {
    bare: false,
    hospitalName: hospital.name,
    town: hospital.town ?? town,
    onPlan: false,
    networkLabel: networks,
    showCoPayWarning: true,
    sourceNote: 'Higher out-of-pocket cost likely',
  },
  options: [
    { id: 'oop', label: 'Higher out-of-pocket costs — hospital is outside the plan network' },
    { id: 'automatic', label: 'Discovery pays automatically — same as in-network' },
    { id: 'none', label: 'No cover at all — they cannot be admitted' },
  ],
  correct: 'oop',
  correction: `To avoid out-of-pocket costs, planned procedures should be done at hospitals within your plan's network. ${hospital.name} is outside ${networks} on ${planLabel} — ${name} could pay much more out of pocket than at an in-network hospital.`,
  correctionBrief: buildOffPlanCorrectionSpeech({ networks, planLabel }),
});

export const buildOnPlanQ2 = ({ name, hospital, town, planLabel, networks, subj, obj }) => ({
  id: 'h2',
  context: `${name} books the same procedure at ${hospital.name}${town ? ` in ${town}` : ''} — on ${obj} plan networks.`,
  glossary: null,
  prompt: 'Who pays at network rates?',
  questionSpeech: buildOnPlanQ2Speech({ name, hospitalName: hospital.name, possessive: obj }),
  visual: 'hospital-card',
  visualMeta: {
    bare: true,
    hospitalName: hospital.name,
    town: hospital.town ?? town,
    onPlan: true,
    sourceNote: `${planLabel} · planned admission`,
  },
  visualAfter: 'hospital-card',
  visualAfterMeta: {
    bare: false,
    hospitalName: hospital.name,
    town: hospital.town ?? town,
    onPlan: true,
    networkLabel: networks,
    sourceNote: `${planLabel} · on my plan`,
  },
  options: [
    { id: 'scheme', label: 'Your medical scheme (at network rates)' },
    { id: 'oop', label: `${subj} pays the full bill out of pocket` },
    { id: 'split', label: 'Medical scheme pays half, you pay half' },
  ],
  correct: 'scheme',
  correction: `${hospital.name} is on ${networks}. For planned care, your medical scheme pays at network rates — the lowest out-of-pocket cost on ${planLabel}.`,
  correctionBrief: buildOnPlanCorrectionSpeech({ networks }),
});

export const buildHospitalQuizQuestions = (profile, hospitals, networks, planLabel) => {
  const name = personaName(profile);
  const { subj, obj } = pronouns(profile);
  const town = profile?.town ?? hospitals.offPlanHospital.town;

  return [
    buildOffPlanQ1({
      name,
      hospital: hospitals.offPlanHospital,
      town,
      planLabel,
      networks,
      subj,
      obj,
    }),
    buildOnPlanQ2({
      name,
      hospital: hospitals.onPlanHospital,
      town,
      planLabel,
      networks,
      subj,
      obj,
    }),
  ];
};
