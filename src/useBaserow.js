import { useState, useCallback } from 'react'

const TABLE_ID = '912031'
const BASE_URL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/`
const TOKEN = import.meta.env.VITE_BASEROW_TOKEN

async function fetchAllRows() {
  let allRows = []
  let nextUrl = `${BASE_URL}?user_field_names=true&size=200`

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: { Authorization: `Token ${TOKEN}` },
    })
    if (!res.ok) throw new Error(`Baserow error: ${res.status}`)
    const data = await res.json()
    allRows = allRows.concat(data.results)
    nextUrl = data.next ? data.next.replace('http://', 'https://') : null
  }

  return allRows
}

export function useBaserow() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetched, setLastFetched] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchAllRows()
      setContacts(rows)
      setLastFetched(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { contacts, loading, error, lastFetched, refresh }
}

export function computeStats(contacts) {
  const total = contacts.length

  const pipelineToSend = contacts.filter(
    (c) => c['Email#1 Body'] && !c['Email#1 Sent']
  ).length

  const email1Sent = contacts.filter((c) => c['Email#1 Sent'] === 'Yes').length
  const email2Sent = contacts.filter((c) => c['Email#2 Sent'] === 'Yes').length
  const email3Sent = contacts.filter((c) => c['Email#3 Sent'] === 'Yes').length
  const replied = contacts.filter((c) => c['Replied'] === 'Yes').length
  const optedOut = contacts.filter((c) => c['Opted Out'] === 'Yes').length

  const linkedin = contacts.filter(
    (c) => c['Lead Source']?.value?.toLowerCase() === 'linkedin'
  ).length
  const realtor = contacts.filter(
    (c) => c['Lead Source']?.value?.toLowerCase() === 'realtor'
  ).length

  const replyRate =
    email1Sent > 0 ? ((replied / email1Sent) * 100).toFixed(1) : '0.0'

  // industry breakdown
  const industries = {}
  contacts.forEach((c) => {
    const ind = c['Industry'] || 'Unknown'
    industries[ind] = (industries[ind] || 0) + 1
  })

  // days remaining at 25/day
  const daysRemaining =
    pipelineToSend > 0 ? Math.ceil(pipelineToSend / 25) : 0

  return {
    total,
    pipelineToSend,
    email1Sent,
    email2Sent,
    email3Sent,
    replied,
    optedOut,
    linkedin,
    realtor,
    replyRate,
    industries,
    daysRemaining,
  }
}

export function getContactStatus(c) {
  if (c['Opted Out'] === 'Yes') return 'Opted Out'
  if (c['Email#3 Sent'] === 'Yes') return 'E3 Sent'
  if (c['Email#2 Sent'] === 'Yes') return 'E2 Sent'
  if (c['Email#1 Sent'] === 'Yes') return 'E1 Sent'
  if (c['Email#1 Body']) return 'Ready'
  return 'No Email'
}

export function hasSmukm(c) {
  return (c['Email#1 Subject'] || '').includes('+')
}
