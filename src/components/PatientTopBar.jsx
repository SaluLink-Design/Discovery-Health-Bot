import { useEffect, useRef, useState } from 'react';
import { CDL_CONDITIONS } from '../data/authiData';
import { DEFAULT_PERSONA_NAME } from '../data/demoCharacters';
import { AUTHI_GRADIENT, PATIENT_COLORS, PATIENT_FONT } from '../lib/authiTheme';
import {
  getPlanFromProfile,
  getPlanSubThemeFromProfile,
} from '../lib/profileContext';

const ChevronDown = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const getConditionLabel = (id) =>
  CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id;

export default function PatientTopBar({
  profile,
  activeConditionId,
  onActiveConditionChange,
  onStartOver,
  onRetakeJourney,
}) {
  const persona = profile?.name?.trim() || DEFAULT_PERSONA_NAME;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const plan = getPlanFromProfile(profile);
  const subTheme = getPlanSubThemeFromProfile(profile);
  const planLabel = [plan?.label, subTheme?.label].filter(Boolean).join(' · ');
  const profileConditions = profile?.conditions ?? [];
  const activeLabel = activeConditionId ? getConditionLabel(activeConditionId) : null;
  const hasMultipleConditions = profileConditions.length > 1;

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header
      className="flex shrink-0 items-center justify-between px-8 py-4"
      style={{
        background: '#FFFFFF',
        borderBottom: `1px solid ${PATIENT_COLORS.cardBorder}`,
        fontFamily: PATIENT_FONT,
      }}
    >
      <div>
        <p
          style={{
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: PATIENT_COLORS.textMuted,
            fontWeight: 600,
          }}
        >
          {persona ? `${persona}'s plan` : 'Plan'}
        </p>
        <p
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: PATIENT_COLORS.textPrimary,
            marginTop: 1,
          }}
        >
          {subTheme?.label ?? plan?.label ?? 'Your plan'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {planLabel && (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
            style={{
              border: '1px solid #E5E7EB',
              background: '#F9FAFB',
              color: PATIENT_COLORS.textSecondary,
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'default',
            }}
          >
            {planLabel}
          </button>
        )}

        {activeLabel && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => hasMultipleConditions && setMenuOpen((open) => !open)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
              style={{
                background: AUTHI_GRADIENT,
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: hasMultipleConditions ? 'pointer' : 'default',
              }}
              aria-expanded={menuOpen}
              aria-haspopup={hasMultipleConditions ? 'listbox' : undefined}
            >
              {activeLabel}
              {hasMultipleConditions && <ChevronDown />}
            </button>

            {menuOpen && hasMultipleConditions && (
              <div
                className="absolute right-0 z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl py-1"
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${PATIENT_COLORS.cardBorder}`,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}
                role="listbox"
              >
                {profileConditions.map((id) => {
                  const selected = id === activeConditionId;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onActiveConditionChange?.(id);
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm transition hover:bg-gray-50"
                      style={{
                        color: selected ? '#9F62ED' : PATIENT_COLORS.textPrimary,
                        fontWeight: selected ? 600 : 400,
                        background: selected ? 'rgba(159,98,237,0.06)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {getConditionLabel(id)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {onRetakeJourney && (
          <button
            type="button"
            onClick={onRetakeJourney}
            className="rounded-lg px-4 py-1.5"
            style={{
              border: '1px solid #E9D5FF',
              background: '#FAF5FF',
              color: '#9F62ED',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            New journey
          </button>
        )}
        {onStartOver && (
          <button
            type="button"
            onClick={onStartOver}
            className="rounded-lg px-4 py-1.5"
            style={{
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              color: '#374151',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Change character
          </button>
        )}
      </div>
    </header>
  );
}
