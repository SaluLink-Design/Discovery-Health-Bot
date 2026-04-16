import { authiKnowledgeBase } from '../data/authiData';

const intentMatchers = {
  treatment: ['treatment', 'benefit', 'diagnosis', 'care', 'basket'],
  medication: ['medicine', 'medication', 'drug', 'formulary', 'script'],
  hospital: ['hospital', 'network', 'admission', 'facility', 'casualty'],
};

const conditionMatchers = {
  diabetes: ['diabetes', 'insulin', 'glucose', 'hba1c'],
  asthma: ['asthma', 'inhaler', 'wheeze', 'bronchodilator'],
};

const getMatch = (query, matchers, fallback) =>
  Object.entries(matchers).find(([, keywords]) =>
    keywords.some((keyword) => query.includes(keyword)),
  )?.[0] ?? fallback;

export const processQuery = (input) => {
  const query = input.trim().toLowerCase();

  if (!query) {
    return {
      intent: 'general',
      condition: null,
      headline: 'Ask about treatment, medication, or hospital networks',
      summary:
        'Try a question about diabetes, asthma, formulary cover, or which hospital network applies to planned care.',
      sections: [],
    };
  }

  const condition = getMatch(query, conditionMatchers, null);
  const intent = getMatch(query, intentMatchers, 'general');
  const conditionData = condition ? authiKnowledgeBase.conditions[condition] : null;

  const sections = [];

  if (conditionData && (intent === 'general' || intent === 'treatment')) {
    sections.push({
      title: 'Treatment basket',
      items: [
        ...conditionData.treatment.diagnostic.map((item) => ({
          label: `${item.desc} (${item.code})`,
          detail: `Diagnostic cover guidance: up to ${item.count} item(s).`,
        })),
        ...conditionData.treatment.ongoing.map((item) => ({
          label: `${item.desc} (${item.code})`,
          detail: `Ongoing care guidance: up to ${item.count} item(s).`,
        })),
      ],
    });
  }

  if (conditionData && (intent === 'general' || intent === 'medication')) {
    sections.push({
      title: 'Medicine support',
      items: conditionData.medications.map((item) => ({
        label: item,
        detail: 'Check plan approval and formulary status before collection.',
      })),
    });
  }

  if (intent === 'hospital' || (!conditionData && intent === 'general')) {
    sections.push({
      title: 'Hospital networks',
      items: authiKnowledgeBase.hospitalNetworks.map((network) => ({
        label: `${network.code} - ${network.name}`,
        detail: network.description,
      })),
    });
  }

  if (conditionData) {
    sections.push({
      title: 'Next guidance',
      items: conditionData.guidance.map((item) => ({
        label: item,
        detail: 'Use this as a starting point before checking the full scheme rules.',
      })),
    });
  }

  return {
    intent,
    condition,
    headline: conditionData ? conditionData.title : 'General Discovery Health guidance',
    summary: conditionData
      ? conditionData.summary
      : 'Authi uses the notebook-inspired rules to route members toward treatment, formulary, and hospital-network guidance.',
    sections,
  };
};
