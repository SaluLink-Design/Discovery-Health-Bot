/** Authi / SaluLink brand tokens — horizontal blue → purple gradient. */

/** Primary CTA & active nav — left cyan to right magenta (matches SaluLink clinical UI). */
export const AUTHI_GRADIENT =
  'linear-gradient(90deg, #49A6FD 0%, #6B8CF7 38%, #9F62ED 72%, #CB6CEC 100%)';

/** Soft tint for cards, chips, section backgrounds. */
export const AUTHI_GRADIENT_SOFT =
  'linear-gradient(90deg, rgba(73,166,253,0.16) 0%, rgba(159,98,237,0.12) 55%, rgba(203,108,236,0.08) 100%)';

/** Section header bars — horizontal fade (care covered screen). */
export const AUTHI_SECTION_GRADIENTS = {
  purple:
    'linear-gradient(90deg, rgba(159,98,237,0.24) 0%, rgba(159,98,237,0.08) 55%, rgba(255,255,255,0.9) 100%)',
  blue:
    'linear-gradient(90deg, rgba(73,166,253,0.24) 0%, rgba(73,166,253,0.08) 55%, rgba(255,255,255,0.9) 100%)',
  amber:
    'linear-gradient(90deg, rgba(251,191,36,0.28) 0%, rgba(251,191,36,0.1) 55%, rgba(255,255,255,0.95) 100%)',
};

export const AUTHI_BLUE = '#49A6FD';
export const AUTHI_PURPLE = '#9F62ED';
export const AUTHI_MAGENTA = '#CB6CEC';

export const PATIENT_FONT =
  'Helvetica, Arial, system-ui, sans-serif';

export const PATIENT_COLORS = {
  pageBg: '#F4F5F8',
  cardBg: '#FFFFFF',
  cardBorder: '#EAECF0',
  divider: '#F3F4F6',
  inputBg: '#F9FAFB',
  inputBorder: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  heroBg: 'linear-gradient(135deg, #0D0F1C 0%, #1A1D35 100%)',
};

/** Gradient text (eyebrows, labels). */
export const authiGradientTextStyle = {
  display: 'inline-block',
  background: AUTHI_GRADIENT,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

/** Selected chip / segment — full brand gradient pill. */
export const authiChipActiveStyle = {
  background: AUTHI_GRADIENT,
  color: '#FFFFFF',
  fontWeight: 600,
  border: 'none',
  boxShadow: '0 2px 10px rgba(159,98,237,0.28)',
};

/** Shared Tailwind class strings for the patient prototype. */
export const PATIENT_CLASSES = {
  card: 'rounded-2xl border border-[#EAECF0] bg-white p-6 shadow-sm',
  cardLg: 'rounded-2xl border border-[#EAECF0] bg-white p-8 shadow-sm',
  input:
    'w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#9F62ED] focus:ring-1 focus:ring-[#9F62ED]/25',
  select:
    'w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm text-[#111827] outline-none focus:border-[#9F62ED] focus:ring-1 focus:ring-[#9F62ED]/25 appearance-none',
  label: 'mb-1.5 block text-xs font-medium text-[#6B7280]',
  eyebrow: 'text-[11px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF]',
  pageTitle: 'text-3xl font-semibold text-[#111827]',
  body: 'text-sm leading-6 text-[#6B7280]',
  backLink:
    'mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7280] transition hover:text-[#9F62ED]',
  emptyState:
    'flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] py-16 text-center',
  errorBox: 'rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800',
  hintBox: 'rounded-2xl border border-[#EAECF0] bg-[#F9FAFB] p-4 text-sm leading-6 text-[#374151]',
  segmentTrack: 'flex rounded-full border border-[#E5E7EB] bg-[#F9FAFB] p-0.5',
  segmentActive: 'rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm',
  segmentInactive:
    'rounded-full px-3 py-1 text-xs font-medium text-[#6B7280] transition hover:text-[#111827]',
  chip:
    'rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] transition hover:border-[#9F62ED]/40',
  chipSelected: 'rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-sm',
  innerCard: 'rounded-xl border border-[#F3F4F6] bg-[#F9FAFB] p-4',
};

export const patientCardStyle = {
  background: PATIENT_COLORS.cardBg,
  border: `1px solid ${PATIENT_COLORS.cardBorder}`,
  boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
};

export const patientBtnPrimaryStyle = {
  background: AUTHI_GRADIENT,
  color: '#FFFFFF',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(159,98,237,0.32)',
};

export const patientBtnSecondaryStyle = {
  border: '1px solid #E5E7EB',
  background: '#FFFFFF',
  color: '#374151',
  fontWeight: 500,
  cursor: 'pointer',
};
