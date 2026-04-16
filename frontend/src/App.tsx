const App = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl shadow-slate-950/70 backdrop-blur-xl">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 border-b border-slate-800 px-6 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-400/40">
              <span className="text-lg font-semibold text-emerald-300">S</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-100">SaluLink</p>
              <p className="text-xs text-slate-400">Discovery Health benefit assistant</p>
            </div>
          </div>

          <div className="hidden items-center gap-3 text-xs text-slate-400 md:flex">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px] shadow-emerald-500/30" />
            <span>Online · Typical response &lt; 5 seconds</span>
          </div>
        </header>

        {/* Body */}
        <div className="grid gap-6 px-4 py-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:px-8 md:py-6">
          {/* Chat */}
          <div className="flex min-h-[380px] flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-slate-100">
                AU
              </span>
              <span>Authi · Discovery Health bot</span>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
              <div className="flex max-w-[85%] flex-col gap-1 rounded-2xl rounded-tl-sm bg-slate-800/90 px-4 py-3 text-sm text-slate-50 shadow-md shadow-slate-950/60">
                <p className="font-medium">Hi, I am Authi.</p>
                <p className="text-slate-300">
                  I can help you understand chronic benefits, treatment baskets, medicine cover and hospital networks on Discovery Health.
                </p>
              </div>

              <div className="ml-auto flex max-w-[80%] flex-col items-end gap-1 rounded-2xl rounded-tr-sm bg-emerald-500/15 px-4 py-3 text-sm text-emerald-50 ring-1 ring-emerald-400/40">
                <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-300">
                  Example member question
                </p>
                <p>
                  What chronic benefits and medicines are usually covered for type 2 diabetes?
                </p>
              </div>

              <div className="flex max-w-[85%] flex-col gap-2 rounded-2xl rounded-tl-sm bg-slate-800/90 px-4 py-3 text-sm text-slate-50 shadow-md shadow-slate-950/60">
                <p className="font-medium">Here is how I will respond:</p>
                <ul className="mt-1 space-y-1 text-slate-300">
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>
                      A clear summary of likely treatment basket items for your condition.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Medicine list guidance and chronic approval hints.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Which hospital networks are usually relevant for planned care.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Input */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 shadow-inner shadow-slate-950/40">
                <input
                  type="text"
                  placeholder="Ask Authi about treatment baskets, chronic medicine or hospital networks…"
                  className="flex-1 border-none bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-medium text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 active:bg-emerald-300 transition-colors"
                >
                  <span>Send</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Authi highlights guidance only. Final cover always depends on your specific
                Discovery Health Medical Scheme plan rules.
              </p>
            </div>
          </div>

          {/* Right rail / prompts */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Try asking about
              </p>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-left text-xs text-slate-100 hover:border-emerald-400/60 hover:bg-slate-900/90 transition-colors"
                >
                  What is usually covered in the treatment basket for type 2 diabetes?
                </button>
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-left text-xs text-slate-100 hover:border-emerald-400/60 hover:bg-slate-900/90 transition-colors"
                >
                  Which chronic medicines are on the formulary for asthma?
                </button>
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-left text-xs text-slate-100 hover:border-emerald-400/60 hover:bg-slate-900/90 transition-colors"
                >
                  Which hospital networks apply for planned admissions on my plan?
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-50 md:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Behind the scenes
              </p>
              <p className="mt-2 text-emerald-50/90">
                Authi uses curated rules plus snippets from Discovery Health PDF documents to
                keep guidance aligned with real benefit structures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
