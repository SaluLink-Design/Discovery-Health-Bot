/** Plan-aware CDA (Chronic Drug Amount) display for formulary medicines. */

const EXEC_COMP_PLANS = new Set(['executive', 'comprehensive']);

/** Plans that use the Core/Saver CDA column from the formulary PDF. */
export const usesCoreCdaColumn = (planThemeId) =>
  planThemeId && !EXEC_COMP_PLANS.has(planThemeId);

/**
 * Return the CDA amount (ZAR) relevant to the member's plan theme.
 * @param {string|null} planThemeId - e.g. core, saver, executive
 * @param {{ cdaCore?: number, cdaExec?: number }} medOrGroup
 */
export const getCdaAmount = (planThemeId, medOrGroup) => {
  const core = medOrGroup?.cdaCore;
  const exec = medOrGroup?.cdaExec;
  if (core == null && exec == null) return null;
  if (!planThemeId) return core ?? exec ?? null;
  if (EXEC_COMP_PLANS.has(planThemeId)) return exec ?? core ?? null;
  return core ?? exec ?? null;
};

/** Example co-pay for literacy (pharmacy price − CDA). */
export const getCdaCopayExample = (planThemeId, medOrGroup, markup = 80) => {
  const cda = getCdaAmount(planThemeId, medOrGroup);
  if (cda == null) return null;
  const examplePrice = cda + markup;
  return { cda, examplePrice, outOfPocket: examplePrice - cda };
};

/** Plain-language CDA line for ingredient detail. */
export const formatCdaLine = (planThemeId, medOrGroup, planLabel = 'your plan') => {
  const amount = getCdaAmount(planThemeId, medOrGroup);
  if (amount == null) return null;

  if (EXEC_COMP_PLANS.has(planThemeId)) {
    return `Discovery pays up to R${amount} for unlisted alternatives on ${planLabel} (Executive/Comprehensive CDA).`;
  }

  return `Discovery pays up to R${amount} for this ingredient on ${planLabel} (CDA cap for unlisted brands).`;
};

/** Short label for ingredient list cards. */
export const formatCdaBadge = (planThemeId, medOrGroup) => {
  const amount = getCdaAmount(planThemeId, medOrGroup);
  if (amount == null) return null;
  return `CDA R${amount}`;
};

/** Addison's disease — listed brand vs ingredient-cap payment rules. */
const getAddisonsPaymentRule = (label = '') => {
  const text = label.toLowerCase().replace(/\s+/g, ' ');

  if (text.includes('covocort')) {
    return { kind: 'listed_brand', brand: 'Covocort 10mg', ingredient: 'Hydrocortisone', cap: 250 };
  }
  if (text.includes('florinef acetate')) {
    return { kind: 'listed_brand', brand: 'Florinef acetate 0.1mg', ingredient: 'Fludrocortisone', cap: 170 };
  }
  if (text.includes('hydrocortisone')) {
    return { kind: 'ingredient_cap', ingredient: 'Hydrocortisone', cap: 250 };
  }
  if (text.includes('fludrocortisone') || text.includes('mineralocorticoid')) {
    return { kind: 'ingredient_cap', ingredient: 'Mineralocorticoid', cap: 170 };
  }
  return null;
};

export const getMedicinePaymentRule = (conditionId, label) => {
  if (conditionId !== 'addisons') return null;
  return getAddisonsPaymentRule(label);
};
