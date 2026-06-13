import { CAMPAIGN_MODULES } from '../lib/campaignLiteracy';
import { CAMPAIGN_LITERACY_ENABLED } from '../lib/campaignConfig';
import {
  getNextIncompleteModuleAfter,
  isCampaignJourneyComplete,
  isModuleUnlocked,
} from '../lib/campaignStore';
import { AUTHI_GRADIENT_SOFT, AUTHI_PURPLE } from '../lib/authiTheme';
import { PatientButtonPrimary } from './PatientButton';

/**
 * Shown on unlocked feature pages so members can continue the literacy journey
 * without returning home.
 */
export default function CampaignNextQuizBanner({ moduleId, profile, onNavigate }) {
  if (!CAMPAIGN_LITERACY_ENABLED || !onNavigate || !isModuleUnlocked(moduleId)) {
    return null;
  }

  const nextModuleId = getNextIncompleteModuleAfter(moduleId, profile);
  const journeyComplete = isCampaignJourneyComplete();

  if (nextModuleId) {
    const nextMeta = CAMPAIGN_MODULES[nextModuleId];
    return (
      <div
        className="flex flex-col gap-3 rounded-2xl border border-[#E9D5FF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ background: AUTHI_GRADIENT_SOFT }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9F62ED]">
            Literacy journey
          </p>
          <p className="mt-1 text-sm font-medium text-[#111827]">
            Next up: {nextMeta?.title ?? nextModuleId}
          </p>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            Continue to the next quick check when you&apos;re ready.
          </p>
        </div>
        <PatientButtonPrimary
          type="button"
          onClick={() => onNavigate(nextModuleId)}
          className="shrink-0 sm:min-w-[180px]"
        >
          Continue to next quiz
        </PatientButtonPrimary>
      </div>
    );
  }

  if (journeyComplete) {
    return (
      <div
        className="flex flex-col gap-3 rounded-2xl border border-[#E9D5FF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ background: AUTHI_GRADIENT_SOFT }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: AUTHI_PURPLE }}>
            Literacy journey complete
          </p>
          <p className="mt-1 text-sm font-medium text-[#111827]">
            All quick checks done — optional survey on home.
          </p>
        </div>
        <PatientButtonPrimary
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="shrink-0 sm:min-w-[180px]"
        >
          Finish journey
        </PatientButtonPrimary>
      </div>
    );
  }

  return null;
}
