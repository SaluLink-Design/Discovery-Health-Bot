import { DISCOVERY_PLANS } from '../data/authiData';

const STORAGE_KEY = 'authi_patient_profile';

const getDefaultSubThemeId = (planThemeId) => {
  const planTheme = DISCOVERY_PLANS.find((plan) => plan.id === planThemeId);
  return planTheme?.defaultSubThemeId ?? planTheme?.subThemes?.[0]?.id ?? '';
};

const normalizeProfile = (profile) => {
  if (!profile || typeof profile !== 'object') return null;

  const planThemeId = profile.planThemeId ?? profile.plan ?? '';
  const additionalAdults = Math.max(0, Number.parseInt(profile.additionalAdults ?? 0, 10) || 0);
  const children = Math.max(0, Number.parseInt(profile.children ?? 0, 10) || 0);

  return {
    ...profile,
    characterId: profile.characterId ?? '',
    idNumber: profile.idNumber ?? '',
    email: profile.email ?? '',
    medicalAid: profile.medicalAid ?? 'discovery',
    plan: planThemeId,
    planThemeId,
    planSubThemeId: profile.planSubThemeId ?? getDefaultSubThemeId(planThemeId),
    conditions: Array.isArray(profile.conditions) ? profile.conditions : [],
    additionalAdults,
    children,
  };
};

export const loadProfile = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeProfile(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

export const saveProfile = (profile) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeProfile(profile)));
  } catch {
    // storage unavailable — silently ignore
  }
};

export const clearProfile = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable — silently ignore
  }
};
