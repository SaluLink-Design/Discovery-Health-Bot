import { speakText, stopSpeaking } from './speech';

/** Default TTS rate — slightly below 1 for natural conversational pace. */
export const AUTHI_SPEECH_RATE = 0.95;

/** Estimate when speech should finish (~150 wpm scaled by rate). */
export const estimateSpeechMs = (text, rate = AUTHI_SPEECH_RATE) => {
  const words = String(text ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (!words) return 0;
  const wpm = 150 * rate;
  return Math.min(120_000, Math.max(4_000, (words / wpm) * 60_000 + 600));
};

/** Combine concept intro + spoken quiz invitation for one Authi pass. */
export const buildSpokenModuleIntro = (introSpeech, quizPitch) =>
  [introSpeech, quizPitch].filter(Boolean).join(' ').trim();

/**
 * Speak module intro once; `onComplete` fires on end, error, or estimated duration.
 * Returns `cancel` — call it when leaving the page or unmounting to stop speech immediately.
 */
export const speakModuleIntro = ({ text, onComplete }) => {
  let finished = false;
  let fallbackTimer = null;

  const clearFallback = () => {
    if (fallbackTimer != null) {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    clearFallback();
    onComplete?.();
  };

  const cancel = () => {
    if (finished) return;
    finished = true;
    clearFallback();
    stopSpeaking();
  };

  if (!text?.trim()) {
    finish();
    return cancel;
  }

  fallbackTimer = window.setTimeout(finish, estimateSpeechMs(text));

  const started = speakText(text, {
    raw: true,
    rate: AUTHI_SPEECH_RATE,
    onEnd: finish,
  });

  if (!started) finish();

  return cancel;
};
