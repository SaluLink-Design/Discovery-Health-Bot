import { CDL_CONDITION_DETAILS } from '../data/authiData';

const STORAGE_KEY = 'authi_prescriptions_v4';

/**
 * Prescription store shape:
 * {
 *   [conditionId]: {
 *     treatments: string[],          // procedure codes e.g. "AST-101"
 *     usedCounts: { [code]: number } // how many times each treatment was used
 *     medications: string[],         // medicine labels e.g. "Ventimax CFC free 200 dose 100mcg"
 *   }
 * }
 */

export const loadPrescriptions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const savePrescriptions = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable — silently ignore
  }
};

export const clearPrescriptions = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable — silently ignore
  }
};

/** Composite key so diagnostic vs ongoing rows with the same tariff code stay distinct. */
export const treatmentKey = (type, code) => `${type}:${code}`;

export const isPrescribedTreatment = (prescriptions, conditionId, code) =>
  (prescriptions?.[conditionId]?.treatments ?? []).includes(code);

/** True when this specific basket row (diagnostic or ongoing) is marked as received. */
export const isTreatmentReceived = (prescriptions, conditionId, type, code) => {
  const stored = prescriptions?.[conditionId]?.treatments ?? [];
  const key = treatmentKey(type, code);
  if (stored.includes(key)) return true;
  // Legacy plain-code entries (v2): match by code only
  const norm = (s) => s.replace(/\s+/g, '').toLowerCase();
  const b = norm(code);
  return stored.some((sc) => {
    if (sc.includes(':')) return false;
    const a = norm(sc);
    return a === b || b.includes(a) || a.includes(b);
  });
};

/** All active medications across profile conditions. */
export const getActiveMedicationsByCondition = (prescriptions, conditionIds) =>
  (conditionIds ?? [])
    .map((id) => ({
      conditionId: id,
      medications: prescriptions?.[id]?.medications ?? [],
    }))
    .filter((row) => row.medications.length > 0);

export const isPrescribedMedication = (prescriptions, conditionId, name) => {
  const stored = prescriptions?.[conditionId]?.medications ?? [];
  const norm = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();
  return stored.some((n) => norm(n) === norm(name));
};

export const getUsedCount = (prescriptions, conditionId, code) =>
  prescriptions?.[conditionId]?.usedCounts?.[code] ?? null;

/**
 * Condition-specific demo seeds using real tariff codes from the CDL treatment basket PDFs.
 * Each entry represents realistic placeholder data: treatments the patient has received,
 * with usage counts where applicable, plus a real prescribed medication from the formulary.
 */
const CONDITION_DEMO_SEEDS = {
  asthma: {
    treatments: ['diagnostic:1188 or 1186', 'ongoing:1192'],
    usedCounts: { '1192': 3 },
    medications: ['Lumont                                              4mg; 5mg; 10mg'],
  },
  hypertension: {
    treatments: ['diagnostic:1232 or 1233'],
    usedCounts: {},
    medications: ['Amlessa                  4/5mg; 4/10mg; 8/5mg; 8/10mg'],
  },
  diabetes_type2: {
    treatments: ['diagnostic:4064'],
    usedCounts: {},
    medications: ['Accord Metformin                              500mg; 850mg; 1000mg'],
  },
  hypothyroidism: {
    treatments: [],
    usedCounts: {},
    medications: ['Euthyrox                 25mcg; 50mcg; 75mcg; 100mcg; 125mcg'],
  },
  hyperlipidaemia: {
    treatments: ['diagnostic:4027'],
    usedCounts: {},
    medications: ['Roltesim                                        10mg; 20mg; 40mg'],
  },
  epilepsy: {
    treatments: ['diagnostic:2712'],
    usedCounts: {},
    medications: ['Sedabarb                                               30mg; 60mg'],
  },
};

/**
 * Seed demo "received" data for profile conditions that have no prescriptions yet.
 *
 * Uses CONDITION_DEMO_SEEDS for known conditions (real tariff codes + real medicines).
 * For unknown conditions, falls back to seeding the first diagnostic + ongoing code
 * and first medication from CDL_CONDITION_DETAILS.
 */
export const seedDemoData = (profile) => {
  const existing = loadPrescriptions();
  const conditionIds = profile?.conditions ?? [];
  if (!conditionIds.length) return existing;

  const updated = { ...existing };
  let changed = false;

  for (const id of conditionIds) {
    if (updated[id]?.treatments?.length || updated[id]?.medications?.length) continue;

    let entry;
    if (CONDITION_DEMO_SEEDS[id]) {
      entry = { ...CONDITION_DEMO_SEEDS[id] };
    } else {
      const details = CDL_CONDITION_DETAILS[id];
      if (!details) continue;
      const diag = details.treatment?.diagnostic?.[0];
      const codes = diag?.code ? [treatmentKey('diagnostic', diag.code)] : [];
      const meds = details.medications?.slice(0, 1) ?? [];
      if (!codes.length && !meds.length) continue;
      entry = { treatments: codes, medications: meds, usedCounts: {} };
    }

    updated[id] = entry;
    changed = true;
  }

  if (changed) savePrescriptions(updated);
  return updated;
};
