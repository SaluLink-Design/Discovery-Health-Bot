const STORAGE_KEY = 'authi_patient_profile';

export const loadProfile = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveProfile = (profile) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
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
