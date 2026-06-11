import { CAMPAIGN_MEMBER_MODE } from '../lib/campaignConfig';
import { AUTHI_GRADIENT, PATIENT_FONT } from '../lib/authiTheme';
import { MEMBER_FEATURES } from '../lib/memberFeatures';
import AuthiOrb from './AuthiOrb';
import SaluLinkWordmark from './SaluLinkWordmark';

const PATIENT_NAV = CAMPAIGN_MEMBER_MODE
  ? [
      { id: 'dashboard', label: 'Home' },
      ...MEMBER_FEATURES.map(({ view, navLabel }) => ({
        id: view,
        label: navLabel,
      })),
    ]
  : [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'plan', label: 'My Plan' },
      { id: 'hospitals', label: 'Hospital Network' },
      { id: 'treatment', label: 'Treatment Plans' },
      { id: 'medication', label: 'Medication' },
    ];

export default function PatientSidebar({
  currentView,
  onNavigate,
  browseAllConditions = false,
  onBrowseAllConditionsChange,
}) {
  const showBrowseToggle =
    onBrowseAllConditionsChange &&
    (currentView === 'treatment' || currentView === 'medication');

  return (
    <aside
      className="flex h-full w-56 shrink-0 flex-col"
      style={{ background: '#000000', fontFamily: PATIENT_FONT }}
    >
      <div className="px-5 pt-6 pb-0" style={{ minHeight: 52 }}>
        <SaluLinkWordmark size="md" />
      </div>

      <div className="flex flex-col items-center px-4 pt-6 pb-5">
        <AuthiOrb size={90} />
        <p
          className="mt-4 text-center"
          style={{
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          Powered by{' '}
          <span
            style={{
              display: 'inline-block',
              background: AUTHI_GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
            }}
          >
            Authi
          </span>
        </p>
      </div>

      <div
        style={{
          height: 1,
          background: 'rgba(255,255,255,0.1)',
          marginLeft: 20,
          marginRight: 20,
          marginBottom: 20,
        }}
      />

      <nav className="flex flex-1 flex-col gap-1 px-4 pb-6">
        {PATIENT_NAV.map(({ id, label }) => {
          const active = currentView === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className="w-full rounded-full px-4 py-3 text-left transition-all"
              style={{
                background: active ? AUTHI_GRADIENT : 'transparent',
                color: active ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                fontSize: '15px',
                fontWeight: active ? 700 : 400,
                border: 'none',
                cursor: 'pointer',
                boxShadow: active ? '0 4px 16px rgba(159,98,237,0.35)' : 'none',
              }}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {showBrowseToggle && (
        <div
          className="mt-auto px-4 pb-6"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 16,
            marginLeft: 4,
            marginRight: 4,
          }}
        >
          <button
            type="button"
            onClick={() => onBrowseAllConditionsChange((v) => !v)}
            className="w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '13px',
              fontWeight: 400,
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
            }}
          >
            {browseAllConditions ? '← My profile conditions' : 'Browse all conditions'}
          </button>
        </div>
      )}
    </aside>
  );
}
