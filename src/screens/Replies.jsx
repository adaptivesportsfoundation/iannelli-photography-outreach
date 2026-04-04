import { useEffect, useRef } from 'react'
import { computeStats } from '../useBaserow'
import LeadSourcePill from '../components/LeadSourcePill'
import Spinner from '../components/Spinner'

export default function Replies({ contacts, loading, error, onRefresh, onSelectContact }) {
  useEffect(() => {
    if (contacts.length === 0 && !loading) onRefresh()
  }, [])

  const stats = computeStats(contacts)
  const replies = [...contacts]
    .filter((c) => c['Replied'] === 'Yes')
    .sort((a, b) => b.id - a.id)

  const touchStartY = useRef(0)
  const listRef = useRef(null)
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY }
  const handleTouchEnd = (e) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current
    if (delta > 80 && listRef.current?.scrollTop === 0) onRefresh()
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-4 pt-4 pb-3 bg-[#0f1117] border-b border-[#2a2d3a]">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Replies</h1>
          {loading && <Spinner size="sm" />}
        </div>
        <div className="flex gap-4 mt-2">
          <div>
            <span className="text-2xl font-black text-green-400">{stats.replied}</span>
            <span className="text-xs text-slate-400 ml-1.5">total replies</span>
          </div>
          <div>
            <span className="text-2xl font-black text-green-300">{stats.replyRate}%</span>
            <span className="text-xs text-slate-400 ml-1.5">reply rate</span>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
          <p className="text-red-400 text-center text-sm">{error}</p>
          <button onClick={onRefresh} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold min-h-[44px]">Retry</button>
        </div>
      ) : replies.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 px-6">
          <p className="text-3xl">📬</p>
          <p className="text-slate-400 text-center">No replies yet. Keep sending!</p>
        </div>
      ) : (
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-2"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {replies.map((contact) => (
            <div
              key={contact.id}
              className="bg-[#1a1d27] rounded-xl p-4 border border-green-500/20"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-white truncate">
                    {contact['First Name']} {contact['Last Name']}
                  </p>
                  {contact['Company Name'] && (
                    <p className="text-sm text-slate-400 truncate">{contact['Company Name']}</p>
                  )}
                </div>
                <LeadSourcePill source={contact['Lead Source']} />
              </div>
              {contact['Email#1 Subject'] && (
                <p className="text-xs text-slate-500 mb-2 truncate">Subject: {contact['Email#1 Subject']}</p>
              )}
              <button
                onClick={() => onSelectContact(contact)}
                className="w-full mt-1 bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold py-2 rounded-lg min-h-[44px] active:bg-green-500/20 transition-colors"
              >
                View Contact
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
