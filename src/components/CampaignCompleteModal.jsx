import { submitCampaignSave } from '../lib/campaignApi';
import { markCampaignSaved } from '../lib/campaignStore';
import { CUSTOMER_SURVEY_QR_SRC } from '../lib/surveyConfig';
import { PATIENT_COLORS } from '../lib/authiTheme';
import { PatientButtonSecondary } from './PatientButton';

export default function CampaignCompleteModal({ profile, onClose, onSaved }) {
  const handleSkip = async () => {
    await submitCampaignSave({ profile, email: '' });
    markCampaignSaved(null);
    onSaved?.();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: PATIENT_COLORS.cardBg,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
      >
        <h2 className="text-lg font-semibold text-[#111827]">Optional feedback survey</h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Thanks for completing the literacy quizzes. Scan the QR code with your phone to share
          quick feedback on the MVP — completely optional.
        </p>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          Responses are anonymised. No name or ID number is required.
        </p>

        <div className="mt-5 flex flex-col items-center rounded-2xl border border-[#E9D5FF] bg-white px-6 py-5">
          <img
            src={CUSTOMER_SURVEY_QR_SRC}
            alt="Scan to open the SaluLink feedback survey"
            className="h-44 w-44 object-contain"
          />
          <p className="mt-3 text-center text-xs font-medium text-[#374151]">
            Scan with your camera app
          </p>
        </div>

        <PatientButtonSecondary type="button" onClick={handleSkip} className="mt-6 w-full">
          Skip
        </PatientButtonSecondary>
      </div>
    </div>
  );
}
