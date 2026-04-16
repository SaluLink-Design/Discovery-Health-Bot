import { authiKnowledgeBase } from '../src/data/authiData.js';

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

const createItems = (items, detail) =>
  items.map((item) => ({
    label: item,
    detail,
  }));

export const createAuthiService = (pdfIndex) => ({
  ask(input) {
    const query = input.trim().toLowerCase();

    if (!query) {
      return {
        intent: 'general',
        condition: null,
        headline: 'Ask about treatment, medication, or hospital networks',
        summary:
          'Try a question about diabetes, asthma, formulary cover, or which hospital network applies to planned care.',
        sections: [],
        sources: pdfIndex.documents,
      };
    }

    const condition = getMatch(query, conditionMatchers, null);
    const intent = getMatch(query, intentMatchers, 'general');
    const conditionData = condition ? authiKnowledgeBase.conditions[condition] : null;
    const sections = [];
    const sourceSnippets = [];

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

      sourceSnippets.push(
        pdfIndex.getDocumentSnippet('treatment_basket', [
          condition,
          'chronic disease list',
          'ongoing management',
        ]),
      );
    }

    if (conditionData && (intent === 'general' || intent === 'medication')) {
      sections.push({
        title: 'Medicine support',
        items: createItems(
          conditionData.medications,
          'Check plan approval, formulary status, and chronic medicine rules before collection.',
        ),
      });

      sourceSnippets.push(
        pdfIndex.getDocumentSnippet('medicine_list', [condition, 'formulary', 'medicine list']),
      );
    }

    if (intent === 'hospital' || (!conditionData && intent === 'general')) {
      sections.push({
        title: 'Hospital networks',
        items: authiKnowledgeBase.hospitalNetworks.map((network) => ({
          label: `${network.code} - ${network.name}`,
          detail: network.description,
        })),
      });

      sourceSnippets.push(
        pdfIndex.getDocumentSnippet('hospital_network', ['hospital network', 'planned admission']),
      );
    }

    if (conditionData) {
      sections.push({
        title: 'Next guidance',
        items: createItems(
          conditionData.guidance,
          'Use this as a starting point before checking final plan-specific rules.',
        ),
      });
    }

    return {
      intent,
      condition,
      headline: conditionData ? conditionData.title : 'General Discovery Health guidance',
      summary: conditionData
        ? conditionData.summary
        : 'Authi uses the notebook-inspired rules plus PDF-backed snippets to guide members toward treatment, formulary, and hospital-network information.',
      sections,
      sources: sourceSnippets.filter(Boolean),
    };
  },
});
