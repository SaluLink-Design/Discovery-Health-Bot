/** Convert display copy to natural speech — rand not R, expand acronyms. */

const RAND_PATTERN = /\bR(\d{1,6})\b/g;

const ACRONYM_REPLACEMENTS = [
  [/\bCDA\b/g, 'Chronic Drug Amount'],
  [/\bDSP\b/g, 'designated service provider pharmacy'],
  [/\bHbA1c\b/gi, 'diabetes blood test'],
  [/\bEEG\b/g, 'brain wave test'],
  [/\bECG\b/g, 'heart tracing test'],
  [/\bMRI\b/g, 'M R I scan'],
  [/\bCT\b/g, 'C T scan'],
  [/\bNT-proBNP\b/gi, 'heart blood test'],
  [/\bCRP\b/g, 'inflammation blood test'],
  [/\bCD4\b/g, 'C D 4 count'],
  [/\bGP\b/g, 'general practitioner'],
  [/\bMSA\b/g, 'medical savings account'],
  [/\bCDL\b/g, 'chronic disease list'],
  [/\bPMB\b/g, 'Prescribed Minimum Benefits'],
  [/\bPMBs\b/g, 'Prescribed Minimum Benefits'],
  [/\bformulary\b/gi, 'approved medicine list'],
  [/\bauthorisation\b/gi, 'authorisation from Discovery'],
  [/\bspirometry\b/gi, 'lung function test'],
  [/\bcolonoscopy\b/gi, 'colonoscopy'],
  [/\bHolter\b/gi, 'heart rhythm monitor'],
];

export const formatRand = (amount) => {
  const n = Number(amount);
  if (Number.isNaN(n)) return String(amount);
  return `${n} rand`;
};

export const toSpeechFriendly = (text) => {
  if (!text) return '';

  let out = text.replace(RAND_PATTERN, (_, amount) => formatRand(amount));

  for (const [pattern, replacement] of ACRONYM_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }

  return out.replace(/\s+/g, ' ').trim();
};

/** Spoken question — prefer dedicated script, then brief, then context. */
export const buildQuestionSpeech = (question) => {
  if (question.questionSpeech) return toSpeechFriendly(question.questionSpeech);
  if (question.speechBrief) return toSpeechFriendly(question.speechBrief);
  if (question.speechPrompt) return toSpeechFriendly(question.speechPrompt);
  const parts = [question.context, question.prompt].filter(Boolean);
  return toSpeechFriendly(parts.join(' '));
};

/** Spoken correction — one insight only. */
export const buildCorrectionSpeech = (question) =>
  toSpeechFriendly(
    question.correctionBrief ?? question.correctionSpeech ?? question.correction ?? ''
  );
