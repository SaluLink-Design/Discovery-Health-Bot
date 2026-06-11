import {
  formatCurrencyAmount,
  getHouseholdMemberLines,
  getPlanContributionBreakdown,
  getPlanFromProfile,
  getPlanMsaPreview,
  getPlanSubThemeFromProfile,
} from '../lib/profileContext';
import BrandEyebrow from './BrandEyebrow';
import { AUTHI_PURPLE, PATIENT_CLASSES } from '../lib/authiTheme';
import FeaturePageHeader from './FeaturePageHeader';

const AnnualMsaExplainer = ({ lines, monthlyMsaTotal, annualMsaTotal }) => {
  if (!annualMsaTotal || annualMsaTotal <= 0) return null;

  const msaLines = lines.filter((line) => line.msaEach > 0 && line.count > 0);
  if (msaLines.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#E9D5FF] bg-[#FAF5FF] p-4">
      <BrandEyebrow className="!text-xs">Day-to-day savings account (MSA)</BrandEyebrow>
      <p className="mt-1 text-[11px] leading-5 text-[#6B7280]">
        Part of your monthly payment goes into a savings account for day-to-day care (GP visits, medicine, etc.).
        Below is how that monthly amount adds up over a year.
      </p>

      <div className="mt-3 space-y-2">
        {msaLines.map((line) => (
          <div key={line.id} className={PATIENT_CLASSES.innerCard}>
            <p className="text-[11px] font-medium text-[#111827]">{line.label}</p>
            <p className="mt-1 text-[11px] tabular-nums leading-5 text-[#374151]">
              {formatCurrencyAmount(line.msaEach)}
              <span className="text-[#9CA3AF]">/month</span>
              {line.count > 1 && <span className="text-[#9CA3AF]"> × {line.count}</span>}
              <span className="text-[#9CA3AF]"> × 12 months</span>
              <span className="text-[#9CA3AF]"> = </span>
              <span className="font-semibold" style={{ color: AUTHI_PURPLE }}>
                {formatCurrencyAmount(line.annualMsaLine)}/year
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-[#F3F4F6] pt-2 text-xs">
        <p className="text-[#6B7280]">
          Monthly MSA for household:{' '}
          <span className="font-medium text-[#111827] tabular-nums">
            {formatCurrencyAmount(monthlyMsaTotal)}/month
          </span>
        </p>
        <p className="mt-1 font-semibold tabular-nums" style={{ color: AUTHI_PURPLE }}>
          Total annual MSA: {formatCurrencyAmount(annualMsaTotal)}/year
        </p>
      </div>
    </div>
  );
};

const HouseholdBreakdownTable = ({ contributionPreview, msaPreview }) => {
  const lines = getHouseholdMemberLines(contributionPreview);
  if (lines.length === 0) return null;

  const annualTotal = msaPreview?.totalAnnual ?? contributionPreview.savingsTotal * 12;
  const monthlyMsaTotal = contributionPreview.savingsTotal;

  return (
    <div className={PATIENT_CLASSES.card}>
      <BrandEyebrow className="mb-2">Household payment breakdown</BrandEyebrow>
      <p className="mt-2 text-2xl font-semibold text-[#111827]">
        You pay {formatCurrencyAmount(contributionPreview.total)}/month
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#EAECF0]">
        <table className="w-full min-w-[32rem] text-left text-xs">
          <thead>
            <tr className="border-b border-[#EAECF0] bg-[#F9FAFB] text-[10px] uppercase tracking-wider text-[#9CA3AF]">
              <th className="px-3 py-2 font-medium">Who</th>
              <th className="px-3 py-2 font-medium text-center">Count</th>
              <th className="px-3 py-2 font-medium text-right">Contribution</th>
              <th className="px-3 py-2 font-medium text-right">MSA</th>
              <th className="px-3 py-2 font-medium text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="text-[#374151]">
            {lines.map((line) => (
              <tr key={line.id} className="border-b border-[#F3F4F6] last:border-0">
                <td className="px-3 py-2.5">
                  <span className="font-medium text-[#111827]">{line.label}</span>
                  {line.count <= 1 && line.id !== 'main' ? (
                    <p className="mt-0.5 text-[10px] text-[#9CA3AF]">Per person on your plan</p>
                  ) : null}
                  {line.count > 1 ? (
                    <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                      {formatCurrencyAmount(line.contributionEach)} +{' '}
                      {formatCurrencyAmount(line.msaEach)} MSA each
                    </p>
                  ) : line.id === 'main' ? (
                    <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                      {formatCurrencyAmount(line.contributionEach)} +{' '}
                      {formatCurrencyAmount(line.msaEach)} MSA
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-center tabular-nums text-[#111827]">{line.count}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {formatCurrencyAmount(line.contributionLine)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {formatCurrencyAmount(line.msaLine)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums font-medium text-[#111827]">
                  {formatCurrencyAmount(line.totalLine)}
                </td>
              </tr>
            ))}
            <tr className="bg-[#F9FAFB] font-medium text-[#111827]">
              <td className="px-3 py-2.5" colSpan={2}>
                Household total
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {formatCurrencyAmount(contributionPreview.contributionTotal)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {formatCurrencyAmount(contributionPreview.savingsTotal)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: AUTHI_PURPLE }}>
                {formatCurrencyAmount(contributionPreview.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {annualTotal > 0 && (
        <div className="mt-4">
          <AnnualMsaExplainer
            lines={lines}
            monthlyMsaTotal={monthlyMsaTotal}
            annualMsaTotal={annualTotal}
          />
        </div>
      )}

      {contributionPreview.savingsTotal === 0 && (
        <p className="mt-3 text-xs text-[#9CA3AF]">
          This sub-theme has no Medical Savings Account — your full monthly amount is contribution only.
        </p>
      )}
    </div>
  );
};

export default function PlanBreakdownView({ profile, onNavigate }) {
  const plan = getPlanFromProfile(profile);
  const subTheme = getPlanSubThemeFromProfile(profile);
  const contribution = getPlanContributionBreakdown(profile);
  const msaPreview = getPlanMsaPreview(profile);

  const adults = profile?.additionalAdults ?? 0;
  const childCount = profile?.children ?? 0;
  const householdParts = [
    'You (main member)',
    adults > 0 ? `${adults} additional adult${adults > 1 ? 's' : ''}` : null,
    childCount > 0 ? `${childCount} child${childCount > 1 ? 'ren' : ''}` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      <FeaturePageHeader
        eyebrow="What I pay"
        title="What do I pay?"
        description="Your full monthly contribution, day-to-day savings account, and household costs based on your profile."
        onBack={() => onNavigate('dashboard')}
        profileContext={
          plan
            ? `${plan.label}${subTheme ? ` · ${subTheme.label}` : ''} — ${householdParts.join(', ')}`
            : undefined
        }
        sourceNote="Contribution rates from the 2026 Discovery Health contribution table."
      />

      {contribution ? (
        <HouseholdBreakdownTable contributionPreview={contribution} msaPreview={msaPreview} />
      ) : (
        <div className={PATIENT_CLASSES.emptyState}>
          <p className="text-sm text-[#6B7280]">Could not load contribution data for your plan.</p>
        </div>
      )}

      {contribution && (adults > 0 || childCount > 0) && (
        <div className={`${PATIENT_CLASSES.innerCard} text-sm leading-6 text-[#6B7280]`}>
          Per-person rates on this sub-theme: additional adult{' '}
          {formatCurrencyAmount(contribution.monthlyRates.adult)}/month · child{' '}
          {formatCurrencyAmount(contribution.monthlyRates.child)}/month.
        </div>
      )}
    </div>
  );
}
