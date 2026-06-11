import { speakText } from './speech';

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
 * The timer is not cleared externally — callers should guard `onComplete` with a cancelled flag.
 */
export const speakModuleIntro = ({ text, onComplete }) => {
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(fallbackTimer);
    onComplete?.();
  };

  if (!text?.trim()) {
    finish();
    return;
  }

  const fallbackTimer = window.setTimeout(finish, estimateSpeechMs(text));

  const started = speakText(text, {
    raw: true,
    rate: AUTHI_SPEECH_RATE,
    onEnd: finish,
  });

  if (!started) finish();
};
