import { useCallback, useEffect, useState } from 'react';
import MyCoveragePanel from './components/MyCoveragePanel';
import PatientProfilePanel from './components/PatientProfilePanel';
import QuickPromptList from './components/QuickPromptList';
import ResultCard from './components/ResultCard';
import { CDL_CONDITIONS, DISCOVERY_PLANS, authiKnowledgeBase, quickPrompts } from './data/authiData';
import { loadProfile, saveProfile } from './lib/profileStore';

const DEFAULT_QUERY = 'What treatment benefits are available for diabetes?';

const emptyResult = {
  intent: 'general',
  condition: null,
  headline: 'Loading Authi...',
  summary: 'Connecting to the backend service.',
  sections: [],
  sources: [],
  hints: [],
};

const buildProfileContext = (profile) => {
  if (!profile) return '';
  const plan = DISCOVERY_PLANS.find((p) => p.id === profile.plan);
  const conditionLabels = (profile.conditions ?? [])
    .map((id) => CDL_CONDITIONS.find((c) => c.id === id)?.label ?? id)
    .join(', ');
  const planLabel = plan?.label ?? profile.plan;
  const base = `I am on the Discovery Health ${planLabel} plan.`;
  const conditionSuffix = conditionLabels
    ? ` I have the following chronic conditions: ${conditionLabels}.`
    : '';
  return base + conditionSuffix + ' ';
};

export default function App() {
  const [profile, setProfile] = useState(() => loadProfile());
  const [isEditingProfile, setIsEditingProfile] = useState(!loadProfile());

  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState(emptyResult);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const submitQuery = useCallback(async (nextQuery, currentProfile, meta = {}) => {
    setLoading(true);
    setError('');
    const context = buildProfileContext(currentProfile);
    const contextualQuery = context ? `${context}${nextQuery}` : nextQuery;

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: contextualQuery, ...meta }),
      });

      if (!response.ok) throw new Error('Authi could not reach the backend.');
      const data = await response.json();
      setResult(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    submitQuery(DEFAULT_QUERY, loadProfile());
  }, [submitQuery]);

  const handleSubmit = (event) => {
    event.preventDefault();
    submitQuery(query, profile);
  };

  const handleQuickPrompt = (prompt) => {
    setQuery(prompt);
    submitQuery(prompt, profile);
  };

  const handleProfileSave = (newProfile) => {
    saveProfile(newProfile);
    setProfile(newProfile);
    setIsEditingProfile(false);
  };

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
  };

  const handleCoverageAsk = (prompt, meta = {}) => {
    setQuery(prompt);
    submitQuery(prompt, profile, meta);
    document.getElementById('authi-query')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#164e63,_#020617_45%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">

        {/* Patient Profile */}
        <PatientProfilePanel
          onSave={handleProfileSave}
          onEdit={handleProfileEdit}
          isEditing={isEditingProfile}
          savedProfile={profile}
        />

        {/* My Coverage — shown only when profile is saved */}
        {profile && !isEditingProfile && (
          <MyCoveragePanel profile={profile} onAsk={handleCoverageAsk} />
        )}

        {/* Ask Authi */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Authi 1.0 Inspired
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Discovery Health guidance, reimagined as a React assistant.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              This app turns the notebook&apos;s <code className="rounded bg-white/10 px-1 text-cyan-200">AuthiEngine</code> idea into a web experience that
              helps members explore treatment baskets, chronic medicine guidance, and hospital
              network rules from the supplied Discovery Health PDFs.
            </p>

            {profile && (
              <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-400/8 px-4 py-3 text-xs text-cyan-200">
                <span className="font-semibold">Profile context active</span> — Authi will consider your{' '}
                {DISCOVERY_PLANS.find((p) => p.id === profile.plan)?.label} plan
                {profile.conditions?.length > 0
                  ? ` and ${profile.conditions.length} chronic condition${profile.conditions.length > 1 ? 's' : ''}`
                  : ''}
                {' '}when answering.
              </div>
            )}

            <form
              className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-4"
              onSubmit={handleSubmit}
            >
              <label htmlFor="authi-query" className="text-sm font-medium text-slate-200">
                Ask Authi about your benefit question
              </label>
              <textarea
                id="authi-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                rows={4}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500"
                placeholder="Ask about diabetes treatment, asthma medicine cover, or hospital networks..."
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  {loading ? 'Asking Authi...' : 'Ask Authi'}
                </button>
                <span className="text-sm text-slate-400">
                  Backend API: <code className="rounded bg-white/10 px-1 text-xs">localhost:8000</code>
                </span>
              </div>
              <div className="mt-4">
                <QuickPromptList prompts={quickPrompts} onSelect={handleQuickPrompt} />
              </div>
            </form>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/8 p-8 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Knowledge sources</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              {authiKnowledgeBase.documentSources.map((source) => (
                <li key={source} className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
                  {source}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
              This is a prototype assistant based on the notebook and supplied PDFs. Members should
              still confirm final benefit rules, authorisation requirements, and plan-specific cover.
            </div>
          </aside>
        </section>

        {/* Authi Response */}
        <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Authi response</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">{result.headline}</h2>
            <p className="mt-3 text-base leading-7 text-slate-300">{result.summary}</p>
            {Array.isArray(result.hints) && result.hints.length ? (
              <div className="mt-4 space-y-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-50">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  Quick context
                </p>
                {result.hints.map((hint, index) => (
                  <p key={`hint-${index}`} className="text-cyan-50/95">
                    {hint}
                  </p>
                ))}
              </div>
            ) : null}
            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-300/30 bg-rose-400/10 p-4 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Detected intent</p>
                <p className="mt-2 text-lg font-medium text-white">{result.intent}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Detected condition</p>
                <p className="mt-2 text-lg font-medium text-white">{result.condition ?? 'General query'}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            {result.sections.map((section, index) => (
              <ResultCard
                key={`${section.title}-${index}`}
                title={section.title}
                items={section.items}
              />
            ))}
            {result.sources?.length ? (
              <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-lg shadow-cyan-950/20">
                <h3 className="text-lg font-semibold text-white">PDF-backed snippets</h3>
                <div className="mt-4 space-y-3">
                  {result.sources.map((source) => (
                    <article
                      key={`${source.documentId}-${source.source}`}
                      className="rounded-2xl border border-white/8 bg-white/5 p-4"
                    >
                      <p className="font-medium text-slate-100">{source.source}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{source.excerpt}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
