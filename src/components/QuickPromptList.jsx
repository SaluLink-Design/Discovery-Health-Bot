export default function QuickPromptList({ prompts, onSelect }) {
  return (
    <div className="flex flex-wrap gap-3">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/10"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
