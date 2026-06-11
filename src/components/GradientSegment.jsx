import { AUTHI_GRADIENT, PATIENT_CLASSES } from '../lib/authiTheme';

/** Toggle segment — active option uses the brand gradient. */
export function GradientSegmentButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active ? PATIENT_CLASSES.segmentActive : PATIENT_CLASSES.segmentInactive
      }
      style={active ? { background: AUTHI_GRADIENT } : undefined}
    >
      {children}
    </button>
  );
}

export function GradientSegmentTrack({ children }) {
  return <div className={PATIENT_CLASSES.segmentTrack}>{children}</div>;
}
