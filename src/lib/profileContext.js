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

const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
});

const toCount = (value) => {
  const numeric = Number.parseInt(value ?? 0, 10);
  if (Number.isNaN(numeric)) return 0;
  return Math.max(0, numeric);
};

export const getPlanThemeFromProfile = (profile) => {
  const planThemeId = profile?.planThemeId ?? profile?.plan;
  if (!planThemeId) return null;
  return DISCOVERY_PLANS.find((plan) => plan.id === planThemeId) ?? null;
};

export const getPlanSubThemes = (profile) => {
  const planTheme = getPlanThemeFromProfile(profile);
  return planTheme?.subThemes ?? [];
};

export const getPlanSubThemeFromProfile = (profile) => {
  const planTheme = getPlanThemeFromProfile(profile);
  if (!planTheme) return null;

  const subThemes = planTheme.subThemes ?? [];
  if (subThemes.length === 0) return null;

  const requestedSubThemeId = profile?.planSubThemeId;
  if (requestedSubThemeId) {
    const matched = subThemes.find((subTheme) => subTheme.id === requestedSubThemeId);
    if (matched) return matched;
  }

  const defaultSubThemeId = planTheme.defaultSubThemeId;
  if (defaultSubThemeId) {
    return subThemes.find((subTheme) => subTheme.id === defaultSubThemeId) ?? subThemes[0];
  }

  return subThemes[0];
};

export const getPlanContributionBreakdown = (profile) => {
  const planTheme = getPlanThemeFromProfile(profile);
  const subTheme = getPlanSubThemeFromProfile(profile);
  if (!planTheme || !subTheme) return null;

  const additionalAdults = toCount(profile?.additionalAdults);
  const children = toCount(profile?.children);
  const monthlyRates = subTheme.rates?.monthly?.total;
  const monthlyContributionRates = subTheme.rates?.monthly?.contribution;
  const monthlySavingsRates = subTheme.rates?.monthly?.savings;

  if (!monthlyRates) return null;

  const breakdown = {
    mainMember: monthlyRates.mainMember,
    adults: monthlyRates.adult * additionalAdults,
    children: monthlyRates.child * children,
  };
  const contributionBreakdown = monthlyContributionRates
    ? {
        mainMember: monthlyContributionRates.mainMember,
        adults: monthlyContributionRates.adult * additionalAdults,
        children: monthlyContributionRates.child * children,
      }
    : null;
  const savingsBreakdown = monthlySavingsRates
    ? {
        mainMember: monthlySavingsRates.mainMember,
        adults: monthlySavingsRates.adult * additionalAdults,
        children: monthlySavingsRates.child * children,
      }
    : null;

  const household = {
    mainMembers: 1,
    additionalAdults,
    children,
  };

  const total = breakdown.mainMember + breakdown.adults + breakdown.children;
  const contributionTotal = contributionBreakdown
    ? contributionBreakdown.mainMember + contributionBreakdown.adults + contributionBreakdown.children
    : 0;
  const savingsTotal = savingsBreakdown
    ? savingsBreakdown.mainMember + savingsBreakdown.adults + savingsBreakdown.children
    : 0;

  return {
    planTheme,
    subTheme,
    monthlyRates,
    monthlyContributionRates,
    monthlySavingsRates,
    annualSavingsRates: subTheme.rates?.annual?.savings ?? null,
    household,
    breakdown,
    contributionBreakdown,
    savingsBreakdown,
    total,
    contributionTotal,
    savingsTotal,
  };
};

/**
 * Household lines using PDF contribution + MSA rates per role (main / adult / child).
 */
export const getHouseholdMemberLines = (contributionPreview) => {
  if (!contributionPreview) return [];

  const {
    monthlyRates,
    monthlyContributionRates,
    monthlySavingsRates,
    household,
  } = contributionPreview;

  const roleDefs = [
    { id: 'main', label: 'Main member', count: 1, alwaysShow: true },
    { id: 'adult', label: 'Additional adult', count: household.additionalAdults, alwaysShow: false },
    { id: 'child', label: 'Child', count: household.children, alwaysShow: false },
  ];

  const rateKey = { main: 'mainMember', adult: 'adult', child: 'child' };

  return roleDefs
    .map(({ id, label, count, alwaysShow }) => {
      const key = rateKey[id];
      const contributionEach = monthlyContributionRates?.[key] ?? monthlyRates[key];
      const msaEach = monthlySavingsRates?.[key] ?? 0;
      const totalEach = monthlyRates[key];
      const annualMsaEach = msaEach * 12;

      return {
        id,
        label,
        count,
        alwaysShow,
        contributionEach,
        msaEach,
        totalEach,
        annualMsaEach,
        contributionLine: contributionEach * count,
        msaLine: msaEach * count,
        totalLine: totalEach * count,
        annualMsaLine: annualMsaEach * count,
      };
    })
    .filter((line) => line.alwaysShow || line.count > 0);
};

export const getPlanMsaPreview = (profile) => {
  const planTheme = getPlanThemeFromProfile(profile);
  const subTheme = getPlanSubThemeFromProfile(profile);
  if (!planTheme || !subTheme) return null;

  const additionalAdults = toCount(profile?.additionalAdults);
  const children = toCount(profile?.children);

  const monthlySavingsRates = subTheme.rates?.monthly?.savings ?? {
    mainMember: 0,
    adult: 0,
    child: 0,
  };

  const breakdown = {
    mainMember: monthlySavingsRates.mainMember,
    adults: monthlySavingsRates.adult * additionalAdults,
    children: monthlySavingsRates.child * children,
  };

  const totalMonthly = breakdown.mainMember + breakdown.adults + breakdown.children;
  const totalAnnual = totalMonthly * 12;
  const annualBreakdown = {
    mainMember: breakdown.mainMember * 12,
    adults: breakdown.adults * 12,
    children: breakdown.children * 12,
  };

  return {
    planTheme,
    subTheme,
    hasMedicalSavingsAccount: Boolean(subTheme.hasMedicalSavingsAccount) && totalMonthly > 0,
    monthlySavingsRates,
    household: {
      mainMembers: 1,
      additionalAdults,
      children,
    },
    breakdown,
    annualBreakdown,
    totalMonthly,
    totalAnnual,
  };
};

export const formatCurrencyAmount = (value) => currencyFormatter.format(value ?? 0);

export const getPlanContributionSummary = (profile) => {
  const details = getPlanContributionBreakdown(profile);
  if (!details) return null;
  return `${details.planTheme.label} · ${details.subTheme.label} · ${formatCurrencyAmount(
    details.total
  )}/month`;
};

export const getPlanFromProfile = (profile) => {
  return getPlanThemeFromProfile(profile);
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
