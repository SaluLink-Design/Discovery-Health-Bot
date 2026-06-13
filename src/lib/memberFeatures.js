/** Shared member-facing feature definitions — plain language for campaign mode. */

export const MEMBER_FEATURES = [
  {
    view: 'hospitals',
    navLabel: 'Hospitals',
    title: 'Find a hospital',
    description: 'See which hospitals match your plan in your area.',
    checklistAction: 'Find hospitals on my plan',
    checklistDetail: 'See which hospitals are covered on your plan networks in your area.',
    accent: 'from-cyan-500/10 to-cyan-400/5',
    border: 'border-cyan-400/20',
    badge: 'bg-cyan-400/15 text-cyan-300',
  },
  {
    view: 'treatment',
    navLabel: 'Care covered',
    title: 'What care am I covered for?',
    description: 'See tests and follow-up care Discovery covers for your chronic conditions.',
    checklistAction: 'See your chronic care entitlements',
    checklistDetail: 'Diagnostic tests and ongoing management for conditions on your profile.',
    requiresConditions: true,
    accent: 'from-violet-500/10 to-violet-400/5',
    border: 'border-violet-400/20',
    badge: 'bg-violet-400/15 text-violet-300',
  },
  {
    view: 'medication',
    navLabel: 'Medicines',
    title: 'Is my medicine covered?',
    description: 'Search medicines for your conditions and see how they are covered on your plan.',
    checklistAction: 'Check medicine cover',
    checklistDetail: 'Browse by condition or search by name.',
    requiresConditions: true,
    accent: 'from-teal-500/10 to-teal-400/5',
    border: 'border-teal-400/20',
    badge: 'bg-teal-400/15 text-teal-300',
  },
  {
    view: 'plan',
    navLabel: 'What I pay',
    title: 'What do I pay?',
    description: 'Your monthly contribution, day-to-day savings account, and household costs.',
    checklistAction: 'View your contribution breakdown',
    checklistDetail: 'Contribution, MSA, and per-person rates for your household.',
    accent: 'from-emerald-500/10 to-emerald-400/5',
    border: 'border-emerald-400/20',
    badge: 'bg-emerald-400/15 text-emerald-300',
  },
];

const CHECKLIST_ORDER = ['treatment', 'medication', 'hospitals', 'plan'];

/** @deprecated Kept for analytics labels — always member path. */
export const inferScenario = () => 'member';

/** Ordered checklist with "start here" and disabled states. */
export const getMemberChecklist = (profile) => {
  const hasConditions = (profile?.conditions ?? []).length > 0;

  return CHECKLIST_ORDER.map((view) => {
    const feature = MEMBER_FEATURES.find((f) => f.view === view);
    if (!feature) return null;
    const disabled = feature.requiresConditions && !hasConditions;
    const startHere = feature.view === 'treatment' && hasConditions;
    return { ...feature, disabled, startHere, scenario: 'member' };
  }).filter(Boolean);
};

/** Primary next action for Home hero CTA. */
export const getPrimaryHomeAction = (profile) => {
  const hasConditions = (profile?.conditions ?? []).length > 0;
  const checklist = getMemberChecklist(profile);
  const startItem = checklist.find((item) => item.startHere && !item.disabled);

  if (!hasConditions) {
    return {
      type: 'edit_profile',
      label: 'Add your chronic conditions',
      detail: 'Unlock care and medicine cover for your profile.',
    };
  }

  if (startItem) {
    return {
      type: 'navigate',
      view: startItem.view,
      label: 'See what care I\'m covered for',
      detail: startItem.checklistDetail,
    };
  }

  const fallback = checklist.find((item) => !item.disabled) ?? checklist[0];
  return {
    type: 'navigate',
    view: fallback?.view ?? 'hospitals',
    label: fallback?.checklistAction ?? 'Explore your cover',
    detail: fallback?.checklistDetail ?? '',
  };
};

export const getMemberFeature = (view) =>
  MEMBER_FEATURES.find((feature) => feature.view === view);
