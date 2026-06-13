import { CDL_CONDITION_DETAILS } from '../data/authiData';
import { TREATMENT_BASKET_COPY } from './literacyContent';
import {
  buildQ1Context,
  buildQ1Copy,
  buildQ2Context,
  buildQ2Copy,
  pickDiagnosticForQuiz,
  pickOngoingForQuiz,
} from './treatmentQuizBlueprint';
import {
  articleBefore,
  conditionLabel,
  personaName,
  pickPrimaryCondition,
  pronouns,
} from './quizShared';

/** Fetch PDF-backed basket; merge with bundled CDL data when PDF rows are missing. */
export const fetchTreatmentBasket = async (conditionId) => {
  const bundled = CDL_CONDITION_DETAILS[conditionId]?.treatment ?? {};
  const fallback = {
    conditionId,
    diagnostic: bundled.diagnostic ?? [],
    ongoing: bundled.ongoing ?? [],
  };

  try {
    const res = await fetch(`/api/treatments?condition_id=${encodeURIComponent(conditionId)}`);
    if (res.ok) {
      const data = await res.json();
      return {
        conditionId,
        diagnostic: data.diagnostic?.length ? data.diagnostic : fallback.diagnostic,
        ongoing: data.ongoing?.length ? data.ongoing : fallback.ongoing,
      };
    }
  } catch {
    // offline / API down
  }

  return fallback;
};

const withUsage = (items, matchDesc, used) =>
  items.map((item) => {
    const match =
      item.desc === matchDesc ||
      item.desc?.toLowerCase().includes(matchDesc.toLowerCase()) ||
      matchDesc.toLowerCase().includes(item.desc?.toLowerCase());
    return match ? { ...item, used, highlight: false } : { ...item, used: 0 };
  });

const dedupeByDesc = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.desc?.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const buildTreatmentResultSummary = (profile, basket, conditionId) => {
  const label = conditionLabel(conditionId);
  const diagnosticItems = dedupeByDesc(basket.diagnostic ?? []).slice(0, 3);
  const ongoingItems = dedupeByDesc(basket.ongoing ?? []).slice(0, 3);

  const formatItem = (item) =>
    item.count ? `${item.desc} (up to ${item.count} per year)` : item.desc;

  const article = articleBefore(label);

  return {
    headline: `Your ${label} treatment basket`,
    intro:
      'Two funded parts — assessment at diagnosis, then yearly monitoring. Different tests, different limits, both under Prescribed Minimum Benefits.',
    diagnosticHeading: TREATMENT_BASKET_COPY.diagnosticResultHeading,
    diagnosticIntro: 'Tests to confirm your condition and plan care.',
    diagnosticItems: diagnosticItems.map(formatItem),
    ongoingHeading: TREATMENT_BASKET_COPY.ongoingResultHeading,
    ongoingIntro: 'Repeat tests to track how you are doing each year.',
    ongoingItems: ongoingItems.map(formatItem),
    fundingNote: null,
    cta: 'Scroll down to see your full basket.',
    speechText: `As ${article} ${label} patient, your cover sits in a treatment basket. Part one: tests at diagnosis. Part two: yearly monitoring. Discovery funds both under Prescribed Minimum Benefits — different limits, not duplicate cover. Your full list is below.`,
  };
};

/**
 * Asthma-style blueprint for every condition:
 * Q1 — diagnostic assessment, who pays, bare → full basket visual
 * Q2 — ongoing limit exhausted, motivation path, usage visual
 */
export const buildTreatmentQuizQuestions = (profile, basket, conditionId) => {
  const name = personaName(profile);
  const label = conditionLabel(conditionId);
  const prons = pronouns(profile);
  const { subj, narrativeDoctor } = prons;

  const focal = pickDiagnosticForQuiz(basket.diagnostic ?? []);
  const usageItem = pickOngoingForQuiz(basket.ongoing ?? []);
  const usageTotal = usageItem.count ?? 3;

  const q1 = buildQ1Copy({ name, label, conditionId, focal, doctor: narrativeDoctor });
  const q2 = buildQ2Copy({
    name,
    conditionId,
    usageTotal,
    usageItem,
    doctor: narrativeDoctor,
    subj,
  });

  const sourceNote = `${label} · Chronic Disease List treatment guide 2026`;
  const diagnosticSection = {
    title: TREATMENT_BASKET_COPY.diagnosticSectionShort,
    items: [{ ...focal, highlight: false }],
  };
  const ongoingSection = {
    title: TREATMENT_BASKET_COPY.ongoingSectionShort,
    items: withUsage([usageItem], usageItem.desc, usageTotal),
  };

  return [
    {
      id: 't1',
      context: buildQ1Context(name, label, conditionId, focal, prons),
      glossary: null,
      prompt: 'Who pays for this procedure?',
      questionSpeech: q1.questionSpeech,
      visual: 'treatment-basket',
      visualMeta: {
        bare: true,
        sections: [diagnosticSection],
        sourceNote,
      },
      visualAfter: 'treatment-basket',
      visualAfterMeta: {
        bare: false,
        sections: [diagnosticSection],
        sourceNote,
      },
      options: [
        { id: 'scheme', label: 'Your medical scheme' },
        { id: 'oop', label: 'You — out of pocket' },
        { id: 'split', label: 'Medical scheme pays half, you pay half' },
      ],
      correct: 'scheme',
      correction: q1.correction,
      correctionBrief: q1.correctionBrief,
    },
    {
      id: 't2',
      context: buildQ2Context(name, usageTotal, usageItem),
      glossary: `Discovery allows up to ${usageTotal} per benefit year. Each use fills one slot until none are left.`,
      glossarySpeech: q2.glossarySpeech,
      prompt: q2.prompt,
      questionSpeech: q2.questionSpeech,
      visual: 'treatment-basket',
      visualMeta: {
        sections: [ongoingSection],
        sourceNote: `${label} · ${usageItem.desc} from treatment basket PDF`,
      },
      options: q2.options,
      correct: 'motivation',
      correction: q2.correction,
      correctionBrief: q2.correctionBrief,
      visualAfter: 'motivation',
    },
  ];
};

export const loadTreatmentModuleQuestions = async (profile, conditionIdOverride) => {
  const conditionId = conditionIdOverride ?? pickPrimaryCondition(profile);
  const basket = await fetchTreatmentBasket(conditionId);
  return {
    questions: buildTreatmentQuizQuestions(profile, basket, conditionId),
    resultSummary: buildTreatmentResultSummary(profile, basket, conditionId),
  };
};
