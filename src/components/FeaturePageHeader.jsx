import { PATIENT_CLASSES, PATIENT_FONT } from '../lib/authiTheme';
import BrandEyebrow from './BrandEyebrow';

export default function FeaturePageHeader({
  eyebrow,
  title,
  description,
  onBack,
  backLabel = 'Home',
  profileContext,
  sourceNote,
}) {
  return (
    <div style={{ fontFamily: PATIENT_FONT }}>
      {onBack && (
        <button type="button" onClick={onBack} className={PATIENT_CLASSES.backLink}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {backLabel}
        </button>
      )}
      {eyebrow ? <BrandEyebrow>{eyebrow}</BrandEyebrow> : null}
      <h2 className={`${eyebrow ? 'mt-2' : ''} ${PATIENT_CLASSES.pageTitle}`}>{title}</h2>
      <p className={`mt-2 ${PATIENT_CLASSES.body}`}>{description}</p>
      {profileContext && (
        <p className={`mt-3 ${PATIENT_CLASSES.innerCard} text-sm text-[#374151]`}>
          {profileContext}
        </p>
      )}
      {sourceNote && (
        <p className="mt-2 text-xs text-[#9CA3AF]">{sourceNote}</p>
      )}
    </div>
  );
}
