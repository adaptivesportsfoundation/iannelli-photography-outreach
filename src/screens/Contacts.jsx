import { useState, useEffect, useMemo, useRef } from 'react'
import { getContactStatus, hasSmukm, deleteContact } from '../useBaserow'
import StatusPill from '../components/StatusPill'
import LeadSourcePill from '../components/LeadSourcePill'
import Spinner from '../components/Spinner'

export default function Contacts({ contacts, loading, error, onRefresh, onSelectContact, savedScroll, onSaveScroll }) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('status')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (contacts.length === 0 && !loading) onRefresh()
  }, [])

  // restore scroll
  useEffect(() => {
    if (savedScroll && listRef.current) {
      listRef.current.scrollTop = savedScroll
    }
  }, [savedScroll])

  const STATUS_ORDER = { 'Ready': 0, 'E1 Sent': 1, 'E2 Sent': 2, 'E3 Sent': 3, 'No Email': 4, 'Opted Out': 5, 'Failed Mail': 6 }

  const filtered = useMemo(() => {
    let list = [...contacts]

    if (sort === 'status') {
      list.sort((a, b) => (STATUS_ORDER[getContactStatus(a)] ?? 9) - (STATUS_ORDER[getContactStatus(b)] ?? 9))
    } else if (sort === 'alpha') {
      list.sort((a, b) => (a['Last Name'] || '').localeCompare(b['Last Name'] || ''))
    } else {
      list.sort((a, b) => b.id - a.id)
    }

    if (filter === 'LinkedIn') {
      list = list.filter((c) => c['Lead Source']?.value?.toLowerCase() === 'linkedin')
    } else if (filter === 'LinkedIn Photo Lead') {
      list = list.filter((c) => c['Lead Source']?.value?.toLowerCase() === 'linkedin photo lead')
    } else if (filter === 'Realtor') {
      list = list.filter((c) => c['Lead Source']?.value?.toLowerCase() === 'realtor')
    } else if (filter === 'Failed Mail') {
      list = list.filter((c) => c['Failed Mail'] === 'Yes')
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          `${c['First Name']} ${c['Last Name']}`.toLowerCase().includes(q) ||
          (c['Company Name'] || '').toLowerCase().includes(q) ||
          (c['Email Address'] || '').toLowerCase().includes(q)
      )
    }

    return list
  }, [contacts, filter, search])

  const handleCardClick = (contact) => {
    if (listRef.current) onSaveScroll(listRef.current.scrollTop)
    onSelectContact(contact)
  }

  const handleDeletePress = (e, contactId) => {
    e.stopPropagation()
    setConfirmDeleteId(contactId)
  }

  const handleDeleteCancel = (e) => {
    e.stopPropagation()
    setConfirmDeleteId(null)
  }

  const handleDeleteConfirm = async (e, contactId) => {
    e.stopPropagation()
    setDeletingId(contactId)
    setConfirmDeleteId(null)
    try {
      await deleteContact(contactId)
      onRefresh()
    } finally {
      setDeletingId(null)
    }
  }

  // pull-to-refresh
  const touchStartY = useRef(0)
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY }
  const handleTouchEnd = (e) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current
    if (delta > 80 && listRef.current?.scrollTop === 0) onRefresh()
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Sticky top bar */}
      <div className="px-4 pt-4 pb-2 bg-[#0f1117] border-b border-[#2a2d3a]">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-white">Contacts</h1>
          {loading && <Spinner size="sm" />}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {['All', 'LinkedIn', 'LinkedIn Photo Lead', 'Realtor', 'Failed Mail'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors min-h-[36px] ${
                filter === f
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-[#1a1d27] border-[#2a2d3a] text-slate-400 active:bg-[#2a2d3a]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-slate-500 shrink-0">Sort:</span>
          {[{ key: 'status', label: 'By Status' }, { key: 'alpha', label: 'A–Z' }, { key: 'newest', label: 'Newest' }].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors min-h-[30px] ${
                sort === key
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-[#1a1d27] border-[#2a2d3a] text-slate-400 active:bg-[#2a2d3a]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search name, company, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a1d27] border border-[#2a2d3a] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[44px]"
          />
        </div>
      </div>

      {/* List */}
      {error ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
          <p className="text-red-400 text-center text-sm">{error}</p>
          <button onClick={onRefresh} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold min-h-[44px]">Retry</button>
        </div>
      ) : filtered.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 px-6">
          <p className="text-slate-400 text-center">No contacts found.</p>
          {search && <button onClick={() => setSearch('')} className="text-blue-400 text-sm">Clear search</button>}
        </div>
      ) : (
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-2"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <p className="text-xs text-slate-500 mb-2">{filtered.length} contacts</p>
          {filtered.map((contact) => {
            const status = getContactStatus(contact)
            const smukm = hasSmukm(contact)
            const isConfirming = confirmDeleteId === contact.id
            const isDeleting = deletingId === contact.id
            return (
              <div key={contact.id} className="relative">
                <button
                  onClick={() => handleCardClick(contact)}
                  className="w-full text-left bg-[#1a1d27] rounded-xl p-4 border border-[#2a2d3a] active:border-blue-500/50 active:bg-[#1e2130] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-white truncate">
                        {contact['First Name']} {contact['Last Name']}
                        {smukm ? (
                          <span className="ml-1.5 text-yellow-400 text-sm" title="SMUKM subject line">★</span>
                        ) : null}
                      </p>
                      {contact['Company Name'] ? (
                        <p className="text-sm text-slate-400 truncate">{contact['Company Name']}</p>
                      ) : null}
                      {contact['Job Title'] ? (
                        <p className="text-xs text-slate-500 truncate">{contact['Job Title']}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <LeadSourcePill source={contact['Lead Source']} />
                      <StatusPill status={status} />
                    </div>
                  </div>
                  {filter === 'Failed Mail' ? (
                    isConfirming ? (
                      <div className="mt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleDeleteConfirm(e, contact.id)}
                          className="flex-1 bg-red-600 text-white text-xs font-semibold py-2 rounded-lg min-h-[36px] active:bg-red-700 transition-colors"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={handleDeleteCancel}
                          className="flex-1 bg-[#2a2d3a] text-slate-300 text-xs font-semibold py-2 rounded-lg min-h-[36px] active:bg-[#343848] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={(e) => handleDeletePress(e, contact.id)}
                          disabled={isDeleting}
                          className="flex items-center gap-1.5 text-xs text-red-400 font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 min-h-[36px] active:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? 'Deleting…' : (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    )
                  ) : null}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
