import { CAMPAIGN_MODULE_IDS } from './campaignLiteracy';

const STORAGE_KEY = 'authi_campaign_v1';
const SESSION_KEY = 'authi_campaign_session_id';

const emptyModule = () => ({
  completed: false,
  skipped: false,
  score: 0,
  total: 0,
  answers: [],
  scenarioRun: false,
  completedAt: null,
});

const defaultState = () => ({
  modules: Object.fromEntries(CAMPAIGN_MODULE_IDS.map((id) => [id, emptyModule()])),
  saved: false,
  emailOptIn: null,
  savedAt: null,
});

export const getCampaignSessionId = () => {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `local-${Date.now()}`;
  }
};

export const loadCampaignState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const modules = { ...defaultState().modules, ...parsed.modules };
    return { ...defaultState(), ...parsed, modules };
  } catch {
    return defaultState();
  }
};

export const saveCampaignState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable
  }
};

export const clearCampaignState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
};

/** Reset journey quizzes — keeps profile, clears literacy progress. */
export const resetCampaignJourney = () => {
  clearCampaignState();
};

export const resetModuleQuiz = (moduleId) => {
  const state = loadCampaignState();
  state.modules[moduleId] = emptyModule();
  state.saved = false;
  saveCampaignState(state);
  return state;
};

export const isModuleUnlocked = (moduleId) => {
  const mod = loadCampaignState().modules[moduleId];
  return Boolean(mod?.completed || mod?.skipped);
};

export const completeModuleQuiz = (moduleId, { score, total, answers }) => {
  const state = loadCampaignState();
  state.modules[moduleId] = {
    ...emptyModule(),
    completed: true,
    score,
    total,
    answers,
    completedAt: new Date().toISOString(),
  };
  saveCampaignState(state);
  return state;
};

export const skipModuleQuiz = (moduleId) => {
  const state = loadCampaignState();
  state.modules[moduleId] = {
    ...emptyModule(),
    skipped: true,
    completedAt: new Date().toISOString(),
  };
  saveCampaignState(state);
  return state;
};

export const markScenarioRun = (moduleId) => {
  const state = loadCampaignState();
  if (!state.modules[moduleId]) state.modules[moduleId] = emptyModule();
  state.modules[moduleId].scenarioRun = true;
  saveCampaignState(state);
  return state;
};

export const getCompletedModuleCount = () =>
  CAMPAIGN_MODULE_IDS.filter((id) => {
    const mod = loadCampaignState().modules[id];
    return mod?.completed || mod?.skipped;
  }).length;

export const isCampaignJourneyComplete = () =>
  getCompletedModuleCount() === CAMPAIGN_MODULE_IDS.length;

export const markCampaignSaved = (emailOptIn = null) => {
  const state = loadCampaignState();
  state.saved = true;
  state.emailOptIn = emailOptIn;
  state.savedAt = new Date().toISOString();
  saveCampaignState(state);
  return state;
};

export const shouldShowSavePrompt = () =>
  isCampaignJourneyComplete() && !loadCampaignState().saved;

/** Module order for literacy journey — treatment-first for all members. */
export const getCampaignModuleOrder = (profile) => {
  const order = ['treatment', 'medication', 'hospitals'];
  const hasConditions = (profile?.conditions ?? []).length > 0;

  return order.filter((id) => {
    if (id === 'treatment' || id === 'medication') return hasConditions;
    return true;
  });
};

export const getNextCampaignModule = (profile) => {
  const order = getCampaignModuleOrder(profile);
  return order.find((id) => !isModuleUnlocked(id)) ?? null;
};

/** Next module in journey order after the one just completed. */
export const getNextCampaignModuleAfter = (currentModuleId, profile) => {
  const order = getCampaignModuleOrder(profile);
  const idx = order.indexOf(currentModuleId);
  if (idx === -1 || idx >= order.length - 1) return null;
  return order[idx + 1];
};

/** First incomplete module after the current one in journey order. */
export const getNextIncompleteModuleAfter = (currentModuleId, profile) => {
  const order = getCampaignModuleOrder(profile);
  const idx = order.indexOf(currentModuleId);
  if (idx === -1) return null;
  for (let i = idx + 1; i < order.length; i += 1) {
    if (!isModuleUnlocked(order[i])) return order[i];
  }
  return null;
};

export const getCampaignProgressSummary = (profile) => {
  const order = getCampaignModuleOrder(profile);
  const state = loadCampaignState();
  const items = order.map((id) => ({
    id,
    ...state.modules[id],
    unlocked: isModuleUnlocked(id),
  }));
  const completed = items.filter((item) => item.completed || item.skipped).length;
  return {
    items,
    completed,
    total: order.length,
    nextModuleId: getNextCampaignModule(profile),
    allDone: completed === order.length && order.length > 0,
  };
};
