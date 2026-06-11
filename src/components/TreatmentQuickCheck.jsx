import { TREATMENT_BASKET_COPY } from '../lib/literacyContent';
import { conditionLabel } from '../lib/quizShared';
import LiteracyModuleQuickCheck from './LiteracyModuleQuickCheck';

/**
 * Care covered literacy funnel: Authi explains → quiz or skip → unlock basket.
 */
export default function TreatmentQuickCheck({
  profile,
  conditionId,
  refreshKey = 0,
  onUnlock,
}) {
  return (
    <LiteracyModuleQuickCheck
      moduleId="treatment"
      profile={profile}
      conditionId={conditionId}
      refreshKey={refreshKey}
      onUnlock={onUnlock}
      introSpeech={TREATMENT_BASKET_COPY.introSpeech}
      moduleIntroQuizPitch={TREATMENT_BASKET_COPY.moduleIntroQuizPitch}
      startQuizLabel={TREATMENT_BASKET_COPY.startQuizLabel}
      skipLabel={TREATMENT_BASKET_COPY.skipToBasketLabel}
      eyebrowLabel={`${conditionLabel(conditionId)} · quick check`}
    />
  );
}
