import { authiChipActiveStyle } from '../lib/authiTheme';

/** Pill chip — gradient fill when selected, white outline when not. */
export default function GradientChip({ selected, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs transition ${className} ${
        selected ? '' : 'border border-[#E5E7EB] bg-white font-medium text-[#374151] hover:border-[#9F62ED]/40'
      }`}
      style={selected ? authiChipActiveStyle : undefined}
    >
      {children}
    </button>
  );
}
