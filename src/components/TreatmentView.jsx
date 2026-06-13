import { useEffect, useState } from 'react';
import { CDL_CONDITIONS } from '../data/authiData';
import {
  getProfileConditionLabels,
  getProfileConditions,
  hasProfileConditions,
} from '../lib/profileContext';
import { getUsedCount, isTreatmentReceived } from '../lib/prescriptionStore';
import { TREATMENT_BASKET_COPY, treatmentBenefitExhaustedLiteracy } from '../lib/literacyContent';
import { fetchTreatmentBasket } from '../lib/quizTreatmentData';
import TreatmentQuickCheck from './TreatmentQuickCheck';
import BrandEyebrow from './BrandEyebrow';
import {
  AUTHI_GRADIENT,
  AUTHI_MAGENTA,
  AUTHI_PURPLE,
  AUTHI_SECTION_GRADIENTS,
  PATIENT_CLASSES,
} from '../lib/authiTheme';
import { isModuleUnlocked } from '../lib/campaignStore';
import { CAMPAIGN_LITERACY_ENABLED, CAMPAIGN_MEMBER_MODE } from '../lib/campaignConfig';
import FeaturePageHeader from './FeaturePageHeader';
import CampaignNextQuizBanner from './CampaignNextQuizBanner';
import GradientChip from './GradientChip';
import GoodToKnowCard from './GoodToKnowCard';
import { PatientButtonPrimary } from './PatientButton';

const CheckIcon = () => (
  <svg className="h-3.5 w-3.5 text-amber-700" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Treatment card — Chronic App style
───────────────────────────────────────────────────────────── */
const TreatmentCard = ({ item, received, usedCount, showMotivationLiteracy = false }) => {
  const [showCode, setShowCode] = useState(false);
  const total = item.count;
  const hasUsage = received && usedCount !== null;
  const used = hasUsage ? usedCount : received ? 1 : 0;
  const remaining = hasUsage ? Math.max(0, total - used) : received ? 0 : total;
  const fullyDone = received && !hasUsage;

  return (
    <div className={`rounded-2xl border px-5 py-4 transition ${
      received
        ? 'border-amber-300 bg-amber-50 shadow-sm'
        : 'border-[#EAECF0] bg-[#F9FAFB]'
    }`}>
      <div className="flex items-start gap-3">
        {/* Tick — received care */}
        <div
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
            received
              ? 'border-amber-500 bg-amber-100'
              : 'border-[#E5E7EB] bg-white'
          }`}
          aria-hidden
        >
          {received ? <CheckIcon /> : null}
        </div>

        <div className="flex flex-1 min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold leading-snug ${received ? 'text-amber-900' : 'text-[#111827]'}`}>
              {item.desc}
            </p>
            {showCode ? (
              <p className="mt-1 text-xs text-slate-500">
                Code: <span className="font-mono text-slate-400">{item.code}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setShowCode(true)}
                className="mt-1 text-xs text-[#9CA3AF] hover:text-[#9F62ED]"
              >
                Show procedure code
              </button>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {fullyDone && (
                <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  ✓ Received
                </span>
              )}
              {hasUsage && (
                <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  In progress
                </span>
              )}
              {!received && (
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                  Available
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className={`text-base font-bold tabular-nums ${received ? 'text-amber-700' : 'text-emerald-700'}`}>
              {hasUsage ? `${remaining} left` : fullyDone ? 'Done' : `Max: ${total}`}
            </p>
            <p className="text-[10px] text-[#9CA3AF]">
              {hasUsage ? `of ${total} covered/yr` : fullyDone ? 'completed' : 'covered/yr'}
            </p>
          </div>
        </div>
      </div>

      {/* Usage progress bar */}
      {hasUsage && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-amber-800">
              {used} of {total} used this year
              {remaining > 0 && (
                <span className="ml-1.5 text-emerald-700">· {remaining} remaining covered</span>
              )}
              {remaining === 0 && (
                <span className="ml-1.5 text-[#9CA3AF]">· benefit used for this year</span>
              )}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (used / total) * 100)}%`,
                background: AUTHI_GRADIENT,
              }}
            />
          </div>
        </div>
      )}

      {remaining === 0 && hasUsage && showMotivationLiteracy && (
        <div className="mt-3">
          <GoodToKnowCard
            tone="violet"
            {...treatmentBenefitExhaustedLiteracy({ itemDesc: item.desc })}
          />
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Section (Diagnostic Basket / Ongoing Management)
───────────────────────────────────────────────────────────── */
const BasketSection = ({ title, subtitle, basketType, items, prescriptions, conditionId, accentColour }) => {
  if (!items || items.length === 0) return null;
  const received = items.filter((it) =>
    isTreatmentReceived(prescriptions, conditionId, basketType, it.code)
  ).length;

  const accents = {
    violet: {
      gradient: AUTHI_SECTION_GRADIENTS.purple,
      border: 'border-[#E9D5FF]',
      badgeBg: 'rgba(159,98,237,0.12)',
      badgeText: AUTHI_PURPLE,
      dot: AUTHI_PURPLE,
    },
    cyan: {
      gradient: AUTHI_SECTION_GRADIENTS.blue,
      border: 'border-[#BAE6FD]',
      badgeBg: 'rgba(73,166,253,0.12)',
      badgeText: '#2563EB',
      dot: AUTHI_MAGENTA,
    },
  };
  const ac = accents[accentColour] ?? accents.violet;

  return (
    <div className="space-y-3">
      <div
        className={`flex items-center justify-between rounded-2xl border px-5 py-3.5 ${ac.border}`}
        style={{ background: ac.gradient }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="mt-0.5 flex h-2.5 w-2.5 shrink-0 self-start rounded-full"
            style={{ background: ac.dot }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#111827]">{title}</p>
            {subtitle && (
              <p className="mt-0.5 text-[11px] leading-snug text-[#6B7280]">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B7280]">
            {items.length} procedure{items.length !== 1 ? 's' : ''}
          </span>
          {received > 0 && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: ac.badgeBg, color: ac.badgeText }}
            >
              {received} received
            </span>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {items.map((item) => {
          const isReceived = isTreatmentReceived(prescriptions, conditionId, basketType, item.code);
          const uc = isReceived ? getUsedCount(prescriptions, conditionId, item.code) : null;
          return (
            <TreatmentCard
              key={`${basketType}-${item.code}-${item.count}`}
              item={item}
              received={isReceived}
              usedCount={uc}
              showMotivationLiteracy={basketType === 'ongoing'}
            />
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */
export default function TreatmentView({
  profile,
  focusConditionId,
  onNavigate,
  onEditProfile,
  prescriptions,
  campaignRefreshKey = 0,
  onCampaignProgress,
  browseAllConditions = false,
  onBrowseAllConditionsChange,
}) {
  const effectivePrescriptions = CAMPAIGN_MEMBER_MODE ? {} : prescriptions;
  const profileConditionIds = getProfileConditions(profile);
  const usesProfileConditions = hasProfileConditions(profile);
  const profileConditionLabels = getProfileConditionLabels(profile);

  const initialCondition =
    focusConditionId && profileConditionIds.includes(focusConditionId)
      ? focusConditionId
      : profileConditionIds[0] ?? CDL_CONDITIONS[0].id;

  const [browseAllConditionsInternal, setBrowseAllConditionsInternal] = useState(false);
  const browseAll =
    onBrowseAllConditionsChange != null ? browseAllConditions : browseAllConditionsInternal;

  const [selectedCondition, setSelectedCondition] = useState(initialCondition);

  useEffect(() => {
    if (
      focusConditionId &&
      profileConditionIds.includes(focusConditionId) &&
      !browseAll
    ) {
      setSelectedCondition(focusConditionId);
    }
  }, [focusConditionId, profileConditionIds, browseAll]);
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [basketUnlocked, setBasketUnlocked] = useState(
    () => !CAMPAIGN_LITERACY_ENABLED || isModuleUnlocked('treatment')
  );

  useEffect(() => {
    if (!CAMPAIGN_LITERACY_ENABLED) {
      setBasketUnlocked(true);
      return;
    }
    setBasketUnlocked(isModuleUnlocked('treatment'));
  }, [campaignRefreshKey]);

  const showFullConditionDropdown = !usesProfileConditions || browseAll;

  const conditionLabel =
    CDL_CONDITIONS.find((c) => c.id === selectedCondition)?.label ?? selectedCondition;

  const conditionRx = effectivePrescriptions?.[selectedCondition];
  const receivedCount = conditionRx?.treatments?.length ?? 0;

  /* PDF-backed basket with bundled CDL fallback (fixes HIV and other sparse API rows) */
  useEffect(() => {
    let cancelled = false;
    setPdfData(null);
    setLoading(true);

    fetchTreatmentBasket(selectedCondition)
      .then((data) => { if (!cancelled) setPdfData(data); })
      .catch(() => {
        if (!cancelled) setPdfData({ diagnostic: [], ongoing: [] });
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [selectedCondition]);

  const profileContextLine = usesProfileConditions && !showFullConditionDropdown
    ? `Treatment basket for: ${profileConditionLabels.join(', ')}`
    : null;

  const hasDiagnostic = pdfData?.diagnostic?.length > 0;
  const hasOngoing = pdfData?.ongoing?.length > 0;
  const hasPdfData = hasDiagnostic || hasOngoing;

  if (!usesProfileConditions && !browseAll) {
    return (
      <div className="space-y-8">
        <FeaturePageHeader
          title="What care am I covered for?"
          description="Add chronic conditions to your profile to see tests and follow-up care Discovery covers for you."
          onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
          sourceNote="Treatment entitlements from the 2026 Chronic Disease List treatment guides."
        />
        <div className={PATIENT_CLASSES.emptyState}>
          <p className="text-sm font-medium text-[#111827]">
            Add a condition to your profile to see what care you&apos;re covered for.
          </p>
          <p className="mt-2 text-xs text-[#6B7280]">
            For example, pick Hypertension or Asthma on your profile to unlock entitlements for that condition.
          </p>
          {onEditProfile && (
            <PatientButtonPrimary type="button" onClick={onEditProfile} className="mt-6">
              Add conditions to my profile
            </PatientButtonPrimary>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FeaturePageHeader
        title="What care am I covered for?"
        description="Tests and follow-up care Discovery covers for your chronic conditions — from the official Chronic Disease List guides."
        onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
        profileContext={basketUnlocked ? profileContextLine : null}
        sourceNote="Treatment entitlements from the 2026 Chronic Disease List treatment guides."
      />

      {CAMPAIGN_LITERACY_ENABLED && !basketUnlocked && (
        <TreatmentQuickCheck
          profile={profile}
          conditionId={selectedCondition}
          refreshKey={campaignRefreshKey}
          onUnlock={() => setBasketUnlocked(true)}
          onNavigate={onNavigate}
          onCampaignProgress={onCampaignProgress}
        />
      )}

      {basketUnlocked && (
        <>
      <CampaignNextQuizBanner
        moduleId="treatment"
        profile={profile}
        onNavigate={onNavigate}
      />

      {/* ── Condition selector ───────────────────── */}
      <div className={PATIENT_CLASSES.card}>
        <BrandEyebrow className="mb-4">Select condition</BrandEyebrow>

        {showFullConditionDropdown && (
          <div className="relative">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className={PATIENT_CLASSES.select}
            >
              {CDL_CONDITIONS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        )}

        {usesProfileConditions && !showFullConditionDropdown && (
          <div className="flex flex-wrap items-center gap-2">
            {profileConditionIds.map((id) => {
              const label = CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id;
              return (
                <GradientChip
                  key={id}
                  selected={selectedCondition === id}
                  onClick={() => setSelectedCondition(id)}
                >
                  {label}
                </GradientChip>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Loading ───────────────────────────────── */}
      {loading && (
        <div className={PATIENT_CLASSES.emptyState}>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9F62ED]/30 border-t-[#9F62ED]" />
          <p className="mt-3 text-sm text-[#6B7280]">Loading treatment basket from PDF…</p>
        </div>
      )}

      {/* ── Empty state ───────────────────────────── */}
      {!loading && pdfData && !hasPdfData && (
        <div className={PATIENT_CLASSES.emptyState}>
          <p className="text-sm text-[#6B7280]">No treatment basket data found for {conditionLabel}.</p>
        </div>
      )}

      {/* ── Prescription summary banner ───────────── */}
      {!loading && hasPdfData && receivedCount > 0 && (
        <div
          className="flex items-start gap-3 rounded-2xl border border-amber-200 px-4 py-3.5"
          style={{ background: AUTHI_SECTION_GRADIENTS.amber }}
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-100">
            <CheckIcon />
          </span>
          <div>
            <p className="text-xs font-semibold text-amber-900">
              {conditionLabel} — your treatment history
            </p>
            <p className="text-[11px] text-[#6B7280]">
              Ticked items are care you have already received. Others show what is still available on your basket.
            </p>
          </div>
        </div>
      )}

      {/* ── Diagnostic Basket ─────────────────────── */}
      {!loading && hasDiagnostic && (
        <BasketSection
          title={TREATMENT_BASKET_COPY.diagnosticViewTitle}
          subtitle={TREATMENT_BASKET_COPY.diagnosticViewSubtitle}
          basketType="diagnostic"
          items={pdfData.diagnostic}
          prescriptions={effectivePrescriptions}
          conditionId={selectedCondition}
          accentColour="violet"
        />
      )}

      {/* ── Ongoing Management ───────────────────── */}
      {!loading && hasOngoing && (
        <BasketSection
          title={TREATMENT_BASKET_COPY.ongoingViewTitle}
          subtitle={TREATMENT_BASKET_COPY.ongoingViewSubtitle}
          basketType="ongoing"
          items={pdfData.ongoing}
          prescriptions={effectivePrescriptions}
          conditionId={selectedCondition}
          accentColour="cyan"
        />
      )}
        </>
      )}
    </div>
  );
}
