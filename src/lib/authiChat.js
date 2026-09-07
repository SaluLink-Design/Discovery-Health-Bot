import {
  formatCurrencyAmount,
  getPlanContributionBreakdown,
  getPlanFromProfile,
  getPlanHospitalNetworks,
  getPlanSubThemeFromProfile,
  getProfileConditionLabels,
} from './profileContext';

export const buildAskProfile = (profile) => {
  if (!profile) return null;

  const plan = getPlanFromProfile(profile);
  const subTheme = getPlanSubThemeFromProfile(profile);
  const contribution = getPlanContributionBreakdown(profile);
  const conditionIds = profile.conditions ?? [];

  return {
    name: profile.name?.trim() || null,
    planId: plan?.id ?? profile.planThemeId ?? profile.plan ?? null,
    planLabel: plan?.label ?? null,
    subThemeLabel: subTheme?.label ?? null,
    conditionIds,
    conditionLabels: getProfileConditionLabels(profile),
    town: profile.town ?? null,
    province: profile.province ?? null,
    networkCodes: getPlanHospitalNetworks(profile),
    contributionMonthly: contribution
      ? `${formatCurrencyAmount(contribution.total)} per month`
      : null,
    contributionNotes: contribution
      ? `${contribution.planTheme.label} · ${contribution.subTheme.label} · ${contribution.household.additionalAdults} additional adult(s), ${contribution.household.children} child(ren)`
      : null,
  };
};

export const askAuthi = async ({ query, profile, history, networkCodes }) => {
  const payload = {
    query,
    profile: buildAskProfile(profile),
    history: (history ?? [])
      .filter((turn) => turn.role === 'user' || turn.role === 'assistant')
      .map((turn) => ({ role: turn.role, content: turn.content }))
      .slice(-6),
  };

  if (networkCodes?.length) {
    payload.networkCodes = networkCodes;
  } else if (payload.profile?.networkCodes?.length) {
    payload.networkCodes = payload.profile.networkCodes;
  }

  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Authi request failed (${response.status})`);
  }

  return response.json();
};

export const chatSuggestions = (profile) => {
  const labels = getProfileConditionLabels(profile);
  const condition = labels[0] ?? 'my chronic condition';
  const town = profile?.town?.trim();

  return [
    `What care am I covered for with ${condition}?`,
    `Which medicines are on the formulary for ${condition}?`,
    town ? `Which hospitals near ${town} are on my plan?` : 'Which hospitals are on my plan?',
    'What do I pay each month on this plan?',
  ];
};
