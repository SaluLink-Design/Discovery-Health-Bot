export default function ResultCard({ title, items, onGetDirections }) {
  return (
    <section className="rounded-3xl border border-slate-200/10 bg-slate-950/60 p-5 shadow-lg shadow-cyan-950/20">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article
            key={`${title}-${item.label}`}
            className="rounded-2xl border border-white/8 bg-white/5 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-100">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{item.detail}</p>
              </div>
              {item.address && onGetDirections && (
                <button
                  type="button"
                  onClick={() => onGetDirections(item.address)}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20 hover:text-cyan-200 active:scale-95"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  Get directions
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
