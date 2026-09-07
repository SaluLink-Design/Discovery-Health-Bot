import { useEffect, useRef, useState } from 'react';
import {
  AUTHI_GRADIENT,
  PATIENT_COLORS,
  PATIENT_FONT,
  patientBtnPrimaryStyle,
} from '../lib/authiTheme';
import { askAuthi, chatSuggestions } from '../lib/authiChat';
import { getPlanHospitalNetworks } from '../lib/profileContext';
import { SCHEME_SOURCE_NOTE } from '../lib/campaignConfig';
import BrandEyebrow from './BrandEyebrow';
import AuthiOrb from './AuthiOrb';

const SendIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.77 59.77 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
  </svg>
);

const formatAnswer = (text) =>
  (text ?? '')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');

export default function AuthiChatView({ profile }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const scrollerRef = useRef(null);
  const suggestions = chatSuggestions(profile);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, busy]);

  const send = async (raw) => {
    const query = raw.trim();
    if (!query || busy) return;

    const history = messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .map((message) => ({ role: message.role, content: message.content }));

    setInput('');
    setError(null);
    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: 'user', content: query },
    ]);
    setBusy(true);

    try {
      const result = await askAuthi({
        query,
        profile,
        history,
        networkCodes: getPlanHospitalNetworks(profile),
      });
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: formatAnswer(result.answer || result.summary || 'I could not find an answer in the 2026 guides.'),
          sources: result.sources ?? [],
          llmOk: result.llm?.ok ?? false,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authi could not reach the server.');
      setMessages((current) => [
        ...current,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: 'I could not reach the Authi backend. Check that the Python API is running on port 8000.',
          failed: true,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    send(input);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ fontFamily: PATIENT_FONT }}>
      <div className="mb-4 shrink-0">
        <BrandEyebrow>Ask Authi</BrandEyebrow>
        <h2
          className="mt-2"
          style={{ fontSize: '28px', fontWeight: 700, color: PATIENT_COLORS.textPrimary }}
        >
          Chat about your cover
        </h2>
        <p className="mt-1" style={{ fontSize: '14px', color: PATIENT_COLORS.textSecondary }}>
          Authi answers from the 2026 medicine list, hospital network list, treatment baskets, and contribution table — grounded in your profile.
        </p>
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl"
        style={{
          background: PATIENT_COLORS.cardBg,
          border: `1px solid ${PATIENT_COLORS.cardBorder}`,
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div ref={scrollerRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-8 text-center">
              <AuthiOrb size={72} />
              <p className="mt-4 text-sm font-medium" style={{ color: PATIENT_COLORS.textPrimary }}>
                Ask about care, medicines, hospitals, or what you pay.
              </p>
              <p className="mt-1 max-w-md text-xs" style={{ color: PATIENT_COLORS.textMuted }}>
                Authi uses retrieved scheme data first, then gpt-oss to explain it. It will not invent cover.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {suggestions.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => send(prompt)}
                    className="rounded-full px-3 py-1.5 text-left text-xs font-medium"
                    style={{
                      border: '1px solid #E5E7EB',
                      background: '#F9FAFB',
                      color: PATIENT_COLORS.textPrimary,
                      cursor: 'pointer',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-3"
                  style={
                    isUser
                      ? {
                          background: AUTHI_GRADIENT,
                          color: '#FFFFFF',
                          boxShadow: '0 4px 14px rgba(159,98,237,0.28)',
                        }
                      : {
                          background: message.failed ? '#FEF2F2' : '#F4F5F8',
                          color: PATIENT_COLORS.textPrimary,
                          border: `1px solid ${message.failed ? '#FECACA' : PATIENT_COLORS.cardBorder}`,
                        }
                  }
                >
                  <p
                    className="whitespace-pre-wrap text-sm leading-6"
                    style={{ color: isUser ? '#FFFFFF' : PATIENT_COLORS.textPrimary }}
                  >
                    {message.content}
                  </p>
                  {!isUser && message.sources?.length > 0 && (
                    <p
                      className="mt-2 text-[11px]"
                      style={{ color: PATIENT_COLORS.textMuted }}
                    >
                      Sources: {message.sources.map((source) => source.source).filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {busy && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl px-4 py-3 text-sm"
                style={{
                  background: '#F4F5F8',
                  color: PATIENT_COLORS.textSecondary,
                  border: `1px solid ${PATIENT_COLORS.cardBorder}`,
                }}
              >
                Authi is checking the 2026 guides…
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t px-4 py-3"
          style={{ borderColor: PATIENT_COLORS.cardBorder }}
        >
          {error && (
            <p className="mb-2 text-xs" style={{ color: '#B91C1C' }}>
              {error}
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  send(input);
                }
              }}
              rows={2}
              placeholder="Ask Authi about cover, medicines, hospitals, or contributions…"
              className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                background: PATIENT_COLORS.inputBg,
                border: `1px solid ${PATIENT_COLORS.inputBorder}`,
                color: PATIENT_COLORS.textPrimary,
                fontFamily: PATIENT_FONT,
              }}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                ...patientBtnPrimaryStyle,
                opacity: busy || !input.trim() ? 0.5 : 1,
              }}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
          <p className="mt-2 text-[11px]" style={{ color: PATIENT_COLORS.textMuted }}>
            {SCHEME_SOURCE_NOTE}
          </p>
        </form>
      </div>
    </div>
  );
}
