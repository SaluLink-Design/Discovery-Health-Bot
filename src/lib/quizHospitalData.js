import { getPlanHospitalNetworks, getPlanFromProfile } from './profileContext';
import { getPlanNetworkNamesPlain } from './literacyContent';
import {
  buildHospitalQuizQuestions,
  pickHospitalExamples,
} from './hospitalQuizBlueprint';
import { personaName } from './quizShared';

const resolveProvince = (profile) => {
  const raw = profile?.province ?? '';
  if (!raw) return 'GP';
  if (raw.length <= 3 && raw === raw.toUpperCase()) return raw;
  const map = {
    gauteng: 'GP',
    'western-cape': 'WC',
    'kwazulu-natal': 'KZN',
  };
  return map[raw.toLowerCase()] ?? raw.toUpperCase();
};

export const fetchHospitalQuizExamples = async (profile) => {
  const province = resolveProvince(profile);
  const town = profile?.town?.trim() ?? '';
  const planNetworks = getPlanHospitalNetworks(profile);

  const params = new URLSearchParams({ province, limit_on: '1', limit_off: '1' });
  if (town) params.append('town', town);
  if (planNetworks?.length) params.append('networks', planNetworks.join(','));

  try {
    const res = await fetch(`/api/hospitals/nearby?${params}`);
    if (res.ok) {
      const data = await res.json();
      return pickHospitalExamples(data, town);
    }
  } catch {
    // offline
  }

  return pickHospitalExamples(null, town);
};

export const buildHospitalResultSummary = (profile) => {
  const name = personaName(profile);
  const plan = getPlanFromProfile(profile);
  const planLabel = plan?.label ?? 'your plan';
  const networks = getPlanNetworkNamesPlain(profile).join(' and ') || 'your plan hospital networks';
  const town = profile?.town || 'your area';

  return {
    headline: 'How hospital networks work on your profile',
    intro: `${name}, on ${planLabel}:`,
    bullets: [
      `Planned admissions at hospitals on ${networks} are your lowest-risk choice for cover.`,
      `Hospitals outside those networks may still admit you, but planned procedures there usually mean paying much more out of pocket.`,
      `Use Find hospitals on my plan below to search near ${town} — toggle "On my plan" and "Outside my plan" to compare.`,
    ],
    speechText: `On ${planLabel}, planned care at hospitals on ${networks} is your safest choice — lowest out-of-pocket cost. Outside your plan network, you could pay much more out of pocket.`,
  };
};

export const loadHospitalModuleQuestions = async (profile) => {
  const plan = getPlanFromProfile(profile);
  const planLabel = plan?.label ?? 'your plan';
  const networks = getPlanNetworkNamesPlain(profile).join(' and ') || 'your plan networks';
  const hospitals = await fetchHospitalQuizExamples(profile);

  return {
    questions: buildHospitalQuizQuestions(profile, hospitals, networks, planLabel),
    resultSummary: buildHospitalResultSummary(profile),
  };
};
