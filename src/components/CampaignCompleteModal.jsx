import { useState } from 'react';
import { submitCampaignSave } from '../lib/campaignApi';
import { markCampaignSaved } from '../lib/campaignStore';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { AUTHI_GRADIENT, PATIENT_COLORS } from '../lib/authiTheme';
import { PatientButtonPrimary, PatientButtonSecondary } from './PatientButton';

export default function CampaignCompleteModal({ profile, onClose, onSaved }) {
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const result = await submitCampaignSave({ profile, email });
    if (!result.ok && result.mode === 'local') {
      markCampaignSaved(email.trim() || null);
      setSaved(true);
      setSaving(false);
      onSaved?.();
      return;
    }
    if (!result.ok) {
      setError(result.error ?? 'Could not save. Try again.');
      setSaving(false);
      return;
    }
    markCampaignSaved(email.trim() || null);
    setSaved(true);
    setSaving(false);
    onSaved?.();
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
        {saved ? (
          <>
            <h2 className="text-lg font-semibold text-[#111827]">Thank you</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Your literacy results have been saved
              {isSupabaseConfigured ? ' to our research database' : ' locally for this device'}.
              {email.trim() ? ' We will be in touch about MVP updates.' : ''}
            </p>
            <PatientButtonPrimary type="button" onClick={onClose} className="mt-6 w-full">
              Continue exploring
            </PatientButtonPrimary>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-[#111827]">Save your results</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              We save anonymous quiz results to improve medical scheme literacy tools.
              No name or ID number is stored — only your answers and session.
            </p>

            <label className="mt-5 block text-xs font-medium text-[#6B7280]">
              Email (optional — for MVP updates)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm outline-none focus:border-[#9F62ED]"
            />

            {error && (
              <p className="mt-2 text-xs text-red-600">{error}</p>
            )}

            <p className="mt-3 text-xs text-[#9CA3AF]">
              By saving, you agree we may use anonymised responses for literacy research.
              Email is only used if you opt in above.
            </p>

            <div className="mt-6 flex gap-3">
              <PatientButtonPrimary
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Saving…' : email.trim() ? 'Save & opt in' : 'Save results'}
              </PatientButtonPrimary>
              <PatientButtonSecondary type="button" onClick={onClose}>
                Later
              </PatientButtonSecondary>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
