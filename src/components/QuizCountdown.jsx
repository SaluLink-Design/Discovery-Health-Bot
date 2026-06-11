/** 5-second answer window ring — visible during trivia countdown. */
export default function QuizCountdown({ secondsLeft, total = 5, active }) {
  if (!active) return null;

  const progress = Math.max(0, secondsLeft / total);
  const circumference = 2 * Math.PI * 18;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex items-center gap-2">
      <svg className="h-10 w-10 -rotate-90" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r="18" fill="none" stroke="#F3F4F6" strokeWidth="3" />
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="url(#quiz-timer-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
        <defs>
          <linearGradient id="quiz-timer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9F62ED" />
            <stop offset="100%" stopColor="#49A6FD" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <p className="text-lg font-bold tabular-nums text-[#9F62ED]">{secondsLeft}</p>
        <p className="text-[9px] font-semibold uppercase tracking-wide text-[#9CA3AF]">seconds</p>
      </div>
    </div>
  );
}
