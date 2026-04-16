export const authiKnowledgeBase = {
  conditions: {
    diabetes: {
      title: 'Diabetes support',
      summary:
        'Authi can help members understand treatment basket items, chronic medicine cover, and how to prepare for ongoing care.',
      treatment: {
        diagnostic: [
          { code: '123', desc: 'HbA1c test', count: 2 },
          { code: 'DIA-101', desc: 'GP or specialist assessment', count: 2 },
        ],
        ongoing: [
          { code: '456', desc: 'GP consultation', count: 4 },
          { code: 'DIA-202', desc: 'Follow-up pathology monitoring', count: 2 },
        ],
      },
      medications: [
        'Metformin',
        'Insulin analogues',
        'Glucose monitoring supplies',
      ],
      hospitals: ['Delta Hospital Network', 'KeyCare Hospital Network'],
      guidance: [
        'Check whether your plan requires a network hospital for planned admissions.',
        'Confirm chronic medicine approval before collecting recurring scripts.',
      ],
    },
    asthma: {
      title: 'Asthma support',
      summary:
        'Authi can point members to likely benefit areas for diagnosis, medicine cover, and network treatment options.',
      treatment: {
        diagnostic: [
          { code: 'AST-101', desc: 'Lung function testing', count: 1 },
          { code: 'AST-102', desc: 'Initial GP or specialist consultation', count: 2 },
        ],
        ongoing: [
          { code: 'AST-201', desc: 'Routine review consultation', count: 2 },
          { code: 'AST-202', desc: 'Peak flow or symptom monitoring support', count: 2 },
        ],
      },
      medications: [
        'Inhaled corticosteroids',
        'Combination controller inhalers',
        'Reliever inhalers',
      ],
      hospitals: ['KeyCare Casualty Hospitals', 'Smart Hospital Network'],
      guidance: [
        'Use approved medicine lists first to avoid unnecessary copayments.',
        'Emergency care rules can differ from planned admissions.',
      ],
    },
  },
  hospitalNetworks: [
    {
      name: 'KeyCare Hospital Network',
      code: 'KH',
      description:
        'Planned admissions on KeyCare Plus and KeyCare Core should use a hospital in the network.',
    },
    {
      name: 'KeyCare Casualty Hospitals',
      code: 'KC',
      description:
        'KeyCare Plus members can access any network casualty unit with authorisation and a stated upfront contribution.',
    },
    {
      name: 'Delta Hospital Network',
      code: 'D',
      description:
        'Applies to select Delta plans and may trigger an upfront amount when planned admissions happen outside the network.',
    },
    {
      name: 'Smart Hospital Network',
      code: 'S',
      description:
        'Smart plan members should use the specified network hospitals for planned care.',
    },
  ],
  documentSources: [
    'Treatment Baskets for the Chronic Disease List Conditions 2026',
    'Chronic Illness Benefit Medicine List 2026',
    'Quality Care in Our Hospital Network 2026',
  ],
};

export const quickPrompts = [
  'What treatment benefits are available for diabetes?',
  'Show me asthma medication support.',
  'Which hospital network should I use for planned admission?',
];
