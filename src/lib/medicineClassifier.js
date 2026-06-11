/**
 * Maps raw classHint strings (from the PDF parser) to clean pharmacological class names,
 * and provides plan-coverage helpers for the medication class layout.
 */

const CLASS_RULES = [
  // ── Respiratory ─────────────────────────────────────────────────────────────
  {
    id: 'saba',
    name: 'Short-acting bronchodilators (SABA)',
    matchHint: /short.*acting|salbutamol|albuterol/i,
  },
  {
    id: 'laba',
    name: 'Long-acting bronchodilators (LABA)',
    matchHint: /long.*acting|adrenerg.*formot/i,
    excludeLabel: /\d+\/\d+/,
  },
  {
    id: 'ics_laba',
    name: 'ICS/LABA combinations',
    matchHint:
      /formoterol.*beclomethasone|beclomethasone.*formoterol|salmeterol.*fluticasone|vilanterol.*fluticasone/i,
  },
  {
    id: 'ics_laba_bud',
    name: 'ICS/LABA combinations',
    matchHint: /^budesonide$/i,
    requireLabel: /\d+\/\d+/,
  },
  {
    id: 'ics_laba_mom',
    name: 'ICS/LABA combinations',
    matchHint: /^mometasone$/i,
    requireLabel: /\d+\/\d+/,
  },
  {
    id: 'triple',
    name: 'Triple combination inhalers',
    matchHint: /glycopyrronium|indacaterol/i,
  },
  {
    id: 'anticholinergic',
    name: 'Inhaled anticholinergics',
    matchHint: /anticholinerg|ipratropium|tiotropium/i,
  },
  {
    id: 'ics',
    name: 'Inhaled corticosteroids (ICS)',
    matchHint: /glucocorticoid/i,
  },
  {
    id: 'systemic_cs',
    name: 'Systemic corticosteroids',
    matchHint: /systemic.*corticosteroid|prednison/i,
  },
  {
    id: 'ltra',
    name: 'Leukotriene receptor antagonists',
    matchHint: /leukotriene|anti.asthmatic|montelukast/i,
  },
  {
    id: 'nasal_cs',
    name: 'Nasal corticosteroids',
    matchHint: /nasal/i,
  },
  // ── Hypertension / Cardiac ────────────────────────────────────────────────
  {
    id: 'ace_ccb',
    name: 'ACE inhibitors + calcium channel blockers',
    matchHint: /ace inhibitor.*calcium|calcium.*ace inhibitor/i,
  },
  {
    id: 'ace_diuretic',
    name: 'ACE inhibitors + diuretics',
    matchHint: /ace inhibitor.*diuretic|diuretic.*ace inhibitor/i,
  },
  {
    id: 'ace_combo',
    name: 'ACE inhibitor combinations',
    matchHint: /ace inhibitor.*other|other.*combination/i,
  },
  {
    id: 'ace',
    name: 'ACE inhibitors',
    matchHint: /ace inhibitor/i,
  },
  {
    id: 'arb_ccb',
    name: 'ARB + calcium channel blockers',
    matchHint: /sartan.*amlodipine|amlodipine.*sartan/i,
  },
  {
    id: 'arb',
    name: 'Angiotensin receptor blockers (ARB)',
    matchHint: /angiotensin receptor|sartan|arb\b/i,
  },
  {
    id: 'ccb',
    name: 'Calcium channel blockers',
    matchHint: /calcium.*channel/i,
  },
  {
    id: 'diuretic',
    name: 'Diuretics',
    matchHint: /diuretic/i,
  },
  {
    id: 'bb',
    name: 'Beta-blockers',
    matchHint: /beta.?blocker|bisoprolol|atenolol|metoprolol|carvedilol|nebivolol/i,
  },
  {
    id: 'aldosterone',
    name: 'Aldosterone antagonists',
    matchHint: /aldosterone|spironolactone/i,
  },
  {
    id: 'statin',
    name: 'Statins (cholesterol-lowering)',
    matchHint: /statin/i,
  },
  // ── Diabetes ─────────────────────────────────────────────────────────────
  {
    id: 'biguanide',
    name: 'Biguanides (Metformin)',
    matchHint: /metformin|biguanide/i,
  },
  {
    id: 'sulphonyl',
    name: 'Sulphonylureas',
    matchHint: /sulphonyl|glipiz|glimep|gliclaz/i,
  },
  {
    id: 'insulin_rapid',
    name: 'Rapid-acting insulin analogues',
    matchHint: /insulin.*rapid|aspart|lispro|glulisine/i,
  },
  {
    id: 'insulin_long',
    name: 'Long-acting insulin analogues',
    matchHint: /insulin.*long|glarg|detemir|degludec/i,
  },
  {
    id: 'insulin_short',
    name: 'Short/intermediate insulin',
    matchHint: /insulin.*short|isophane|neutral.*insulin|actrapid/i,
  },
  {
    id: 'insulin_mixed',
    name: 'Mixed insulin preparations',
    matchHint: /mixtard|novomix|biphasic/i,
  },
  // ── Thyroid ───────────────────────────────────────────────────────────────
  {
    id: 'thyroid',
    name: 'Thyroid hormones',
    matchHint: /levothyroxine|thyroid/i,
  },
  // ── Epilepsy ─────────────────────────────────────────────────────────────
  {
    id: 'antiepil',
    name: 'Antiepileptics',
    matchHint:
      /antiepileptic|anti-epileptic|carbamazepine|valproate|lamotrigine|phenytoin|levetiracetam/i,
  },
  // ── Cholesterol ───────────────────────────────────────────────────────────
  {
    id: 'lipid',
    name: 'Lipid-lowering medicines',
    matchHint: /fibrate|ezetimibe|lipid|cholesterol/i,
  },
];

/**
 * Returns the pharmacological class for a medicine item (from classHint + label).
 */
export const classifyMedicine = (classHint = '', label = '') => {
  for (const rule of CLASS_RULES) {
    if (!rule.matchHint.test(classHint)) continue;
    if (rule.excludeLabel && rule.excludeLabel.test(label)) continue;
    if (rule.requireLabel && !rule.requireLabel.test(label)) continue;
    return { id: rule.id, name: rule.name };
  }
  return { id: 'other', name: 'Other medicines' };
};

/**
 * Returns true when the medicine is covered by the given plan.
 */
export const isCoveredByPlan = (med, planId) => {
  if (!planId) return true;
  if (med.notCoveredKeycare && ['core', 'keycare'].includes(planId)) return false;
  if (med.execCompOnly && !['executive', 'comprehensive'].includes(planId)) return false;
  return true;
};

/**
 * Returns a short label + colour key describing the coverage status.
 */
export const coverageBadge = (med, planId) => {
  if (!planId) return { covered: true, label: 'Formulary medicine', colour: 'emerald' };
  if (med.notCoveredKeycare && ['core', 'keycare'].includes(planId))
    return { covered: false, label: 'Not covered on Core / KeyCare plan', colour: 'amber' };
  if (med.execCompOnly && !['executive', 'comprehensive'].includes(planId))
    return { covered: false, label: 'Executive & Comprehensive plans only', colour: 'orange' };
  return { covered: true, label: 'Covered on your plan', colour: 'emerald' };
};

/**
 * Groups a flat medicine list into class buckets.
 * Returns an array of class objects sorted by total medicine count descending.
 */
export const groupMedicinesByClass = (medicines, planId) => {
  const map = new Map();
  for (const med of medicines) {
    const cls = classifyMedicine(med.classHint, med.label);
    const covered = isCoveredByPlan(med, planId);
    if (!map.has(cls.id)) {
      map.set(cls.id, { id: cls.id, name: cls.name, medicines: [], coveredCount: 0 });
    }
    const group = map.get(cls.id);
    group.medicines.push({ ...med, covered });
    if (covered) group.coveredCount++;
  }
  return [...map.values()].sort((a, b) => b.medicines.length - a.medicines.length);
};

/** Collapse multiple internal spaces (PDF alignment artefact). */
export const normalizeLabel = (s = '') => s.replace(/\s+/g, ' ').trim();
