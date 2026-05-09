import { useState } from 'react'
import { computeAnalysis, getWeekStart, filterContactsByWeek } from '../useBaserow'
import ViewToggle from '../components/ViewToggle'
import Spinner from '../components/Spinner'

const SOURCES = [
  { key: 'linkedin', label: 'LinkedIn', color: 'text-orange-300' },
  { key: 'linkedin photo lead', label: 'LI Photo Lead', color: 'text-blue-300' },
  { key: 'realtor', label: 'Realtor', color: 'text-yellow-300' },
]

function RateBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <span className={`text-sm font-bold ${color}`}>
          {count} <span className="text-slate-500 font-normal text-xs">/ {total} sent ({pct.toFixed(1)}%)</span>
        </span>
      </div>
      <div className="h-2 bg-[#2a2d3a] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default function Analysis({ contacts, loading, error, onRefresh }) {
  const [showingAll, setShowingAll] = useState(true)
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => getWeekStart(new Date()))

  const filteredContacts = showingAll ? contacts : filterContactsByWeek(contacts, selectedWeekStart)
  const data = computeAnalysis(filteredContacts)

  const shiftWeek = (delta) => {
    setShowingAll(false)
    setSelectedWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + delta * 7)
      return d
    })
  }

  if (loading && contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <Spinner size="lg" />
        <p className="text-slate-400 text-sm">Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
        <p className="text-red-400 text-center text-sm">{error}</p>
        <button onClick={onRefresh} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold min-h-[44px]">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Analysis</h1>
          <p className="text-xs text-slate-500 mt-0.5">Campaign performance breakdown</p>
        </div>
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <button
            onClick={onRefresh}
            className="text-blue-400 text-xs font-medium p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        )}
      </div>

      <ViewToggle
        showingAll={showingAll}
        weekStart={selectedWeekStart}
        onSelectAll={() => setShowingAll(true)}
        onSelectWeek={() => setShowingAll(false)}
        onPrev={() => shiftWeek(-1)}
        onNext={() => shiftWeek(1)}
      />

      {filteredContacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-slate-400 text-sm">No contacts for this period</p>
        </div>
      ) : (
        <>
          {/* Delivery summary */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-[#1a1d27] rounded-xl p-4 border border-[#2a2d3a] text-center">
              <p className="text-3xl font-black text-blue-300">{data.delivered}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wide">Delivered</p>
            </div>
            <div className="bg-[#1a1d27] rounded-xl p-4 border border-red-500/20 text-center">
              <p className="text-3xl font-black text-red-400">{data.optedOut}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wide">Opt Outs</p>
            </div>
            <div className="bg-[#1a1d27] rounded-xl p-4 border border-green-500/20 text-center">
              <p className="text-3xl font-black text-green-400">{data.replied}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wide">Replies</p>
            </div>
          </div>

          {/* Rate summary */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#1a1d27] rounded-xl p-4 border border-[#2a2d3a] text-center">
              <p className="text-3xl font-black text-red-400">{data.optOutRate}%</p>
              <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wide">Opt-Out Rate</p>
            </div>
            <div className="bg-[#1a1d27] rounded-xl p-4 border border-[#2a2d3a] text-center">
              <p className="text-3xl font-black text-green-400">{data.replyRate}%</p>
              <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wide">Reply Rate</p>
            </div>
          </div>

          {/* Opt-outs by lead source */}
          <div className="bg-[#1a1d27] rounded-xl p-4 border border-[#2a2d3a] mb-5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-4">Opt-Outs by Lead Source</p>
            <div className="space-y-4">
              {SOURCES.map(({ key, label, color }) => (
                <RateBar
                  key={key}
                  label={label}
                  count={data.optOutBySource[key] ?? 0}
                  total={data.deliveredBySource[key] ?? 0}
                  color={color}
                />
              ))}
            </div>
          </div>

          {/* Opt-outs by industry */}
          {data.industryRows.length > 0 && (
            <div className="bg-[#1a1d27] rounded-xl p-4 border border-[#2a2d3a]">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">Opt-Outs by Industry</p>
              <div className="space-y-2">
                {data.industryRows.map(([industry, count]) => (
                  <div key={industry} className="flex items-center justify-between py-1.5 border-b border-[#2a2d3a] last:border-0">
                    <span className="text-sm text-slate-300 flex-1 mr-3">{industry}</span>
                    <span className="text-sm font-bold text-red-400 shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
