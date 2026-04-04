export default function StatusPill({ status }) {
  const config = {
    Ready: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'E1 Sent': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'E2 Sent': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'E3 Sent': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'Opted Out': 'bg-red-500/20 text-red-300 border-red-500/30',
    'No Email': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }
  const cls = config[status] || config['No Email']
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {status}
    </span>
  )
}
