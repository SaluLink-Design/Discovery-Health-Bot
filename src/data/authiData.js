const noMsa = { mainMember: 0, adult: 0, child: 0 };

const createContributionSubTheme = ({
  id,
  label,
  monthlyContribution,
  monthlySavings = noMsa,
  annualSavings = null,
  monthlyTotal,
  hasMedicalSavingsAccount = true,
  notes = [],
}) => ({
  id,
  label,
  rates: {
    monthly: {
      contribution: monthlyContribution,
      savings: monthlySavings,
      total: monthlyTotal ?? {
        mainMember: monthlyContribution.mainMember + monthlySavings.mainMember,
        adult: monthlyContribution.adult + monthlySavings.adult,
        child: monthlyContribution.child + monthlySavings.child,
      },
    },
    annual: annualSavings
      ? {
          savings: annualSavings,
        }
      : undefined,
  },
  hasMedicalSavingsAccount,
  notes,
});

export const DISCOVERY_PLANS = [
  {
    id: 'core',
    label: 'Core',
    tagline: 'Essential cover with KeyCare network access',
    hospitalNetworkCodes: ['KH', 'KC', 'KS', 'KR', 'D', 'C'],
    hospitalNetworkNames: ['KeyCare Hospital Network', 'Delta Hospital Network', 'Coastal Network'],
    defaultSubThemeId: 'classic_core',
    subThemes: [
      createContributionSubTheme({
        id: 'classic_core',
        label: 'Classic Core',
        monthlyContribution: { mainMember: 3905, adult: 3083, child: 1562 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'classic_delta_core',
        label: 'Classic Delta Core',
        monthlyContribution: { mainMember: 3126, adult: 2465, child: 1250 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'essential_core',
        label: 'Essential Core',
        monthlyContribution: { mainMember: 3356, adult: 2517, child: 1347 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'essential_delta_core',
        label: 'Essential Delta Core',
        monthlyContribution: { mainMember: 2681, adult: 2018, child: 1076 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'coastal_core',
        label: 'Coastal Core',
        monthlyContribution: { mainMember: 3250, adult: 2438, child: 1291 },
        hasMedicalSavingsAccount: false,
      }),
    ],
    notes: [
      'Planned admissions must use a KeyCare network hospital.',
      'Chronic medicine covered via the Prescribed Minimum Benefits (PMB) drug list.',
      'Day-to-day benefits funded from a limited savings account.',
    ],
  },
  {
    id: 'saver',
    label: 'Saver',
    tagline: 'Balanced cover with Smart and Delta networks',
    hospitalNetworkCodes: ['S', 'D'],
    hospitalNetworkNames: ['Smart Hospital Network', 'Delta Hospital Network'],
    defaultSubThemeId: 'classic_saver',
    subThemes: [
      createContributionSubTheme({
        id: 'classic_saver',
        label: 'Classic Saver',
        monthlyContribution: { mainMember: 3880, adult: 3060, child: 1555 },
        monthlySavings: { mainMember: 970, adult: 765, child: 388 },
        annualSavings: { mainMember: 11448, adult: 9030, child: 4578 },
      }),
      createContributionSubTheme({
        id: 'classic_delta_saver',
        label: 'Classic Delta Saver',
        monthlyContribution: { mainMember: 3100, adult: 2450, child: 1245 },
        monthlySavings: { mainMember: 775, adult: 612, child: 311 },
        annualSavings: { mainMember: 9147, adult: 7224, child: 3672 },
      }),
      createContributionSubTheme({
        id: 'essential_saver',
        label: 'Essential Saver',
        monthlyContribution: { mainMember: 3498, adult: 2623, child: 1401 },
        monthlySavings: { mainMember: 388, adult: 291, child: 155 },
        annualSavings: { mainMember: 4581, adult: 3435, child: 1830 },
      }),
      createContributionSubTheme({
        id: 'essential_delta_saver',
        label: 'Essential Delta Saver',
        monthlyContribution: { mainMember: 2790, adult: 2106, child: 1119 },
        monthlySavings: { mainMember: 309, adult: 233, child: 124 },
        annualSavings: { mainMember: 3648, adult: 2751, child: 1464 },
      }),
      createContributionSubTheme({
        id: 'coastal_saver',
        label: 'Coastal Saver',
        monthlyContribution: { mainMember: 3484, adult: 2620, child: 1401 },
        monthlySavings: { mainMember: 614, adult: 462, child: 247 },
        annualSavings: { mainMember: 7233, adult: 5442, child: 2913 },
      }),
    ],
    notes: [
      'Planned admissions should use a Smart or Delta network hospital.',
      'Access to a medical savings account (MSA) for day-to-day expenses.',
      'Above-threshold benefit kicks in after the annual threshold is reached.',
    ],
  },
  {
    id: 'priority',
    label: 'Priority',
    tagline: 'Comprehensive day-to-day plus Smart and Delta networks',
    hospitalNetworkCodes: ['S', 'D'],
    hospitalNetworkNames: ['Smart Hospital Network', 'Delta Hospital Network'],
    defaultSubThemeId: 'classic_priority',
    subThemes: [
      createContributionSubTheme({
        id: 'classic_priority',
        label: 'Classic Priority',
        monthlyContribution: { mainMember: 4649, adult: 3667, child: 1859 },
        monthlySavings: { mainMember: 1549, adult: 1222, child: 619 },
        annualSavings: { mainMember: 18285, adult: 14424, child: 7308 },
      }),
      createContributionSubTheme({
        id: 'essential_priority',
        label: 'Essential Priority',
        monthlyContribution: { mainMember: 4528, adult: 3561, child: 1808 },
        monthlySavings: { mainMember: 799, adult: 628, child: 319 },
        annualSavings: { mainMember: 9432, adult: 7413, child: 3765 },
      }),
    ],
    notes: [
      'More generous day-to-day cover than Saver.',
      'Planned hospital admissions via Smart or Delta network.',
      'Extended family support benefits included.',
    ],
  },
  {
    id: 'comprehensive',
    label: 'Comprehensive',
    tagline: 'Broad hospital access across all major networks',
    hospitalNetworkCodes: ['KH', 'KC', 'S', 'D'],
    hospitalNetworkNames: [
      'KeyCare Hospital Network',
      'Smart Hospital Network',
      'Delta Hospital Network',
    ],
    defaultSubThemeId: 'classic_comprehensive',
    subThemes: [
      createContributionSubTheme({
        id: 'classic_comprehensive',
        label: 'Classic Comprehensive',
        monthlyContribution: { mainMember: 7528, adult: 7119, child: 1502 },
        monthlySavings: { mainMember: 2509, adult: 2373, child: 500 },
        annualSavings: { mainMember: 29550, adult: 27948, child: 5892 },
      }),
      createContributionSubTheme({
        id: 'classic_smart_comprehensive',
        label: 'Classic Smart Comprehensive',
        monthlyContribution: { mainMember: 7290, adult: 6732, child: 1702 },
        monthlySavings: { mainMember: 1286, adult: 1188, child: 300 },
        annualSavings: { mainMember: 15147, adult: 13992, child: 3534 },
      }),
    ],
    notes: [
      'Access to the full Discovery hospital panel with no network restriction for planned admissions.',
      'Rich chronic condition benefits and extended medication formulary.',
      'Enhanced preventive care and wellness rewards.',
    ],
  },
  {
    id: 'executive',
    label: 'Executive',
    tagline: 'Premium unlimited cover across all networks',
    hospitalNetworkCodes: ['KH', 'KC', 'KS', 'KR', 'S', 'D'],
    hospitalNetworkNames: [
      'KeyCare Hospital Network',
      'Smart Hospital Network',
      'Delta Hospital Network',
    ],
    defaultSubThemeId: 'executive_plan',
    subThemes: [
      createContributionSubTheme({
        id: 'executive_plan',
        label: 'Executive Plan',
        monthlyContribution: { mainMember: 9254, adult: 9254, child: 1769 },
        monthlySavings: { mainMember: 3084, adult: 3084, child: 589 },
        annualSavings: { mainMember: 36327, adult: 36327, child: 6939 },
      }),
    ],
    notes: [
      'No network restrictions — any private hospital in South Africa.',
      'Top-of-range chronic condition management and specialist access.',
      'International emergency cover and full preventive care suite.',
    ],
  },
  {
    id: 'smart_saver',
    label: 'Smart Saver',
    tagline: 'Smart network cover with lower monthly savings allocations',
    hospitalNetworkCodes: ['S'],
    hospitalNetworkNames: ['Smart Hospital Network'],
    defaultSubThemeId: 'classic_smart_saver',
    subThemes: [
      createContributionSubTheme({
        id: 'classic_smart_saver',
        label: 'Classic Smart Saver',
        monthlyContribution: { mainMember: 3115, adult: 2641, child: 1302 },
        monthlySavings: { mainMember: 235, adult: 199, child: 98 },
        annualSavings: { mainMember: 2820, adult: 2388, child: 1176 },
      }),
      createContributionSubTheme({
        id: 'essential_smart_saver',
        label: 'Essential Smart Saver',
        monthlyContribution: { mainMember: 2557, adult: 2185, child: 832 },
        monthlySavings: { mainMember: 193, adult: 165, child: 63 },
        annualSavings: { mainMember: 2316, adult: 1980, child: 756 },
      }),
    ],
    notes: [
      'Smart Saver options use the Smart Hospital Network for planned care.',
      'Medical savings allocations are lower than Saver plans.',
    ],
  },
  {
    id: 'smart',
    label: 'Smart',
    tagline: 'No-MSA options with Smart and Dynamic Smart networks',
    hospitalNetworkCodes: ['S', 'DS'],
    hospitalNetworkNames: ['Smart Hospital Network', 'Dynamic Smart Network'],
    defaultSubThemeId: 'classic_smart',
    subThemes: [
      createContributionSubTheme({
        id: 'classic_smart',
        label: 'Classic Smart',
        monthlyContribution: { mainMember: 3018, adult: 2381, child: 1205 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'essential_smart',
        label: 'Essential Smart',
        monthlyContribution: { mainMember: 2161, adult: 2161, child: 2161 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'essential_dynamic_smart',
        label: 'Essential Dynamic Smart',
        monthlyContribution: { mainMember: 1797, adult: 1797, child: 1797 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'active_smart',
        label: 'Active Smart',
        monthlyContribution: { mainMember: 1350, adult: 1350, child: 1350 },
        hasMedicalSavingsAccount: false,
      }),
    ],
    notes: [
      'Smart plans listed here do not include a Medical Savings Account.',
      'Network access depends on the selected Smart option.',
    ],
  },
  {
    id: 'keycare',
    label: 'KeyCare',
    tagline: 'Income-banded KeyCare options for lower contribution tiers',
    hospitalNetworkCodes: ['KH', 'KC', 'KS', 'KR'],
    hospitalNetworkNames: [
      'KeyCare Hospital Network',
      'KeyCare Casualty Hospitals',
      'KeyCare Start Network',
      'KeyCare Start Regional Network',
    ],
    defaultSubThemeId: 'keycare_plus_0_10250',
    subThemes: [
      createContributionSubTheme({
        id: 'keycare_plus_0_10250',
        label: 'KeyCare Plus (0 - 10,250)',
        monthlyContribution: { mainMember: 1961, adult: 1961, child: 713 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'keycare_plus_10251_16600',
        label: 'KeyCare Plus (10,251 - 16,600)',
        monthlyContribution: { mainMember: 2695, adult: 2695, child: 760 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'keycare_plus_16601_plus',
        label: 'KeyCare Plus (16,601+)',
        monthlyContribution: { mainMember: 3980, adult: 3980, child: 1064 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'keycare_core_0_10250',
        label: 'KeyCare Core (0 - 10,250)',
        monthlyContribution: { mainMember: 1490, adult: 1490, child: 390 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'keycare_core_10251_16600',
        label: 'KeyCare Core (10,251 - 16,600)',
        monthlyContribution: { mainMember: 1859, adult: 1859, child: 461 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'keycare_core_16601_plus',
        label: 'KeyCare Core (16,601+)',
        monthlyContribution: { mainMember: 2845, adult: 2845, child: 645 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'keycare_start_0_10950',
        label: 'KeyCare Start (0 - 10,950)',
        monthlyContribution: { mainMember: 1436, adult: 1436, child: 875 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'keycare_start_10951_16550',
        label: 'KeyCare Start (10,951 - 16,550)',
        monthlyContribution: { mainMember: 2107, adult: 2107, child: 947 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'keycare_start_16551_25150',
        label: 'KeyCare Start (16,551 - 25,150)',
        monthlyContribution: { mainMember: 3306, adult: 3306, child: 992 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'keycare_start_25151_plus',
        label: 'KeyCare Start (25,151+)',
        monthlyContribution: { mainMember: 3765, adult: 3765, child: 1024 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'keycare_start_regional_0_10950',
        label: 'KeyCare Start Regional (0 - 10,950)',
        monthlyContribution: { mainMember: 1278, adult: 1278, child: 769 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'keycare_start_regional_10951_16550',
        label: 'KeyCare Start Regional (10,951 - 16,550)',
        monthlyContribution: { mainMember: 1932, adult: 1932, child: 869 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'keycare_start_regional_16551_25150',
        label: 'KeyCare Start Regional (16,551 - 25,150)',
        monthlyContribution: { mainMember: 3011, adult: 3011, child: 922 },
        hasMedicalSavingsAccount: false,
      }),
      createContributionSubTheme({
        id: 'keycare_start_regional_25151_plus',
        label: 'KeyCare Start Regional (25,151+)',
        monthlyContribution: { mainMember: 3430, adult: 3430, child: 961 },
        hasMedicalSavingsAccount: false,
      }),
    ],
    notes: [
      'KeyCare contributions vary by income band, selected as a sub-theme option.',
      'KeyCare options listed here do not include a Medical Savings Account.',
    ],
  },
];

export const CDL_CONDITIONS = [
  { id: 'addisons', label: "Addison's Disease" },
  { id: 'asthma', label: 'Asthma' },
  { id: 'bronchiectasis', label: 'Bronchiectasis' },
  { id: 'cardiac_failure', label: 'Cardiac Failure' },
  { id: 'cardiomyopathy', label: 'Cardiomyopathy' },
  { id: 'copd', label: 'Chronic Obstructive Pulmonary Disorder (COPD)' },
  { id: 'coronary_artery', label: 'Coronary Artery Disease' },
  { id: 'crohns', label: "Crohn's Disease" },
  { id: 'diabetes_insipidus', label: 'Diabetes Insipidus' },
  { id: 'diabetes_type1', label: 'Diabetes Mellitus Type 1' },
  { id: 'diabetes_type2', label: 'Diabetes Mellitus Type 2' },
  { id: 'dysrhythmias', label: 'Dysrhythmias' },
  { id: 'epilepsy', label: 'Epilepsy' },
  { id: 'glaucoma', label: 'Glaucoma' },
  { id: 'haemophilia', label: 'Haemophilia' },
  { id: 'hiv', label: 'HIV/AIDS' },
  { id: 'hyperlipidaemia', label: 'Hyperlipidaemia' },
  { id: 'hypertension', label: 'Hypertension' },
  { id: 'hypothyroidism', label: 'Hypothyroidism' },
  { id: 'multiple_sclerosis', label: 'Multiple Sclerosis' },
  { id: 'parkinsons', label: "Parkinson's Disease" },
  { id: 'rheumatoid_arthritis', label: 'Rheumatoid Arthritis' },
  { id: 'schizophrenia', label: 'Schizophrenia' },
  { id: 'lupus', label: 'Systemic Lupus Erythematosus (SLE)' },
  { id: 'ulcerative_colitis', label: 'Ulcerative Colitis' },
];

export const CDL_CONDITION_DETAILS = {
  addisons: {
    title: "Addison's Disease",
    summary: 'A disorder in which the adrenal glands do not produce sufficient steroid hormones.',
    treatment: {
      diagnostic: [
        { code: 'ADD-101', desc: 'Cortisol and ACTH stimulation test', count: 1 },
        { code: 'ADD-102', desc: 'Endocrinologist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'ADD-201', desc: 'Routine hormone monitoring', count: 4 },
        { code: 'ADD-202', desc: 'Annual specialist review', count: 1 },
      ],
    },
    medications: ['Hydrocortisone', 'Fludrocortisone'],
    guidance: [
      'Ensure steroid replacement is not interrupted — confirm chronic medication approval.',
      'Carry a medical alert card and emergency hydrocortisone injection if prescribed.',
    ],
  },
  asthma: {
    title: 'Asthma',
    summary:
      'Authi can point members to likely benefit areas for diagnosis, medicine cover, and network treatment options.',
    treatment: {
      diagnostic: [
        { code: '1188 or 1186', desc: 'Flow volume test (spirometry)', count: 1 },
      ],
      ongoing: [
        { code: '1192', desc: 'Peak flow monitoring', count: 3 },
      ],
    },
    medications: [
      'Ventimax CFC free 200 dose 100mcg',
      'Symbicord turbohaler 60 dose 160/4.5mcg',
      'Atrovent HFA 200 dose 20mcg',
    ],
    guidance: [
      'Use approved medicine lists first to avoid unnecessary copayments.',
      'Emergency care rules can differ from planned admissions.',
    ],
  },
  bronchiectasis: {
    title: 'Bronchiectasis',
    summary: 'Permanent dilation of the bronchi caused by recurrent infections or inflammation.',
    treatment: {
      diagnostic: [
        { code: 'BRO-101', desc: 'CT chest scan', count: 1 },
        { code: 'BRO-102', desc: 'Pulmonologist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'BRO-201', desc: 'Sputum culture and sensitivity', count: 2 },
        { code: 'BRO-202', desc: 'Physiotherapy (airway clearance)', count: 12 },
      ],
    },
    medications: ['Inhaled bronchodilators', 'Prophylactic antibiotics (if prescribed)', 'Mucolytics'],
    guidance: [
      'Regular airway clearance physiotherapy is a covered benefit — confirm sessions allowed.',
      'Ensure vaccinations (flu, pneumococcal) are up to date.',
    ],
  },
  cardiac_failure: {
    title: 'Cardiac Failure',
    summary: 'The heart cannot pump enough blood to meet the body\'s demands.',
    treatment: {
      diagnostic: [
        { code: 'CF-101', desc: 'Echocardiogram', count: 1 },
        { code: 'CF-102', desc: 'Cardiologist assessment', count: 2 },
      ],
      ongoing: [
        { code: 'CF-201', desc: 'NT-proBNP blood test', count: 2 },
        { code: 'CF-202', desc: 'Routine cardiologist review', count: 2 },
      ],
    },
    medications: ['ACE inhibitors / ARBs', 'Beta-blockers', 'Diuretics', 'Aldosterone antagonists'],
    guidance: [
      'Device therapy (e.g. ICD, CRT) may require pre-authorisation.',
      'Weigh yourself daily — report sudden weight gain to your care team.',
    ],
  },
  cardiomyopathy: {
    title: 'Cardiomyopathy',
    summary: 'Disease of the heart muscle affecting the heart\'s ability to pump blood.',
    treatment: {
      diagnostic: [
        { code: 'CM-101', desc: 'Cardiac MRI or echocardiogram', count: 1 },
        { code: 'CM-102', desc: 'Genetic counselling (if hereditary)', count: 1 },
      ],
      ongoing: [
        { code: 'CM-201', desc: 'Annual echocardiogram', count: 1 },
        { code: 'CM-202', desc: 'Cardiologist review', count: 2 },
      ],
    },
    medications: ['Beta-blockers', 'ACE inhibitors', 'Anticoagulants (if indicated)'],
    guidance: [
      'Strenuous exercise restrictions may apply — discuss with your cardiologist.',
      'Family screening is recommended for hereditary forms.',
    ],
  },
  copd: {
    title: 'Chronic Obstructive Pulmonary Disorder (COPD)',
    summary: 'Progressive lung disease causing obstruction of airflow.',
    treatment: {
      diagnostic: [
        { code: 'COPD-101', desc: 'Spirometry (lung function test)', count: 1 },
        { code: 'COPD-102', desc: 'Chest X-ray', count: 1 },
      ],
      ongoing: [
        { code: 'COPD-201', desc: 'Annual spirometry review', count: 1 },
        { code: 'COPD-202', desc: 'Pulmonologist or GP review', count: 2 },
      ],
    },
    medications: ['Long-acting bronchodilators (LABA/LAMA)', 'Inhaled corticosteroids', 'Rescue inhalers'],
    guidance: [
      'Smoking cessation support is covered — ask your provider about the programme.',
      'Pulmonary rehabilitation is a recognised benefit — check your plan allowance.',
    ],
  },
  coronary_artery: {
    title: 'Coronary Artery Disease',
    summary: 'Narrowing of the coronary arteries due to plaque build-up.',
    treatment: {
      diagnostic: [
        { code: 'CAD-101', desc: 'Coronary angiogram', count: 1 },
        { code: 'CAD-102', desc: 'Stress ECG', count: 1 },
      ],
      ongoing: [
        { code: 'CAD-201', desc: 'Lipid profile monitoring', count: 2 },
        { code: 'CAD-202', desc: 'Cardiologist review', count: 2 },
      ],
    },
    medications: ['Statins', 'Aspirin / antiplatelet agents', 'Beta-blockers', 'Nitrates'],
    guidance: [
      'Percutaneous coronary intervention (PCI/stenting) requires pre-authorisation.',
      'Cardiac rehabilitation post-procedure is a covered benefit.',
    ],
  },
  crohns: {
    title: "Crohn's Disease",
    summary: 'Chronic inflammatory bowel disease affecting any part of the GI tract.',
    treatment: {
      diagnostic: [
        { code: 'CD-101', desc: 'Colonoscopy with biopsy', count: 1 },
        { code: 'CD-102', desc: 'Gastroenterologist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'CD-201', desc: 'CRP / faecal calprotectin', count: 2 },
        { code: 'CD-202', desc: 'Annual endoscopic review', count: 1 },
      ],
    },
    medications: ['5-ASA agents', 'Corticosteroids (for flares)', 'Immunomodulators', 'Biologics (if indicated)'],
    guidance: [
      'Biologic therapy requires pre-authorisation and motivating letter from specialist.',
      'Nutritional support may be a covered benefit during active disease.',
    ],
  },
  diabetes_insipidus: {
    title: 'Diabetes Insipidus',
    summary: 'A condition causing extreme thirst and excretion of large amounts of dilute urine.',
    treatment: {
      diagnostic: [
        { code: 'DI-101', desc: 'Water deprivation test', count: 1 },
        { code: 'DI-102', desc: 'Endocrinologist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'DI-201', desc: 'Serum sodium and osmolality monitoring', count: 4 },
        { code: 'DI-202', desc: 'MRI brain (if central DI)', count: 1 },
      ],
    },
    medications: ['Desmopressin (DDAVP)'],
    guidance: [
      'Ensure chronic medication approval for desmopressin is in place.',
      'Carry medical alert identification specifying the condition.',
    ],
  },
  diabetes_type1: {
    title: 'Diabetes Mellitus Type 1',
    summary: 'Autoimmune destruction of pancreatic beta cells requiring lifelong insulin therapy.',
    treatment: {
      diagnostic: [
        { code: 'DM1-101', desc: 'HbA1c test', count: 2 },
        { code: 'DM1-102', desc: 'Endocrinologist or GP assessment', count: 2 },
      ],
      ongoing: [
        { code: 'DM1-201', desc: 'GP or specialist review', count: 4 },
        { code: 'DM1-202', desc: 'Annual eye, foot, and kidney screen', count: 1 },
      ],
    },
    medications: ['Basal insulin', 'Rapid-acting insulin', 'Continuous glucose monitoring supplies'],
    guidance: [
      'CGM devices and insulin pump therapy may require pre-authorisation.',
      'Confirm chronic medicine approval before collecting insulin scripts.',
    ],
  },
  diabetes_type2: {
    title: 'Diabetes Mellitus Type 2',
    summary: 'Insulin resistance and relative insulin deficiency managed with lifestyle and medication.',
    treatment: {
      diagnostic: [
        { code: 'DM2-101', desc: 'HbA1c test', count: 2 },
        { code: 'DM2-102', desc: 'GP or specialist assessment', count: 2 },
      ],
      ongoing: [
        { code: 'DM2-201', desc: 'GP consultation', count: 4 },
        { code: 'DM2-202', desc: 'Follow-up pathology monitoring', count: 2 },
      ],
    },
    medications: ['Metformin', 'Insulin analogues', 'Glucose monitoring supplies'],
    guidance: [
      'Check whether your plan requires a network hospital for planned admissions.',
      'Confirm chronic medicine approval before collecting recurring scripts.',
    ],
  },
  dysrhythmias: {
    title: 'Dysrhythmias',
    summary: 'Irregular heart rhythms that may require ongoing monitoring and medication.',
    treatment: {
      diagnostic: [
        { code: 'DYS-101', desc: '24-hour Holter monitor', count: 1 },
        { code: 'DYS-102', desc: 'Cardiologist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'DYS-201', desc: 'ECG monitoring', count: 2 },
        { code: 'DYS-202', desc: 'Annual cardiologist review', count: 1 },
      ],
    },
    medications: ['Antiarrhythmic agents', 'Anticoagulants (if AF)', 'Beta-blockers'],
    guidance: [
      'Ablation procedures and device implants (pacemaker, ICD) require pre-authorisation.',
      'Report any palpitations, dizziness, or syncope to your cardiologist promptly.',
    ],
  },
  epilepsy: {
    title: 'Epilepsy',
    summary: 'A neurological disorder characterised by recurrent unprovoked seizures.',
    treatment: {
      diagnostic: [
        { code: 'EPI-101', desc: 'EEG (electroencephalogram)', count: 1 },
        { code: 'EPI-102', desc: 'Neurologist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'EPI-201', desc: 'Drug level monitoring (if applicable)', count: 2 },
        { code: 'EPI-202', desc: 'Annual neurologist review', count: 1 },
      ],
    },
    medications: ['Sodium valproate', 'Lamotrigine', 'Levetiracetam', 'Carbamazepine'],
    guidance: [
      'Chronic medicine approval must be in place before collecting anticonvulsant scripts.',
      'Discuss driving restrictions with your neurologist and insurer.',
    ],
  },
  glaucoma: {
    title: 'Glaucoma',
    summary: 'Optic nerve damage typically caused by elevated intraocular pressure.',
    treatment: {
      diagnostic: [
        { code: 'GLA-101', desc: 'Intraocular pressure measurement', count: 2 },
        { code: 'GLA-102', desc: 'Ophthalmologist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'GLA-201', desc: 'Visual field testing', count: 2 },
        { code: 'GLA-202', desc: 'Annual optic disc review', count: 1 },
      ],
    },
    medications: ['Prostaglandin analogues (eye drops)', 'Beta-blocker eye drops', 'Carbonic anhydrase inhibitors'],
    guidance: [
      'Laser or surgical treatment requires pre-authorisation.',
      'Do not stop eye drops without consulting your ophthalmologist.',
    ],
  },
  haemophilia: {
    title: 'Haemophilia',
    summary: 'Inherited bleeding disorder due to deficiency in clotting factors.',
    treatment: {
      diagnostic: [
        { code: 'HAE-101', desc: 'Clotting factor assay', count: 1 },
        { code: 'HAE-102', desc: 'Haematologist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'HAE-201', desc: 'Inhibitor titre testing', count: 1 },
        { code: 'HAE-202', desc: 'Annual haematologist review', count: 1 },
      ],
    },
    medications: ['Factor VIII / IX concentrate', 'Emicizumab (if indicated)', 'Desmopressin'],
    guidance: [
      'Clotting factor products require chronic medication approval.',
      'Always inform medical staff of your condition before any procedures.',
    ],
  },
  hiv: {
    title: 'HIV/AIDS',
    summary: 'Viral infection managed with antiretroviral therapy (ART) to suppress viral load.',
    treatment: {
      diagnostic: [
        { code: 'HIV-101', desc: 'CD4 count and viral load', count: 2 },
        { code: 'HIV-102', desc: 'Infectious disease specialist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'HIV-201', desc: 'Six-monthly viral load monitoring', count: 2 },
        { code: 'HIV-202', desc: 'Annual specialist review', count: 1 },
      ],
    },
    medications: ['Tenofovir / Emtricitabine / Efavirenz (single-pill regimen)', 'Dolutegravir-based regimen'],
    guidance: [
      'Antiretroviral therapy is a PMB benefit — confirm chronic approval.',
      'Opportunistic infection prophylaxis may be covered when CD4 is low.',
    ],
  },
  hyperlipidaemia: {
    title: 'Hyperlipidaemia',
    summary: 'Elevated blood lipids (cholesterol/triglycerides) increasing cardiovascular risk.',
    treatment: {
      diagnostic: [
        { code: 'HLP-101', desc: 'Full lipid profile', count: 2 },
        { code: 'HLP-102', desc: 'GP or cardiologist assessment', count: 2 },
      ],
      ongoing: [
        { code: 'HLP-201', desc: 'Annual lipid profile', count: 1 },
        { code: 'HLP-202', desc: 'GP review', count: 2 },
      ],
    },
    medications: ['Statins', 'Ezetimibe', 'PCSK9 inhibitors (if high-risk, pre-auth required)'],
    guidance: [
      'PCSK9 inhibitors require motivating letter and pre-authorisation from a specialist.',
      'Dietary and lifestyle changes are the first line — wellness benefits may support this.',
    ],
  },
  hypertension: {
    title: 'Hypertension',
    summary: 'Persistently elevated blood pressure that increases risk of cardiovascular events.',
    treatment: {
      diagnostic: [
        { code: 'HTN-101', desc: '24-hour ambulatory BP monitoring', count: 1 },
        { code: 'HTN-102', desc: 'GP or specialist assessment', count: 2 },
      ],
      ongoing: [
        { code: 'HTN-201', desc: 'Routine BP check and GP review', count: 4 },
        { code: 'HTN-202', desc: 'Renal function and electrolytes', count: 2 },
      ],
    },
    medications: ['ACE inhibitors / ARBs', 'Calcium channel blockers', 'Thiazide diuretics'],
    guidance: [
      'Home blood pressure monitoring devices are covered on select plans — confirm with your scheme.',
      'Do not stop antihypertensive medication without medical guidance.',
    ],
  },
  hypothyroidism: {
    title: 'Hypothyroidism',
    summary: 'Underactive thyroid gland resulting in reduced hormone production.',
    treatment: {
      diagnostic: [
        { code: 'HYP-101', desc: 'TSH and free T4 test', count: 2 },
        { code: 'HYP-102', desc: 'GP or endocrinologist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'HYP-201', desc: 'Six-monthly TSH monitoring', count: 2 },
        { code: 'HYP-202', desc: 'Annual specialist review', count: 1 },
      ],
    },
    medications: ['Levothyroxine (L-thyroxine)'],
    guidance: [
      'Levothyroxine dosage adjustments are common — maintain regular monitoring.',
      'Take levothyroxine on an empty stomach for consistent absorption.',
    ],
  },
  multiple_sclerosis: {
    title: 'Multiple Sclerosis',
    summary: 'Autoimmune demyelinating disease of the central nervous system.',
    treatment: {
      diagnostic: [
        { code: 'MS-101', desc: 'MRI brain and spine with contrast', count: 1 },
        { code: 'MS-102', desc: 'Neurologist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'MS-201', desc: 'Annual MRI surveillance', count: 1 },
        { code: 'MS-202', desc: 'Neurologist review', count: 2 },
      ],
    },
    medications: ['Interferon beta', 'Glatiramer acetate', 'Natalizumab / Ocrelizumab (high-efficacy DMTs)'],
    guidance: [
      'Disease-modifying therapies (DMTs) require pre-authorisation and specialist motivation.',
      'Physiotherapy and occupational therapy are covered benefits — confirm your plan allowance.',
    ],
  },
  parkinsons: {
    title: "Parkinson's Disease",
    summary: 'Neurodegenerative disorder affecting movement, balance, and coordination.',
    treatment: {
      diagnostic: [
        { code: 'PD-101', desc: 'Neurologist clinical assessment', count: 2 },
        { code: 'PD-102', desc: 'DaTscan (if required)', count: 1 },
      ],
      ongoing: [
        { code: 'PD-201', desc: 'Regular neurologist review', count: 2 },
        { code: 'PD-202', desc: 'Occupational and speech therapy', count: 6 },
      ],
    },
    medications: ['Levodopa / Carbidopa', 'Dopamine agonists', 'MAO-B inhibitors'],
    guidance: [
      'Deep brain stimulation (DBS) requires pre-authorisation.',
      'Allied health therapy (physio, OT, speech) is a covered benefit — check annual limits.',
    ],
  },
  rheumatoid_arthritis: {
    title: 'Rheumatoid Arthritis',
    summary: 'Autoimmune inflammatory arthritis causing joint damage and systemic effects.',
    treatment: {
      diagnostic: [
        { code: 'RA-101', desc: 'Rheumatoid factor and anti-CCP antibodies', count: 1 },
        { code: 'RA-102', desc: 'Rheumatologist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'RA-201', desc: 'CRP / ESR monitoring', count: 4 },
        { code: 'RA-202', desc: 'Annual rheumatologist review', count: 1 },
      ],
    },
    medications: ['Methotrexate', 'Hydroxychloroquine', 'Biological DMARDs (biologic therapy)'],
    guidance: [
      'Biologic therapies require pre-authorisation and specialist motivating letter.',
      'Regular liver function tests are needed while on methotrexate.',
    ],
  },
  schizophrenia: {
    title: 'Schizophrenia',
    summary: 'Chronic psychiatric disorder affecting thought, perception, and behaviour.',
    treatment: {
      diagnostic: [
        { code: 'SCH-101', desc: 'Psychiatric assessment and history', count: 2 },
        { code: 'SCH-102', desc: 'Baseline metabolic screen', count: 1 },
      ],
      ongoing: [
        { code: 'SCH-201', desc: 'Regular psychiatrist review', count: 4 },
        { code: 'SCH-202', desc: 'Annual metabolic and ECG monitoring', count: 1 },
      ],
    },
    medications: ['Atypical antipsychotics (e.g. risperidone, olanzapine)', 'Long-acting injectable antipsychotics'],
    guidance: [
      'Confirm chronic medication approval is in place for antipsychotic scripts.',
      'Social worker and community mental health support may be available — ask your scheme.',
    ],
  },
  lupus: {
    title: 'Systemic Lupus Erythematosus (SLE)',
    summary: 'Systemic autoimmune disease that can affect multiple organ systems.',
    treatment: {
      diagnostic: [
        { code: 'SLE-101', desc: 'ANA and anti-dsDNA antibody panel', count: 1 },
        { code: 'SLE-102', desc: 'Rheumatologist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'SLE-201', desc: 'Renal function and urine dipstick', count: 4 },
        { code: 'SLE-202', desc: 'Rheumatologist review', count: 2 },
      ],
    },
    medications: ['Hydroxychloroquine', 'Corticosteroids', 'Immunosuppressants (azathioprine, mycophenolate)', 'Biologics (belimumab)'],
    guidance: [
      'Biologic therapy requires pre-authorisation from a rheumatologist.',
      'High-factor sunscreen is strongly recommended — check benefit for prescription sun protection.',
    ],
  },
  ulcerative_colitis: {
    title: 'Ulcerative Colitis',
    summary: 'Chronic inflammatory bowel disease limited to the colon and rectum.',
    treatment: {
      diagnostic: [
        { code: 'UC-101', desc: 'Colonoscopy with biopsy', count: 1 },
        { code: 'UC-102', desc: 'Gastroenterologist consultation', count: 2 },
      ],
      ongoing: [
        { code: 'UC-201', desc: 'CRP / faecal calprotectin', count: 2 },
        { code: 'UC-202', desc: 'Annual endoscopic review', count: 1 },
      ],
    },
    medications: ['5-ASA (mesalazine)', 'Corticosteroids (for flares)', 'Immunomodulators', 'Biologics (if indicated)'],
    guidance: [
      'Biologic therapy requires pre-authorisation and specialist motivating letter.',
      'Annual colonoscopy is recommended for cancer surveillance after 8–10 years of disease.',
    ],
  },
};

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
