import { AUTHI_GRADIENT, patientBtnPrimaryStyle, patientBtnSecondaryStyle } from '../lib/authiTheme';

export function PatientButtonPrimary({
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded-xl px-5 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={patientBtnPrimaryStyle}
      {...props}
    >
      {children}
    </button>
  );
}

export function PatientButtonSecondary({
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded-xl px-5 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={patientBtnSecondaryStyle}
      {...props}
    >
      {children}
    </button>
  );
}

export function PatientEyebrow({ children, gradient = false }) {
  if (gradient) {
    return (
      <p
        className="text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{
          display: 'inline-block',
          background: AUTHI_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {children}
      </p>
    );
  }
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]">
      {children}
    </p>
  );
}
