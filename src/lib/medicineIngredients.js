/**
 * Group formulary medicines by active ingredient — ingredient-first browse.
 */

import {
  classifyMedicine,
  isCoveredByPlan,
  normalizeLabel,
} from './medicineClassifier';

const HAS_STRENGTH_RE = /\d+\s*(mg|mcg|g|ml|iu|units|dose)\b|\d+\s*\/\s*\d+/i;

const slugify = (value) =>
  normalizeLabel(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '') || 'other';

/** True when the PDF label looks like a brand/strength row (not a class heading). */
export const isBrandMedicine = (label = '') => HAS_STRENGTH_RE.test(label);

/** Fallback ingredient extraction from raw classHint text. */
export const extractIngredientFromClassHint = (classHint = '') => {
  if (!classHint) return '';
  const cleaned = classHint.trim().replace(/:$/, '');
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && parts[parts.length - 1].toLowerCase() === parts[parts.length - 2].toLowerCase()) {
    return normalizeLabel(parts[parts.length - 1]);
  }
  if (/ and /i.test(cleaned) && !HAS_STRENGTH_RE.test(cleaned)) {
    return normalizeLabel(cleaned);
  }
  if (parts.length <= 4 && !HAS_STRENGTH_RE.test(cleaned)) {
    return normalizeLabel(cleaned);
  }
  return normalizeLabel(parts[parts.length - 1]?.replace(/,$/, '') ?? '');
};

export const getIngredientLabel = (med) =>
  normalizeLabel(med.ingredientHint || extractIngredientFromClassHint(med.classHint) || 'Other medicines');

export const getClassDisplayName = (classHint = '') => {
  if (!classHint) return 'Other medicines';
  return classifyMedicine(classHint, '').name;
};

const createIngredientGroup = (label, seedMed, planId) => {
  const className = getClassDisplayName(seedMed?.classHint);
  return {
    id: slugify(label),
    label,
    className,
    classHint: seedMed?.classHint ?? '',
    brands: [],
    coveredCount: 0,
    cdaCore: seedMed?.cdaCore ?? null,
    cdaExec: seedMed?.cdaExec ?? null,
    planId,
  };
};

/**
 * Group flat API medicines into ingredient buckets with brand lists.
 * @param {Array} medicines - from /api/medications
 * @param {string|null} planId - plan theme id
 */
export const groupMedicinesByIngredient = (medicines = [], planId = null) => {
  const groups = new Map();

  for (const med of medicines) {
    const ingredientLabel = getIngredientLabel(med);
    if (!groups.has(ingredientLabel)) {
      groups.set(ingredientLabel, createIngredientGroup(ingredientLabel, med, planId));
    }

    const group = groups.get(ingredientLabel);
    const covered = isCoveredByPlan(med, planId);

    if (isBrandMedicine(med.label)) {
      group.brands.push({ ...med, covered });
      if (covered) group.coveredCount += 1;
    }

    if (med.cdaCore != null) group.cdaCore = med.cdaCore;
    if (med.cdaExec != null) group.cdaExec = med.cdaExec;
  }

  return [...groups.values()]
    .filter((g) => g.brands.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label));
};

/** Search across ingredient name, class, and brand labels. */
export const filterIngredientGroups = (groups, query = '') => {
  const q = query.trim().toLowerCase();
  if (!q) return groups;

  return groups
    .map((group) => {
      const ingredientMatch =
        group.label.toLowerCase().includes(q) ||
        group.className.toLowerCase().includes(q) ||
        group.classHint.toLowerCase().includes(q);

      const matchingBrands = group.brands.filter((b) =>
        normalizeLabel(b.label).toLowerCase().includes(q)
      );

      if (ingredientMatch) return group;
      if (matchingBrands.length) return { ...group, brands: matchingBrands };
      return null;
    })
    .filter(Boolean);
};
