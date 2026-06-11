import AuthiOrb from './AuthiOrb';
import SaluLinkWordmark from './SaluLinkWordmark';
import { AUTHI_GRADIENT, PATIENT_COLORS, PATIENT_FONT } from '../lib/authiTheme';

export default function SetupLayout({ children, footer, showSidebar = false }) {
  return (
    <div
      className="flex min-h-screen"
      style={{ fontFamily: PATIENT_FONT, background: PATIENT_COLORS.pageBg }}
    >
      {showSidebar && (
      <aside
        className="hidden w-56 shrink-0 flex-col lg:flex"
        style={{ background: '#000000' }}
      >
        <div className="px-5 pt-6">
          <SaluLinkWordmark size="md" />
        </div>
        <div className="flex flex-col items-center px-4 pt-8">
          <AuthiOrb size={72} />
          <p className="mt-4 text-center text-sm text-white">
            Powered by{' '}
            <span
              style={{
                fontWeight: 700,
                background: AUTHI_GRADIENT,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Authi
            </span>
          </p>
        </div>
      </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center justify-between border-b px-6 py-4 lg:px-10"
          style={{
            background: '#FFFFFF',
            borderColor: PATIENT_COLORS.cardBorder,
          }}
        >
          <SaluLinkWordmark size="sm" className="lg:hidden" />
          <p className="hidden text-sm text-[#6B7280] lg:block">
            Patient Aid · Discovery Health prototype
          </p>
          <span className="text-xs text-[#9CA3AF]">Not linked to Discovery Health</span>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 lg:px-10">
          {children}
        </main>

        {footer && (
          <footer className="border-t px-6 py-4 text-center text-xs text-[#9CA3AF]" style={{ borderColor: PATIENT_COLORS.cardBorder }}>
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
