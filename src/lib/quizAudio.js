/** Brief pause before the answer window — no synthetic tones (keeps Authi's voice clean). */

export const pauseBeforeAnswer = (onEnd, ms = 400) => {
  window.setTimeout(() => onEnd?.(), ms);
};
