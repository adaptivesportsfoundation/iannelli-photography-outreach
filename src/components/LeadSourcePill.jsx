export default function LeadSourcePill({ source }) {
  const val = source?.value?.toLowerCase() || source?.toLowerCase?.() || ''
  const isLinkedin = val === 'linkedin'
  const cls = isLinkedin
    ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  const label = isLinkedin ? 'LinkedIn' : 'Realtor'
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  )
}
