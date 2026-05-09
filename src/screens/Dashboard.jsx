import { useEffect, useState } from 'react'
import { computeStats, getWeekStart, formatWeekLabel, filterContactsByWeek } from '../useBaserow'
import Spinner from '../components/Spinner'

function StatCard({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-[#1a1d27] rounded-xl p-4 border border-[#2a2d3a] flex flex-col gap-1">
      <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
    </div>
  )
}

function ViewToggle({ showingAll, weekStart, onSelectAll, onSelectWeek, onPrev, onNext }) {
  return (
    <div className="mb-5 space-y-2">
      {/* Segmented control */}
      <div className="flex bg-[#1a1d27] rounded-xl border border-[#2a2d3a] p-1 gap-1">
        <button
          onClick={onSelectAll}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors min-h-[36px] ${
            showingAll
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 active:bg-[#2a2d3a]'
          }`}
        >
          All Time
        </button>
        <button
          onClick={onSelectWeek}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors min-h-[36px] ${
            !showingAll
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 active:bg-[#2a2d3a]'
          }`}
        >
          By Week
        </button>
      </div>

      {/* Week navigation — only shown in week mode */}
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

export default function Dashboard({ contacts, loading, error, onRefresh }) {
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => getWeekStart(new Date()))
  const [showingAll, setShowingAll] = useState(false)

  useEffect(() => {
    if (contacts.length === 0 && !loading) onRefresh()
  }, [])

  const filteredContacts = showingAll ? contacts : filterContactsByWeek(contacts, selectedWeekStart)
  const stats = computeStats(filteredContacts)

  if (loading && contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <Spinner size="lg" />
        <p className="text-slate-400 text-sm">Loading campaign data…</p>
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

  const shiftWeek = (delta) => {
    setShowingAll(false)
    setSelectedWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + delta * 7)
      return d
    })
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Campaign Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Iannelli Photography</p>
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

      {/* View toggle + week navigation */}
      <ViewToggle
        showingAll={showingAll}
        weekStart={selectedWeekStart}
        onSelectAll={() => setShowingAll(true)}
        onSelectWeek={() => setShowingAll(false)}
        onPrev={() => shiftWeek(-1)}
        onNext={() => shiftWeek(1)}
      />

      {/* 6 stat cards — 2 columns */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard label="Pipeline to Send" value={stats.pipelineToSend} color="text-yellow-300" />
        <StatCard label="Email 1 Sent" value={stats.email1Sent} color="text-blue-300" />
        <StatCard label="Email 2 Sent" value={stats.email2Sent} color="text-purple-300" />
        <StatCard label="Email 3 Sent" value={stats.email3Sent} color="text-indigo-300" />
        <StatCard label="Replied" value={stats.replied} color="text-green-300" />
        <StatCard label="Reply Rate" value={`${stats.replyRate}%`} color="text-green-400" />
      </div>

      {/* Big numbers */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-[#1a1d27] rounded-xl p-4 border border-[#2a2d3a] text-center">
          <p className="text-4xl font-black text-red-400">{stats.optedOut}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wide">Opt Outs</p>
        </div>
        <div className="bg-[#1a1d27] rounded-xl p-4 border border-orange-500/20 text-center">
          <p className="text-4xl font-black text-orange-400">{stats.failedMail}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wide">Failed Mail</p>
        </div>
        <div className="bg-[#1a1d27] rounded-xl p-4 border border-[#2a2d3a] text-center">
          <p className="text-4xl font-black text-white">{stats.total}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wide">Total</p>
        </div>
      </div>

      {/* Lead source breakdown */}
      <div className="bg-[#1a1d27] rounded-xl p-4 border border-[#2a2d3a] mb-5">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">Lead Source</p>
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0" />
            <div>
              <p className="text-lg font-bold text-orange-300">{stats.linkedin}</p>
              <p className="text-xs text-slate-400">LinkedIn</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
            <div>
              <p className="text-lg font-bold text-blue-300">{stats.linkedinPhotoLead}</p>
              <p className="text-xs text-slate-400">LI Photo Lead</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" />
            <div>
              <p className="text-lg font-bold text-yellow-300">{stats.realtor}</p>
              <p className="text-xs text-slate-400">Realtor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
