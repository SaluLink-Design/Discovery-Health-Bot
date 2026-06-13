import { useEffect, useState } from 'react';
import { CAMPAIGN_MODULES } from '../lib/campaignLiteracy';
import {
  getCampaignProgressSummary,
  shouldShowSavePrompt,
} from '../lib/campaignStore';
import { AUTHI_GRADIENT, AUTHI_GRADIENT_SOFT, AUTHI_PURPLE, PATIENT_COLORS } from '../lib/authiTheme';
import BrandEyebrow from './BrandEyebrow';
import CampaignCompleteModal from './CampaignCompleteModal';

const CheckIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

export default function CampaignProgressCard({
  profile,
  onNavigate,
  refreshKey = 0,
  onRetakeJourney,
  onRetakeModuleQuiz,
}) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [progress, setProgress] = useState(() => getCampaignProgressSummary(profile));

  useEffect(() => {
    setProgress(getCampaignProgressSummary(profile));
    if (shouldShowSavePrompt()) {
      setShowSaveModal(true);
    }
  }, [profile, refreshKey]);

  if (progress.total === 0) return null;

  const cardStyle = {
    background: PATIENT_COLORS.cardBg,
    border: `1px solid ${PATIENT_COLORS.cardBorder}`,
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
  };

  return (
    <>
      <div className="mb-5 rounded-2xl p-6" style={cardStyle}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <BrandEyebrow>Literacy journey</BrandEyebrow>
            <p className="mt-1 text-sm font-semibold text-[#111827]">
              {progress.completed} of {progress.total} modules complete
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onRetakeJourney && progress.completed > 0 && (
              <button
                type="button"
                onClick={onRetakeJourney}
                className="rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: '#6B7280',
                  cursor: 'pointer',
                }}
              >
                Retake all
              </button>
            )}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: AUTHI_GRADIENT }}
            >
              {progress.completed}/{progress.total}
            </div>
          </div>
        </div>

        <div className="mb-2 h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(progress.completed / progress.total) * 100}%`,
              background: AUTHI_GRADIENT,
            }}
          />
        </div>

        <div className="mt-4 space-y-2">
          {progress.items.map((item) => {
            const meta = CAMPAIGN_MODULES[item.id];
            const done = item.completed || item.skipped;
            const isNext = progress.nextModuleId === item.id;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{
                  background: isNext ? AUTHI_GRADIENT_SOFT : '#F9FAFB',
                  border: isNext ? '1px solid #E9D5FF' : '1px solid #EAECF0',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: done ? AUTHI_GRADIENT : '#E5E7EB',
                      color: done ? '#fff' : '#6B7280',
                    }}
                  >
                    {done ? <CheckIcon /> : '·'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827]">{meta?.title ?? item.id}</p>
                    {item.skipped && (
                      <p className="text-xs text-[#9CA3AF]">Skipped</p>
                    )}
                    {item.completed && !item.skipped && (
                      <p className="text-xs text-[#9CA3AF]">
                        Score {item.score}/{item.total}
                      </p>
                    )}
                    {isNext && !done && (
                      <p className="text-xs font-medium" style={{ color: AUTHI_PURPLE }}>
                        Start here
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {!done && (
                    <button
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                      style={{ background: AUTHI_GRADIENT, border: 'none', cursor: 'pointer' }}
                    >
                      {isNext ? 'Start' : 'Open'}
                    </button>
                  )}
                  {done && (
                    <>
                      <button
                        type="button"
                        onClick={() => onNavigate(item.id)}
                        className="text-xs font-medium text-[#9F62ED] hover:underline"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Explore
                      </button>
                      {onRetakeModuleQuiz && (
                        <button
                          type="button"
                          onClick={() => onRetakeModuleQuiz(item.id)}
                          className="text-[10px] text-[#9CA3AF] hover:text-[#9F62ED] hover:underline"
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Retake quiz
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {progress.allDone && (
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className="mt-4 w-full rounded-xl py-3 text-sm font-semibold text-white"
            style={{ background: AUTHI_GRADIENT, border: 'none', cursor: 'pointer' }}
          >
            Scan survey QR
          </button>
        )}
      </div>

      {showSaveModal && (
        <CampaignCompleteModal
          profile={profile}
          onClose={() => setShowSaveModal(false)}
          onSaved={() => {
            setShowSaveModal(false);
            setProgress(getCampaignProgressSummary(profile));
          }}
        />
      )}
    </>
  );
}
