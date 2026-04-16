export default function ResultCard({ title, items }) {
  return (
    <section className="rounded-3xl border border-slate-200/10 bg-slate-950/60 p-5 shadow-lg shadow-cyan-950/20">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article
            key={`${title}-${item.label}`}
            className="rounded-2xl border border-white/8 bg-white/5 p-4"
          >
            <p className="font-medium text-slate-100">{item.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
