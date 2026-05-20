import { CDL_CONDITIONS, DISCOVERY_PLANS } from '../data/authiData';

export const PROVINCES = [
  { value: 'GAUTENG', label: 'Gauteng' },
  { value: 'KWAZULU-NATAL', label: 'KwaZulu-Natal' },
  { value: 'WESTERN CAPE', label: 'Western Cape' },
  { value: 'EASTERN CAPE', label: 'Eastern Cape' },
  { value: 'MPUMALANGA', label: 'Mpumalanga' },
  { value: 'LIMPOPO', label: 'Limpopo' },
  { value: 'NORTH WEST', label: 'North West' },
  { value: 'FREE STATE', label: 'Free State' },
  { value: 'NORTHERN CAPE', label: 'Northern Cape' },
];

const UNRESTRICTED_PLAN_IDS = new Set(['comprehensive', 'executive']);

const NETWORK_CODE_LABELS = {
  KH: 'KeyCare Hospital (KH)',
  KC: 'KeyCare Casualty (KC)',
  KS: 'KeyCare Start (KS)',
  KR: 'KeyCare Start Regional (KR)',
  D: 'Delta (D)',
  S: 'Smart (S)',
  DS: 'Dynamic Smart (DS)',
  C: 'Coastal (C)',
};

export const getPlanFromProfile = (profile) => {
  if (!profile?.plan) return null;
  return DISCOVERY_PLANS.find((p) => p.id === profile.plan) ?? null;
};

/**
 * Hospital network codes to auto-apply on search.
 * Returns null when the plan has unrestricted hospital access (no filter).
 */
export const getPlanHospitalNetworks = (profile) => {
  const plan = getPlanFromProfile(profile);
  if (!plan) return null;
  if (UNRESTRICTED_PLAN_IDS.has(plan.id)) return null;
  const codes = plan.hospitalNetworkCodes ?? [];
  return codes.length > 0 ? codes : null;
};

export const isUnrestrictedHospitalPlan = (profile) => {
  const plan = getPlanFromProfile(profile);
  return plan ? UNRESTRICTED_PLAN_IDS.has(plan.id) : false;
};

export const formatPlanNetworkSummary = (profile) => {
  const plan = getPlanFromProfile(profile);
  if (!plan) return null;
  if (UNRESTRICTED_PLAN_IDS.has(plan.id)) {
    return `${plan.label} plan · all hospital networks`;
  }
  const codes = plan.hospitalNetworkCodes ?? [];
  if (codes.length === 0) return `${plan.label} plan`;
  const names = codes.map((c) => NETWORK_CODE_LABELS[c] ?? c);
  if (names.length === 1) return `${plan.label} plan · ${names[0]}`;
  if (names.length === 2) return `${plan.label} plan · ${names[0]} and ${names[1]}`;
  return `${plan.label} plan · ${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
};

export const getProfileConditions = (profile) => {
  const ids = profile?.conditions ?? [];
  const valid = new Set(CDL_CONDITIONS.map((c) => c.id));
  return ids.filter((id) => valid.has(id));
};

export const hasProfileConditions = (profile) =>
  getProfileConditions(profile).length > 0;

export const getProfileConditionLabels = (profile) =>
  getProfileConditions(profile).map(
    (id) => CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id
  );
