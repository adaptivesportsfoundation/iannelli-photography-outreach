const SOURCE_MAP = {
  'linkedin': { label: 'LinkedIn', cls: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  'linkedin photo lead': { label: 'LinkedIn Photo Lead', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  'realtor': { label: 'Realtor', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
}

export default function LeadSourcePill({ source }) {
  const val = source?.value?.toLowerCase() || source?.toLowerCase?.() || ''
  const config = SOURCE_MAP[val] || { label: val, cls: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${config.cls}`}>
      {config.label}
    </span>
  )
}
