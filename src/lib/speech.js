import { toSpeechFriendly } from './speechText';

/** Browser TTS — one consistent voice, loaded before first speak. */

let activeUtterance = null;
let cachedVoice = null;
let voicesReady = false;
let voicesPromise = null;
/** Bumps on each speakText call — stale async callbacks are ignored. */
let speakGeneration = 0;

const VOICE_RANK = [
  (v) => /Google UK English Female/i.test(v.name),
  (v) => /Google US English/i.test(v.name),
  (v) => v.name === 'Samantha' && v.lang.startsWith('en'),
  (v) => v.name === 'Karen' && v.lang.startsWith('en'),
  (v) => /Google/i.test(v.name) && v.lang.startsWith('en'),
  (v) => v.lang.startsWith('en-GB'),
  (v) => v.lang.startsWith('en-US'),
  (v) => v.lang.startsWith('en-ZA'),
  (v) => v.lang.startsWith('en'),
];

const pickVoice = () => {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  for (const rank of VOICE_RANK) {
    const match = voices.find(rank);
    if (match) return match;
  }
  return voices[0] ?? null;
};

export const isSpeechSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Preload voices so the first line doesn't use a different default voice. */
export const ensureSpeechVoices = () => {
  if (!isSpeechSupported()) return Promise.resolve(null);
  if (voicesReady && cachedVoice) return Promise.resolve(cachedVoice);
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    const resolveVoice = () => {
      const voice = pickVoice();
      if (voice) {
        cachedVoice = voice;
        voicesReady = true;
        resolve(voice);
        return true;
      }
      return false;
    };

    if (resolveVoice()) return;

    const onVoicesChanged = () => {
      if (resolveVoice()) {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    window.setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      if (!voicesReady) {
        cachedVoice = pickVoice();
        voicesReady = true;
      }
      resolve(cachedVoice);
    }, 250);
  });

  return voicesPromise;
};

if (typeof window !== 'undefined') {
  ensureSpeechVoices();
}

export const stopSpeaking = () => {
  if (!isSpeechSupported()) return;
  speakGeneration += 1;
  window.speechSynthesis.cancel();
  activeUtterance = null;
};

export const speakText = (text, { rate = 0.95, pitch = 1, onEnd, raw = false } = {}) => {
  if (!isSpeechSupported() || !text?.trim()) {
    onEnd?.();
    return false;
  }

  const generation = ++speakGeneration;
  window.speechSynthesis.cancel();
  activeUtterance = null;

  const spoken = raw ? text.trim() : toSpeechFriendly(text);

  ensureSpeechVoices().then((voice) => {
    if (generation !== speakGeneration) return;

    const utterance = new SpeechSynthesisUtterance(spoken);
    utterance.rate = rate;
    utterance.pitch = pitch;
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'en-GB';
    }

    utterance.onend = () => {
      if (generation !== speakGeneration) return;
      activeUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      if (generation !== speakGeneration) return;
      activeUtterance = null;
      onEnd?.();
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });

  return true;
};
