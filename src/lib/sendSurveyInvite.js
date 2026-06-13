import emailjs from '@emailjs/browser';
import { CUSTOMER_SURVEY_FORM_URL } from './surveyConfig.js';
import { isSupabaseConfigured } from './supabaseClient.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const emailJsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const emailJsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const emailJsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const sendViaEmailJs = async (email) => {
  if (!emailJsServiceId || !emailJsTemplateId || !emailJsPublicKey) {
    return null;
  }

  try {
    await emailjs.send(
      emailJsServiceId,
      emailJsTemplateId,
      {
        user_email: email,
        survey_link: CUSTOMER_SURVEY_FORM_URL,
        to_email: email,
      },
      { publicKey: emailJsPublicKey },
    );
    return { sent: true, reason: 'emailjs' };
  } catch (error) {
    console.error('EmailJS survey invite failed:', error);
    return { sent: false, reason: 'emailjs_failed' };
  }
};

const sendViaSupabaseFunction = async (email) => {
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-survey-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ email, surveyUrl: CUSTOMER_SURVEY_FORM_URL }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.sent) {
      return { sent: true, reason: data.reason ?? 'supabase_function' };
    }
    return null;
  } catch {
    return null;
  }
};

const sendViaLocalApi = async (email) => {
  try {
    const response = await fetch('/api/survey/send-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.sent) {
      return { sent: true, reason: data.reason ?? 'local_api' };
    }
    return null;
  } catch {
    return null;
  }
};

/** Send optional survey link to the member's inbox. */
export const sendSurveyInviteEmail = async (email) => {
  const trimmed = email.trim();
  if (!trimmed) {
    return { sent: false, reason: 'missing_email' };
  }

  const providers = [sendViaLocalApi, sendViaSupabaseFunction, sendViaEmailJs];

  for (const provider of providers) {
    const result = await provider(trimmed);
    if (result?.sent) {
      return result;
    }
  }

  const hasEmailJs = Boolean(emailJsServiceId && emailJsTemplateId && emailJsPublicKey);
  return {
    sent: false,
    reason: hasEmailJs ? 'all_providers_failed' : 'email_not_configured',
  };
};
