import { CAMPAIGN_MODULE_IDS } from './campaignLiteracy';
import {
  getCampaignSessionId,
  loadCampaignState,
} from './campaignStore';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { sendSurveyInviteEmail } from './sendSurveyInvite';

const PENDING_KEY = 'authi_campaign_pending_sync';

const queuePending = (payload) => {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push({ ...payload, queuedAt: new Date().toISOString() });
    localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
};

/** Submit a single module result — called immediately after quiz completion. */
export const submitModuleResult = async ({ moduleId, profile, result }) => {
  const sessionId = getCampaignSessionId();
  const payload = {
    session_id: sessionId,
    module_id: moduleId,
    character_id: profile?.characterId ?? null,
    scenario_id: profile?.characterId ?? null,
    score: result.score,
    total_questions: result.total,
    skipped: false,
    scenario_run: false,
    answers: result.answers,
    completed_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    queuePending({ type: 'module', data: payload });
    return { ok: true, mode: 'local' };
  }

  const { error } = await supabase.from('campaign_module_results').insert(payload);
  if (error) {
    queuePending({ type: 'module', data: payload });
    return { ok: false, mode: 'local', error: error.message };
  }
  return { ok: true, mode: 'supabase' };
};

export const submitScenarioRun = async ({ moduleId, profile }) => {
  const sessionId = getCampaignSessionId();
  const payload = {
    session_id: sessionId,
    module_id: moduleId,
    character_id: profile?.characterId ?? null,
    event: 'scenario_run',
    recorded_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    queuePending({ type: 'scenario', data: payload });
    return { ok: true, mode: 'local' };
  }

  const { error } = await supabase.from('campaign_events').insert(payload);
  if (error) {
    queuePending({ type: 'scenario', data: payload });
    return { ok: false, mode: 'local', error: error.message };
  }
  return { ok: true, mode: 'supabase' };
};

/** Optional survey opt-in — saves email on campaign_sessions and requests survey link delivery. */
export const submitSurveyOptIn = async ({ profile, email }) => {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { ok: false, error: 'Please enter your email to receive the survey link.' };
  }

  const sessionResult = await submitCampaignSave({ profile, email: trimmedEmail });
  if (!sessionResult.ok && sessionResult.mode !== 'local') {
    return sessionResult;
  }

  let emailSent = false;
  let emailReason = null;
  const delivery = await sendSurveyInviteEmail(trimmedEmail);
  emailSent = delivery.sent;
  emailReason = delivery.reason;

  return {
    ok: true,
    mode: isSupabaseConfigured ? 'supabase' : 'local',
    emailSent,
    emailReason,
  };
};

/** Final save at end of journey — optional email opt-in. */
export const submitCampaignSave = async ({ profile, email = '' }) => {
  const sessionId = getCampaignSessionId();
  const state = loadCampaignState();
  const trimmedEmail = email.trim();
  const emailOptIn = Boolean(trimmedEmail);

  const sessionPayload = {
    session_id: sessionId,
    character_id: profile?.characterId ?? null,
    completed_at: new Date().toISOString(),
    email: trimmedEmail || null,
    email_opt_in: emailOptIn,
    modules_completed: CAMPAIGN_MODULE_IDS.filter((id) => {
      const mod = state.modules[id];
      return mod?.completed || mod?.skipped;
    }).length,
    modules_data: state.modules,
  };

  if (!isSupabaseConfigured) {
    queuePending({ type: 'session', data: sessionPayload });
    return { ok: true, mode: 'local' };
  }

  const { error: sessionError } = await supabase
    .from('campaign_sessions')
    .upsert(sessionPayload, { onConflict: 'session_id' });

  if (sessionError) {
    queuePending({ type: 'session', data: sessionPayload });
    return { ok: false, mode: 'local', error: sessionError.message };
  }

  return { ok: true, mode: 'supabase' };
};
