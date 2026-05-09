import { formatWeekLabel } from '../useBaserow'

export default function ViewToggle({ showingAll, weekStart, onSelectAll, onSelectWeek, onPrev, onNext }) {
  return (
    <div className="mb-5 space-y-2">
      <div className="flex bg-[#1a1d27] rounded-xl border border-[#2a2d3a] p-1 gap-1">
        <button
          onClick={onSelectAll}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors min-h-[36px] ${
            showingAll ? 'bg-blue-600 text-white' : 'text-slate-400 active:bg-[#2a2d3a]'
          }`}
        >
          All Time
        </button>
        <button
          onClick={onSelectWeek}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors min-h-[36px] ${
            !showingAll ? 'bg-blue-600 text-white' : 'text-slate-400 active:bg-[#2a2d3a]'
          }`}
        >
          By Week
        </button>
      </div>

      {!showingAll && (
        <div className="flex items-center bg-[#1a1d27] rounded-xl border border-[#2a2d3a] px-2 py-1">
          <button onClick={onPrev} className="p-2 text-slate-400 min-h-[40px] min-w-[40px] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="flex-1 text-center text-sm font-semibold text-white">
            {formatWeekLabel(weekStart)}
          </span>
          <button onClick={onNext} className="p-2 text-slate-400 min-h-[40px] min-w-[40px] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
