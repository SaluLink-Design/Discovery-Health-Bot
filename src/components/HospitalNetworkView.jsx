import { useCallback, useEffect, useState } from 'react';
import {
  PROVINCES,
  formatPlanNetworkSummary,
  getPlanFromProfile,
  getPlanHospitalNetworks,
  isUnrestrictedHospitalPlan,
} from '../lib/profileContext';
import {
  hospitalNoOnPlanLiteracy,
  hospitalOutsidePlanLiteracy,
} from '../lib/literacyContent';
import { CAMPAIGN_LITERACY_ENABLED } from '../lib/campaignConfig';
import { isModuleUnlocked } from '../lib/campaignStore';
import { HOSPITAL_COVER_COPY } from '../lib/literacyModuleCopy';
import LiteracyModuleQuickCheck from './LiteracyModuleQuickCheck';
import { PATIENT_CLASSES } from '../lib/authiTheme';
import BrandEyebrow from './BrandEyebrow';
import FeaturePageHeader from './FeaturePageHeader';
import GoodToKnowCard from './GoodToKnowCard';
import { GradientSegmentButton, GradientSegmentTrack } from './GradientSegment';
import { PatientButtonPrimary } from './PatientButton';
import ResultCard from './ResultCard';

const CATEGORY = {
  ON_PLAN: 'on_plan',
  OFF_PLAN: 'off_plan',
};

const LOCATION_SOURCE_LABELS = {
  device: 'your device location',
  profile_town: 'your saved town',
  province: 'your province centre',
};

function resolveProfileProvince(profile) {
  const raw = profile?.province ?? '';
  if (!raw) return '';
  const match = PROVINCES.find(
    (p) => p.value === raw || p.label.toLowerCase() === raw.toLowerCase(),
  );
  return match?.value ?? raw.toUpperCase();
}

function requestDeviceLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 },
    );
  });
}

export default function HospitalNetworkView({
  profile,
  onNavigate,
  highlightOffPlan = false,
  campaignRefreshKey = 0,
}) {
  const plan = getPlanFromProfile(profile);
  const planNetworks = getPlanHospitalNetworks(profile);
  const unrestricted = isUnrestrictedHospitalPlan(profile);
  const networkSummary = formatPlanNetworkSummary(profile);

  const [province, setProvince] = useState(() => resolveProfileProvince(profile));
  const [town, setTown] = useState(profile?.town ?? '');
  const [deviceCoords, setDeviceCoords] = useState(null);
  const [locationNote, setLocationNote] = useState('');
  const [results, setResults] = useState(null);
  const [category, setCategory] = useState(CATEGORY.ON_PLAN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [moduleUnlocked, setModuleUnlocked] = useState(
    () => !CAMPAIGN_LITERACY_ENABLED || isModuleUnlocked('hospitals')
  );

  useEffect(() => {
    if (!CAMPAIGN_LITERACY_ENABLED) {
      setModuleUnlocked(true);
      return;
    }
    setModuleUnlocked(isModuleUnlocked('hospitals'));
  }, [campaignRefreshKey]);

  const planLabel = plan?.label ?? 'your plan';
  const showCategoryToggle = !unrestricted && Boolean(planNetworks);
  const description = unrestricted
    ? `Top 3 nearest hospitals in your province on your ${planLabel} plan.`
    : `Top 3 nearest hospitals from your location — choose on your plan or outside your plan.`;

  const runNearbySearch = useCallback(
    async (coords) => {
      if (!province) return;
      setLoading(true);
      setError('');
      setResults(null);

      const params = new URLSearchParams({ province, limit_on: '3', limit_off: '3' });
      if (town.trim()) params.append('town', town.trim());
      if (coords?.lat != null && coords?.lng != null) {
        params.append('lat', String(coords.lat));
        params.append('lng', String(coords.lng));
      }
      if (planNetworks && !unrestricted) {
        params.append('networks', planNetworks.join(','));
      }

      try {
        const res = await fetch(`/api/hospitals/nearby?${params}`);
        const data = await res.json();
        if (data.error) throw new Error(data.message || 'Could not search hospitals.');
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [province, town, planNetworks, unrestricted],
  );

  const locateAndSearch = useCallback(async () => {
    let coords = deviceCoords;
    if (!coords) {
      try {
        coords = await requestDeviceLocation();
        setDeviceCoords(coords);
        setLocationNote('Using your device location — distances are calculated from where you are now.');
      } catch {
        setLocationNote(
          town
            ? 'Using your saved town. Allow location access for the most accurate distances.'
            : 'Using your province centre. Add a town to your profile or allow location for better accuracy.',
        );
      }
    }
    await runNearbySearch(coords);
  }, [deviceCoords, town, runNearbySearch]);

  useEffect(() => {
    if (!province) return undefined;
    locateAndSearch();
    return undefined;
  }, [province]);

  useEffect(() => {
    if (highlightOffPlan) setCategory(CATEGORY.OFF_PLAN);
  }, [highlightOffPlan]);

  const handleSearch = () => locateAndSearch();

  const handleGetDirections = (address) => {
    const encoded = encodeURIComponent(address);
    if (!navigator.geolocation) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank', 'noopener,noreferrer');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const origin = `${coords.latitude},${coords.longitude}`;
        window.open(
          `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encoded}`,
          '_blank',
          'noopener,noreferrer',
        );
      },
      () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank', 'noopener,noreferrer');
      },
      { timeout: 6000 },
    );
  };

  const onPlanItems = results?.onPlan?.items ?? [];
  const offPlanItems = results?.offPlan?.items ?? [];
  const onPlanTotal = results?.onPlan?.total ?? 0;
  const offPlanTotal = results?.offPlan?.total ?? 0;
  const locationSourceLabel = LOCATION_SOURCE_LABELS[results?.locationSource] ?? 'your location';

  const activeItems = category === CATEGORY.ON_PLAN ? onPlanItems : offPlanItems;
  const activeTotal = category === CATEGORY.ON_PLAN ? onPlanTotal : offPlanTotal;

  const noOnPlanLiteracy =
    results && category === CATEGORY.ON_PLAN && onPlanItems.length === 0 && !unrestricted
      ? hospitalNoOnPlanLiteracy({ profile, province, town })
      : null;

  return (
    <div className="space-y-8">
      <FeaturePageHeader
        title="Find hospitals on my plan"
        description={description}
        onBack={onNavigate ? () => onNavigate('dashboard') : undefined}
        profileContext={networkSummary}
        sourceNote="Distances use facility-level coordinates where available. Allow location for best accuracy."
      />

      {CAMPAIGN_LITERACY_ENABLED && !moduleUnlocked && (
        <LiteracyModuleQuickCheck
          moduleId="hospitals"
          profile={profile}
          refreshKey={campaignRefreshKey}
          onUnlock={() => setModuleUnlocked(true)}
          introSpeech={HOSPITAL_COVER_COPY.introSpeech}
          moduleIntroQuizPitch={HOSPITAL_COVER_COPY.moduleIntroQuizPitch}
          startQuizLabel={HOSPITAL_COVER_COPY.startQuizLabel}
          skipLabel={HOSPITAL_COVER_COPY.skipLabel}
          eyebrowLabel={`${planLabel} · hospital networks`}
        />
      )}

      {moduleUnlocked && (
        <>
      <div className={PATIENT_CLASSES.card}>
        <BrandEyebrow className="mb-4">Your location</BrandEyebrow>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={PATIENT_CLASSES.label}>
              Province <span className="text-red-500">*</span>
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className={PATIENT_CLASSES.select}
            >
              <option value="">Select province…</option>
              {PROVINCES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={PATIENT_CLASSES.label}>Town</label>
            <input
              type="text"
              value={town}
              onChange={(e) => setTown(e.target.value)}
              placeholder="e.g. Johannesburg"
              className={PATIENT_CLASSES.input}
            />
          </div>

          <div className="flex items-end">
            <PatientButtonPrimary
              type="button"
              onClick={handleSearch}
              disabled={!province || loading}
              className="w-full"
            >
              {loading ? 'Finding nearest…' : 'Find nearest'}
            </PatientButtonPrimary>
          </div>
        </div>

        {locationNote && (
          <p className="mt-3 text-xs text-[#9CA3AF]">{locationNote}</p>
        )}
      </div>

      {error && <div className={PATIENT_CLASSES.errorBox}>{error}</div>}

      {results && showCategoryToggle && (
        <div className={PATIENT_CLASSES.card}>
          <BrandEyebrow className="mb-4">Choose a category</BrandEyebrow>
          <GradientSegmentTrack>
            <GradientSegmentButton
              active={category === CATEGORY.ON_PLAN}
              onClick={() => setCategory(CATEGORY.ON_PLAN)}
            >
              On my plan ({onPlanTotal})
            </GradientSegmentButton>
            <GradientSegmentButton
              active={category === CATEGORY.OFF_PLAN}
              onClick={() => setCategory(CATEGORY.OFF_PLAN)}
            >
              Outside my plan ({offPlanTotal})
            </GradientSegmentButton>
          </GradientSegmentTrack>
        </div>
      )}

      {category === CATEGORY.OFF_PLAN && showCategoryToggle && offPlanItems.length > 0 && (
        <GoodToKnowCard tone="amber" {...hospitalOutsidePlanLiteracy({ profile })} />
      )}

      {noOnPlanLiteracy && (
        <GoodToKnowCard tone="amber" {...noOnPlanLiteracy} />
      )}

      {results && activeItems.length > 0 && (
        <ResultCard
          title={
            category === CATEGORY.ON_PLAN
              ? '3 nearest on your plan'
              : '3 nearest outside your plan'
          }
          subtitle={`From ${locationSourceLabel}${activeTotal > 3 ? ` · ${activeTotal} available in ${province.replace(/\b\w/g, (c) => c.toUpperCase())}` : ''}`}
          items={activeItems}
          onGetDirections={handleGetDirections}
        />
      )}

      {results && activeItems.length === 0 && !loading && !error && (
        <div className={PATIENT_CLASSES.emptyState}>
          <p className="text-sm text-[#6B7280]">
            {category === CATEGORY.ON_PLAN
              ? 'No hospitals on your plan found in this province. Try the "Outside my plan" category.'
              : 'No hospitals outside your plan found nearby.'}
          </p>
        </div>
      )}

      {results?.hints?.length > 0 && (
        <div className={PATIENT_CLASSES.hintBox}>
          {results.hints.map((hint, i) => (
            <p key={i} className="mt-1 first:mt-0">{hint}</p>
          ))}
        </div>
      )}

      {!results && !loading && !error && !province && (
        <div className={PATIENT_CLASSES.emptyState}>
          <p className="text-sm text-[#6B7280]">
            Add your province in your profile to see nearest hospitals.
          </p>
        </div>
      )}
        </>
      )}
    </div>
  );
}
