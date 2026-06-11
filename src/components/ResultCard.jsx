import { AUTHI_GRADIENT, AUTHI_PURPLE, PATIENT_CLASSES } from '../lib/authiTheme';
import { PatientButtonSecondary } from './PatientButton';

function formatDistance(km) {
  if (km == null || !Number.isFinite(km)) return null;
  if (km < 1) return 'Less than 1 km away';
  return `${km} km away`;
}

export default function ResultCard({ title, subtitle, items, onGetDirections }) {
  return (
    <section className={PATIENT_CLASSES.card}>
      <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>
      )}
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article key={`${title}-${item.label}-${item.town ?? ''}`} className={PATIENT_CLASSES.innerCard}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[#111827]">{item.label}</p>
                  {item.onPlan === true && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                      style={{ background: AUTHI_GRADIENT }}
                    >
                      On your plan
                    </span>
                  )}
                  {item.onPlan === false && (
                    <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      Outside plan
                    </span>
                  )}
                </div>
                {item.town && (
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">{item.town}</p>
                )}
                <p className="mt-1 text-sm leading-6 text-[#6B7280]">{item.detail}</p>
                {formatDistance(item.distanceKm) && (
                  <p className="mt-1 text-xs font-medium" style={{ color: AUTHI_PURPLE }}>
                    {formatDistance(item.distanceKm)}
                  </p>
                )}
              </div>
              {item.address && onGetDirections && (
                <PatientButtonSecondary
                  type="button"
                  onClick={() => onGetDirections(item.address)}
                  className="!flex shrink-0 items-center gap-1.5 !px-3 !py-1.5 !text-xs"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  Directions
                </PatientButtonSecondary>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
