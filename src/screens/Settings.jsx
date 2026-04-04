import { useEffect } from 'react'
import { computeStats } from '../useBaserow'
import Spinner from '../components/Spinner'

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#2a2d3a] last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  )
}

export default function Settings({ contacts, loading, error, onRefresh, lastFetched }) {
  useEffect(() => {
    if (contacts.length === 0 && !loading) onRefresh()
  }, [])

  const stats = computeStats(contacts)

  const industries = Object.entries(stats.industries)
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-4 pt-4 pb-3 bg-[#0f1117] border-b border-[#2a2d3a]">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        {lastFetched && (
          <p className="text-xs text-slate-500 mt-0.5">
            Last synced: {lastFetched.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-5">

        {/* Database summary */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Database</h2>
          <div className="bg-[#1a1d27] rounded-xl px-4 border border-[#2a2d3a]">
            <StatRow label="Total Contacts" value={stats.total} />
            <StatRow label="LinkedIn Contacts" value={stats.linkedin} />
            <StatRow label="Realtor Contacts" value={stats.realtor} />
          </div>
        </section>

        {/* Industry breakdown */}
        {industries.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">By Industry</h2>
            <div className="bg-[#1a1d27] rounded-xl px-4 border border-[#2a2d3a]">
              {industries.map(([ind, count]) => (
                <StatRow key={ind} label={ind} value={count} />
              ))}
            </div>
          </section>
        )}

        {/* Pipeline health */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pipeline Health</h2>
          <div className="bg-[#1a1d27] rounded-xl px-4 border border-[#2a2d3a]">
            <StatRow label="Ready to Send" value={stats.pipelineToSend} />
            <StatRow label="Send Rate" value="25 / day" />
            <StatRow
              label="Days Remaining"
              value={stats.daysRemaining > 0 ? `~${stats.daysRemaining} days` : '—'}
            />
          </div>
        </section>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 disabled:bg-blue-600/50 text-white font-semibold py-3.5 rounded-xl min-h-[52px] active:bg-blue-700 transition-colors"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              <span>Refreshing…</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>Refresh Data</span>
            </>
          )}
        </button>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <p className="text-xs text-slate-600 text-center mt-2">
          Iannelli Photography Cold Outreach v1.0
        </p>
      </div>
    </div>
  )
}
