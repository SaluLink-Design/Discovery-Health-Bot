import { AUTHI_GRADIENT, PATIENT_FONT } from '../lib/authiTheme';

/** Salu (white) + Link (gradient) — matches brand lockup. */
export default function SaluLinkWordmark({ size = 'md', className = '' }) {
  const fontSize = size === 'sm' ? 15 : size === 'lg' ? 22 : 18;

  return (
    <span
      className={`inline-flex items-baseline font-bold tracking-tight ${className}`}
      style={{ fontFamily: PATIENT_FONT, fontSize, lineHeight: 1 }}
    >
      <span style={{ color: '#FFFFFF' }}>Salu</span>
      <span
        style={{
          background: AUTHI_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Link
      </span>
    </span>
  );
}
