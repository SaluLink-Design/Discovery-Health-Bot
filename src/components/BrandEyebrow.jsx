import { authiGradientTextStyle } from '../lib/authiTheme';

/** Uppercase gradient label — Authi, Chronic Care, Medicines, section headers. */
export default function BrandEyebrow({ children, className = '' }) {
  return (
    <p
      className={`text-[11px] font-bold uppercase tracking-[0.12em] ${className}`}
      style={authiGradientTextStyle}
    >
      {children}
    </p>
  );
}
