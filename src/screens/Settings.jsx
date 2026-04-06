import { useEffect, useState } from 'react'
import { computeStats } from '../useBaserow'
import Spinner from '../components/Spinner'

const HELP_SECTIONS = [
  {
    title: 'Dashboard',
    items: [
      { label: 'Pipeline to Send', desc: 'Contacts who have an email body written but haven\'t been sent Email #1 yet — your immediate send queue.' },
      { label: 'Email 1 / 2 / 3 Sent', desc: 'Running count of how many contacts have received each email in the sequence.' },
      { label: 'Replied', desc: 'Contacts who have responded to any email in the sequence.' },
      { label: 'Reply Rate', desc: 'Replied ÷ Email 1 Sent, expressed as a percentage.' },
      { label: 'Opt Outs', desc: 'Contacts marked "Opted Out" in Baserow — excluded from future sends.' },
      { label: 'Days Remaining', desc: 'Pipeline to Send ÷ 25 (your daily send rate), rounded up.' },
    ],
  },
  {
    title: 'Contacts',
    items: [
      { label: 'Search', desc: 'Filters by name, company, or title in real time.' },
      { label: 'Status filter', desc: 'Narrows the list to contacts at a specific stage (Ready, E1 Sent, etc.).' },
      { label: 'Star (★)', desc: 'Indicates the contact\'s Email #1 subject line contains a "+" — used to mark SMUKM-style subject lines.' },
    ],
  },
  {
    title: 'Status Badges',
    items: [
      { label: 'No Email', desc: 'No email body has been written yet for this contact.' },
      { label: 'Ready', desc: 'Email body is written and ready to send — appears in Pipeline to Send.' },
      { label: 'E1 Sent', desc: 'Email #1 has been sent.' },
      { label: 'E2 Sent', desc: 'Follow-up Email #2 has been sent.' },
      { label: 'E3 Sent', desc: 'Final follow-up Email #3 has been sent.' },
      { label: 'Opted Out', desc: 'Contact has unsubscribed or asked to be removed.' },
    ],
  },
  {
    title: 'Replies',
    items: [
      { label: 'Replies tab', desc: 'Shows all contacts where "Replied" is marked Yes in Baserow. Tap a contact to view their full detail.' },
    ],
  },
]

function HelpSection() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(null)

  return (
    <section>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-2"
      >
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Help &amp; Reference</h2>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 space-y-3">
          {HELP_SECTIONS.map((section) => (
            <div key={section.title} className="bg-[#1a1d27] rounded-xl border border-[#2a2d3a] overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === section.title ? null : section.title)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <span className="text-sm font-semibold text-white">{section.title}</span>
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`w-4 h-4 text-slate-500 transition-transform ${expanded === section.title ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expanded === section.title && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#2a2d3a] pt-3">
                  {section.items.map((item) => (
                    <div key={item.label}>
                      <p className="text-xs font-semibold text-blue-300 mb-0.5">{item.label}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

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

        <HelpSection />

        <p className="text-xs text-slate-600 text-center mt-2">
          Iannelli Photography Cold Outreach v1.0
        </p>
      </div>
    </div>
  )
}
