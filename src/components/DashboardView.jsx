import { CDL_CONDITIONS, DISCOVERY_PLANS } from '../data/authiData';

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

const FEATURE_CARDS = [
  {
    view: 'hospitals',
    title: 'Hospital Network',
    description: 'Pick a province — your plan networks are applied automatically when you search.',
    accent: 'from-cyan-500/10 to-cyan-400/5',
    border: 'border-cyan-400/20',
    badge: 'bg-cyan-400/15 text-cyan-300',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
      </svg>
    ),
  },
  {
    view: 'treatment',
    title: 'Treatment Plans',
    description: 'View treatment basket items for your chronic conditions — diagnostic and ongoing care items side by side.',
    accent: 'from-violet-500/10 to-violet-400/5',
    border: 'border-violet-400/20',
    badge: 'bg-violet-400/15 text-violet-300',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
  },
  {
    view: 'medication',
    title: 'Medication',
    description: 'Search medicines across the chronic conditions in your profile, tagged by condition.',
    accent: 'from-emerald-500/10 to-emerald-400/5',
    border: 'border-emerald-400/20',
    badge: 'bg-emerald-400/15 text-emerald-300',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
      </svg>
    ),
  },
];

export default function DashboardView({ profile, onNavigate }) {
  const plan = DISCOVERY_PLANS.find((p) => p.id === profile.plan);
  const memberName = profile.name || 'Member';
  const initial = memberName.charAt(0).toUpperCase();
  const conditionLabels = (profile.conditions ?? []).map(
    (id) => CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id
  );

  return (
    <div className="space-y-8">

      {/* Member hero */}
      <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950/80 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-2xl font-bold text-cyan-300">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Member</p>
              <h1 className="mt-1 text-3xl font-semibold text-white">{memberName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-0.5 text-sm font-medium text-cyan-300">
                  {plan?.label ?? profile.plan} Plan
                </span>
                {conditionLabels.length > 0 && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs text-slate-400">
                    {conditionLabels.length} chronic condition{conditionLabels.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {plan?.tagline && (
                <p className="mt-3 text-sm leading-6 text-slate-400">{plan.tagline}</p>
              )}
            </div>
          </div>

          {/* Plan notes */}
          {plan?.notes?.length > 0 && (
            <ul className="mt-6 space-y-2">
              {plan.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/60" />
                  {note}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Network badges */}
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-xl shadow-cyan-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Hospital networks
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {(plan?.hospitalNetworkCodes ?? []).map((code) => (
              <div
                key={code}
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/15 text-[10px] font-bold text-cyan-300">
                  {code}
                </span>
                <span className="text-sm text-slate-300">
                  {NETWORK_CODE_LABELS[code] ?? code}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('hospitals')}
            className="mt-4 w-full rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/15"
          >
            Browse hospitals
          </button>
        </div>
      </div>

      {/* Chronic conditions */}
      {conditionLabels.length > 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            My chronic conditions
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {conditionLabels.map((label, i) => (
              <span
                key={i}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/3 p-6 text-center">
          <p className="text-sm text-slate-500">No chronic conditions on record.</p>
          <p className="mt-1 text-xs text-slate-600">
            Edit your profile to add CDL conditions and see personalised treatment and medication data.
          </p>
        </div>
      )}

      {/* Feature navigation cards */}
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Explore features
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURE_CARDS.map(({ view, title, description, accent, border, badge, icon }) => (
            <button
              key={view}
              type="button"
              onClick={() => onNavigate(view)}
              className={`group flex flex-col gap-4 rounded-[2rem] border ${border} bg-gradient-to-br ${accent} p-6 text-left shadow-lg transition hover:scale-[1.015] hover:shadow-xl`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${badge}`}>
                {icon}
              </div>
              <div>
                <p className="text-base font-semibold text-white">{title}</p>
                <p className="mt-1.5 text-sm leading-6 text-slate-400 group-hover:text-slate-300">
                  {description}
                </p>
              </div>
              <div className="mt-auto flex items-center gap-1.5 text-xs font-medium text-slate-400 group-hover:text-slate-300">
                Open
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/8 px-5 py-4 text-sm leading-6 text-amber-50/80">
        This is a prototype assistant based on the supplied Discovery Health PDFs. Always confirm
        final benefit rules, authorisation requirements, and plan-specific cover with Discovery Health
        directly.
      </div>

    </div>
  );
}
