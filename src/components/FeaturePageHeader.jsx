export default function FeaturePageHeader({
  eyebrow,
  eyebrowClassName = 'text-cyan-300',
  title,
  description,
  onBack,
  profileContext,
}) {
  return (
    <div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-cyan-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Dashboard
        </button>
      )}
      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${eyebrowClassName}`}>
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      {profileContext && (
        <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300">
          {profileContext}
        </p>
      )}
    </div>
  );
}
