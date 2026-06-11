import { useEffect, useState } from 'react';
import { CDL_CONDITIONS } from '../data/authiData';
import {
  AUTHI_GRADIENT,
  AUTHI_GRADIENT_SOFT,
  AUTHI_PURPLE,
  PATIENT_COLORS,
  PATIENT_FONT,
} from '../lib/authiTheme';
import {
  ALSO_EXPLORE_ITEMS,
} from '../lib/memberFeatures';
import { DEFAULT_PERSONA_NAME } from '../data/demoCharacters';
import { CAMPAIGN_LITERACY_ENABLED, SCHEME_SOURCE_NOTE } from '../lib/campaignConfig';
import { getNextCampaignModule } from '../lib/campaignStore';
import CampaignProgressCard from './CampaignProgressCard';
import {
  getPlanFromProfile,
  getPlanSubThemeFromProfile,
} from '../lib/profileContext';
import BrandEyebrow from './BrandEyebrow';

const NETWORK_CODE_LABELS = {
  KH: 'KeyCare Hospital',
  KC: 'KeyCare Casualty',
  KS: 'KeyCare Start',
  KR: 'KeyCare Start Regional',
  D: 'Delta',
  S: 'Smart',
  DS: 'Dynamic Smart',
  C: 'Coastal',
};

const CONDITIONS_NUDGE_KEY = 'authi_conditions_nudge';

const ArrowRight = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

const MapPin = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

const Activity = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

const Building2 = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Z" />
  </svg>
);

const cardStyle = {
  background: PATIENT_COLORS.cardBg,
  border: `1px solid ${PATIENT_COLORS.cardBorder}`,
  boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
};

const getConditionLabel = (id) =>
  CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id;

export default function DashboardView({
  profile,
  activeConditionId,
  onNavigate,
  onEditProfile,
  campaignRefreshKey = 0,
  onRetakeJourney,
  onRetakeModuleQuiz,
}) {
  const [showConditionsNudge, setShowConditionsNudge] = useState(false);

  useEffect(() => {
    try {
      setShowConditionsNudge(sessionStorage.getItem(CONDITIONS_NUDGE_KEY) === '1');
    } catch {
      setShowConditionsNudge(false);
    }
  }, []);

  const dismissConditionsNudge = () => {
    try {
      sessionStorage.removeItem(CONDITIONS_NUDGE_KEY);
    } catch {
      // ignore
    }
    setShowConditionsNudge(false);
  };

  const plan = getPlanFromProfile(profile);
  const subTheme = getPlanSubThemeFromProfile(profile);
  const personaName = profile?.name?.trim() || DEFAULT_PERSONA_NAME;
  const initial = personaName.charAt(0).toUpperCase();
  const conditionLabels = (profile.conditions ?? []).map(
    (id) => CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id
  );
  const hasConditions = conditionLabels.length > 0;
  const planLabel = [plan?.label, subTheme?.label].filter(Boolean).join(' · ');
  const networkNames = (plan?.hospitalNetworkCodes ?? [])
    .map((code) => NETWORK_CODE_LABELS[code] ?? code)
    .join(', ');

  const activeConditionLabel = activeConditionId
    ? getConditionLabel(activeConditionId)
    : null;

  const heroTitle = activeConditionLabel
    ? `${personaName}'s cover for ${activeConditionLabel}`
    : hasConditions
      ? `${personaName}'s cover for ${conditionLabels[0]}`
      : `Learn what ${personaName}'s plan covers`;

  const heroSubtitle = planLabel
    ? `${planLabel} — follow the literacy journey below, or explore freely.`
    : `Customise ${personaName}'s profile to start the journey.`;

  const nextCampaignModule = CAMPAIGN_LITERACY_ENABLED
    ? getNextCampaignModule(profile)
    : null;

  const handlePrimaryCta = () => {
    if (!hasConditions) {
      onEditProfile?.();
      return;
    }
    if (nextCampaignModule) {
      onNavigate(nextCampaignModule);
      return;
    }
    onNavigate('treatment');
  };

  const primaryCtaLabel = !hasConditions
    ? 'Add your chronic conditions'
    : nextCampaignModule === 'treatment'
      ? "See what care I'm covered for"
      : nextCampaignModule === 'medication'
        ? 'Check medicine cover'
        : nextCampaignModule === 'hospitals'
          ? 'Find hospitals on my plan'
          : "See what care I'm covered for";

  const primaryCtaDetail = !hasConditions
    ? 'Unlock care and medicine cover for your profile.'
    : nextCampaignModule
      ? 'Continue your literacy journey — quick check first, then explore.'
      : 'Diagnostic tests and ongoing management for conditions on your profile.';

  const locationLabel = [profile.town, profile.province].filter(Boolean).join(', ');

  return (
    <div style={{ fontFamily: PATIENT_FONT }}>
      <div
        className="mb-6 rounded-2xl p-8"
        style={{
          background: PATIENT_COLORS.heroBg,
          boxShadow: '0 4px 24px rgba(13,15,28,0.12)',
        }}
      >
        <BrandEyebrow>Your cover</BrandEyebrow>
        <h1
          style={{
            color: '#FFFFFF',
            fontSize: '28px',
            fontWeight: 700,
            marginTop: 8,
            marginBottom: 8,
            lineHeight: 1.25,
          }}
        >
          {heroTitle}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', marginBottom: 24 }}>
          {heroSubtitle}
        </p>
        <button
          type="button"
          onClick={handlePrimaryCta}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3"
          style={{
            background: AUTHI_GRADIENT,
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(159,98,237,0.4)',
          }}
        >
          {primaryCtaLabel}
          <ArrowRight />
        </button>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: 12 }}>
          {primaryCtaDetail}
        </p>
      </div>

      {CAMPAIGN_LITERACY_ENABLED && (
        <CampaignProgressCard
          profile={profile}
          onNavigate={onNavigate}
          refreshKey={campaignRefreshKey}
          onRetakeJourney={onRetakeJourney}
          onRetakeModuleQuiz={onRetakeModuleQuiz}
        />
      )}

      {showConditionsNudge && !hasConditions && onEditProfile && (
        <div
          className="mb-5 flex flex-col gap-3 rounded-2xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ ...cardStyle, borderColor: '#FCD34D' }}
        >
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: PATIENT_COLORS.textPrimary }}>
              Next step: add your chronic conditions
            </p>
            <p style={{ fontSize: '12px', color: PATIENT_COLORS.textSecondary, marginTop: 2 }}>
              This unlocks care entitlements and medicine cover personalised to you.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onEditProfile}
              className="rounded-xl px-4 py-2"
              style={{
                background: AUTHI_GRADIENT,
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Add conditions
            </button>
            <button
              type="button"
              onClick={dismissConditionsNudge}
              className="rounded-xl px-4 py-2"
              style={{
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                color: PATIENT_COLORS.textSecondary,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl p-6" style={cardStyle}>
          <BrandEyebrow className="mb-4">Your Profile</BrandEyebrow>

          <div
            className="flex items-center gap-4 pb-5"
            style={{ borderBottom: `1px solid ${PATIENT_COLORS.divider}` }}
          >
            <div
              className="flex shrink-0 items-center justify-center rounded-full"
              style={{
                width: 48,
                height: 48,
                background: AUTHI_GRADIENT,
                color: '#fff',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p style={{ fontSize: '16px', fontWeight: 600, color: PATIENT_COLORS.textPrimary }}>
                {personaName}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {planLabel && (
                  <span
                    className="rounded-full px-3 py-1"
                    style={{
                      background: AUTHI_GRADIENT_SOFT,
                      color: AUTHI_PURPLE,
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    {planLabel}
                  </span>
                )}
                {locationLabel && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1"
                    style={{
                      background: '#F3F4F6',
                      color: PATIENT_COLORS.textSecondary,
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    <MapPin />
                    {locationLabel}
                  </span>
                )}
              </div>
            </div>
            {onEditProfile && (
              <button
                type="button"
                onClick={onEditProfile}
                className="shrink-0 rounded-xl px-4 py-2"
                style={{
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Edit profile
              </button>
            )}
          </div>

          <div className="pt-5">
            <BrandEyebrow className="mb-2">Chronic Conditions</BrandEyebrow>
            {hasConditions ? (
              <div className="flex flex-wrap gap-2">
                {(profile.conditions ?? []).map((id) => {
                  const label = getConditionLabel(id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                      style={{
                        background: '#F3F4F6',
                        color: PATIENT_COLORS.textPrimary,
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      <Activity />
                      {label}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: PATIENT_COLORS.textSecondary }}>
                None added yet.{' '}
                {onEditProfile && (
                  <button
                    type="button"
                    onClick={onEditProfile}
                    style={{
                      color: AUTHI_PURPLE,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Add conditions
                  </button>
                )}
              </p>
            )}
          </div>
        </div>

        {networkNames && (
          <div className="rounded-2xl p-6" style={cardStyle}>
            <BrandEyebrow className="mb-3">Hospital Networks on Your Plan</BrandEyebrow>
            <div
              className="mb-3 flex items-center gap-3 rounded-xl p-4"
              style={{ background: AUTHI_GRADIENT_SOFT }}
            >
              <div
                className="flex shrink-0 items-center justify-center rounded-lg"
                style={{ width: 36, height: 36, background: AUTHI_GRADIENT }}
              >
                <span style={{ color: '#fff' }}>
                  <Building2 />
                </span>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: PATIENT_COLORS.textPrimary }}>
                  {networkNames}
                </p>
                <p style={{ fontSize: '12px', color: PATIENT_COLORS.textSecondary, marginTop: 1 }}>
                  Network hospitals
                </p>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: PATIENT_COLORS.textMuted }}>
              Use the Hospitals tab to search near you.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-2xl p-6" style={cardStyle}>
        <BrandEyebrow className="mb-3.5">Also Explore</BrandEyebrow>
        {ALSO_EXPLORE_ITEMS.map((item, i) => (
          <div
            key={item.view}
            className="flex items-center justify-between py-4"
            style={{ borderTop: i === 0 ? 'none' : `1px solid ${PATIENT_COLORS.divider}` }}
          >
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: PATIENT_COLORS.textPrimary }}>
                {item.label}
              </p>
              <p style={{ fontSize: '12px', color: PATIENT_COLORS.textMuted, marginTop: 2 }}>
                {item.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(item.view)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2"
              style={{
                background: AUTHI_GRADIENT,
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Open
              <ArrowRight size={13} />
            </button>
          </div>
        ))}
      </div>

      <p
        className="mt-8 text-center"
        style={{ fontSize: '12px', color: PATIENT_COLORS.textMuted }}
      >
        {SCHEME_SOURCE_NOTE}
      </p>
    </div>
  );
}
