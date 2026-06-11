import { AUTHI_GRADIENT, PATIENT_CLASSES } from '../lib/authiTheme';
import { PatientButtonPrimary } from './PatientButton';

export default function MemberLanding({ onGetStarted }) {
  return (
    <div className="mx-auto w-full max-w-xl text-center">
      <p
        className="text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{
          background: AUTHI_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Discovery Health · member literacy
      </p>
      <p className={`mt-6 ${PATIENT_CLASSES.body}`}>
        Customise your plan, add your chronic conditions, and learn what Discovery covers — step by step with Authi.
      </p>

      <PatientButtonPrimary type="button" onClick={onGetStarted} className="mt-8 w-full sm:w-auto">
        Get started
      </PatientButtonPrimary>

      <p className="mt-8 text-xs text-[#9CA3AF]">
        For testing — use any details you like. Nothing is sent to Discovery Health.
      </p>
    </div>
  );
}
