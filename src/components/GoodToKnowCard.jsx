import BrandEyebrow from './BrandEyebrow';
import { PatientButtonPrimary } from './PatientButton';

const TONE_STYLES = {
  amber: {
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    title: 'text-amber-900',
    body: 'text-[#374151]',
    step: 'text-[#6B7280]',
  },
  authi: {
    border: 'border-[#E9D5FF]',
    bg: 'bg-[#FAF5FF]',
    title: 'text-[#111827]',
    body: 'text-[#374151]',
    step: 'text-[#6B7280]',
  },
  violet: {
    border: 'border-[#E9D5FF]',
    bg: 'bg-[#FAF5FF]',
    title: 'text-[#111827]',
    body: 'text-[#374151]',
    step: 'text-[#6B7280]',
  },
  cyan: {
    border: 'border-sky-200',
    bg: 'bg-sky-50',
    title: 'text-sky-900',
    body: 'text-[#374151]',
    step: 'text-[#6B7280]',
  },
  emerald: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    title: 'text-emerald-900',
    body: 'text-[#374151]',
    step: 'text-[#6B7280]',
  },
};

export default function GoodToKnowCard({
  title,
  body,
  nextSteps = [],
  tone = 'authi',
  action,
}) {
  const styles = TONE_STYLES[tone] ?? TONE_STYLES.authi;

  return (
    <div className={`rounded-2xl border px-5 py-4 ${styles.border} ${styles.bg}`}>
      <BrandEyebrow className="!text-[10px] !tracking-[0.18em]">Good to know</BrandEyebrow>
      {title && (
        <p className={`mt-2 text-sm font-semibold leading-snug ${styles.title}`}>{title}</p>
      )}
      {body && (
        <p className={`mt-2 text-sm leading-6 ${styles.body}`}>{body}</p>
      )}
      {nextSteps.length > 0 && (
        <ul className={`mt-3 space-y-1.5 text-xs leading-5 ${styles.step}`}>
          {nextSteps.map((step) => (
            <li key={step} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
              {step}
            </li>
          ))}
        </ul>
      )}
      {action && <div className="mt-4">{action}</div>}
      <p className="mt-3 text-[10px] text-[#9CA3AF]">
        Prototype guidance — always confirm with Discovery Health directly.
      </p>
    </div>
  );
}

export function GoodToKnowActionButton({ children, onClick }) {
  return (
    <PatientButtonPrimary className="!px-4 !py-2 !text-xs" onClick={onClick}>
      {children}
    </PatientButtonPrimary>
  );
}
