import { CAMPAIGN_MEMBER_MODE } from '../lib/campaignConfig';
import { CDL_CONDITIONS } from '../data/authiData';
import { MEMBER_FEATURES } from '../lib/memberFeatures';
import {
  getPlanFromProfile,
  getPlanSubThemeFromProfile,
} from '../lib/profileContext';

const IconHome = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const IconHospital = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
  </svg>
);

const IconClipboard = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
  </svg>
);

const IconPill = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
  </svg>
);

const IconPlan = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const FEATURE_ICONS = {
  hospitals: IconHospital,
  treatment: IconClipboard,
  medication: IconPill,
  plan: IconPlan,
};

const PATIENT_NAV = CAMPAIGN_MEMBER_MODE
  ? [
      { id: 'dashboard', label: 'Home', Icon: IconHome },
      ...MEMBER_FEATURES.map(({ view, navLabel }) => ({
        id: view,
        label: navLabel,
        Icon: FEATURE_ICONS[view] ?? IconHome,
      })),
    ]
  : [
      { id: 'dashboard', label: 'Dashboard', Icon: IconHome },
      { id: 'plan', label: 'My Plan', Icon: IconPlan },
      { id: 'hospitals', label: 'Hospital Network', Icon: IconHospital },
      { id: 'treatment', label: 'Treatment Plans', Icon: IconClipboard },
      { id: 'medication', label: 'Medication', Icon: IconPill },
    ];

export default function TopNav({ currentView, onNavigate, profile, onEditProfile, onStartOver }) {
  const plan = getPlanFromProfile(profile);
  const subTheme = getPlanSubThemeFromProfile(profile);
  const memberName = profile?.name || 'Member';
  const initial = memberName.charAt(0).toUpperCase();
  const conditionLabels = (profile?.conditions ?? [])
    .map((id) => CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id)
    .slice(0, 2);
  const extraConditions = Math.max(0, (profile?.conditions?.length ?? 0) - conditionLabels.length);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-0 lg:px-10">

        <div className="flex shrink-0 items-center gap-2.5 border-r border-white/10 py-3 pr-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/15">
            <span className="text-sm font-bold text-cyan-300">A</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-white">SaluLink</span>
        </div>

        <nav className="flex flex-1 items-stretch gap-0.5 overflow-x-auto">
          {PATIENT_NAV.map(({ id, label, Icon }) => {
            const active = currentView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                  active
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onEditProfile}
          className="flex shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:border-white/20 hover:bg-white/8"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20 text-xs font-bold text-cyan-300">
            {initial}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-medium leading-tight text-white">{memberName}</p>
            <p className="text-[10px] leading-tight text-slate-400">
              {plan?.label ?? '—'}
              {subTheme ? ` · ${subTheme.label}` : ''}
            </p>
            {conditionLabels.length > 0 && (
              <p className="text-[10px] leading-tight text-slate-500">
                {conditionLabels.join(', ')}
                {extraConditions > 0 ? ` +${extraConditions}` : ''}
              </p>
            )}
          </div>
          <svg className="hidden h-3.5 w-3.5 text-slate-500 sm:block" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {onStartOver && (
          <button
            type="button"
            onClick={onStartOver}
            className="hidden shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-cyan-400/30 hover:text-cyan-300 lg:inline-block"
          >
            Switch scenario
          </button>
        )}

      </div>
    </header>
  );
}
