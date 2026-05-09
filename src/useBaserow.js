import { useState, useCallback } from 'react'

const TABLE_ID = '912031'
const BASE_URL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/`
const TOKEN = import.meta.env.VITE_BASEROW_TOKEN

export async function deleteContact(rowId) {
  const url = `${BASE_URL}${rowId}/`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Token ${TOKEN}` },
  })
  if (!res.ok) throw new Error(`Baserow error: ${res.status}`)
}

export async function updateContact(rowId, fields) {
  const url = `${BASE_URL}${rowId}/?user_field_names=true`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Token ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields),
  })
  if (!res.ok) throw new Error(`Baserow error: ${res.status}`)
  return res.json()
}

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
    (c) => c['Email#1 Body'] && !c['Email#1 Sent'] && c['Failed Mail'] !== 'Yes'
  ).length

  const email1Sent = contacts.filter((c) => c['Email#1 Sent'] === 'Yes').length
  const email2Sent = contacts.filter((c) => c['Email#2 Sent'] === 'Yes').length
  const email3Sent = contacts.filter((c) => c['Email#3 Sent'] === 'Yes').length
  const replied = contacts.filter((c) => c['Replied'] === 'Yes').length
  const optedOut = contacts.filter((c) => c['Opted Out'] === 'Yes').length
  const failedMail = contacts.filter((c) => c['Failed Mail'] === 'Yes').length
  const failedAndSent = contacts.filter(
    (c) => c['Failed Mail'] === 'Yes' && c['Email#1 Sent'] === 'Yes'
  ).length

  const linkedin = contacts.filter(
    (c) => c['Lead Source']?.value?.toLowerCase() === 'linkedin'
  ).length
  const linkedinPhotoLead = contacts.filter(
    (c) => c['Lead Source']?.value?.toLowerCase() === 'linkedin photo lead'
  ).length
  const realtor = contacts.filter(
    (c) => c['Lead Source']?.value?.toLowerCase() === 'realtor'
  ).length

  const deliveredSent = email1Sent - failedAndSent
  const replyRate =
    deliveredSent > 0 ? ((replied / deliveredSent) * 100).toFixed(1) : '0.0'

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
    failedMail,
    linkedin,
    linkedinPhotoLead,
    realtor,
    replyRate,
    industries,
    daysRemaining,
  }
}

export function computeAnalysis(contacts) {
  const email1Sent = contacts.filter((c) => c['Email#1 Sent'] === 'Yes').length
  const failedAndSent = contacts.filter(
    (c) => c['Failed Mail'] === 'Yes' && c['Email#1 Sent'] === 'Yes'
  ).length
  const delivered = email1Sent - failedAndSent
  const optedOut = contacts.filter((c) => c['Opted Out'] === 'Yes').length
  const replied = contacts.filter((c) => c['Replied'] === 'Yes').length

  const optOutRate = delivered > 0 ? ((optedOut / delivered) * 100).toFixed(1) : '0.0'
  const replyRate = delivered > 0 ? ((replied / delivered) * 100).toFixed(1) : '0.0'

  // Delivered and opt-outs by lead source (normalize to lowercase keys)
  const deliveredBySource = {}
  const optOutBySource = {}
  contacts.forEach((c) => {
    const source = (c['Lead Source']?.value || 'Unknown').toLowerCase()
    if (c['Email#1 Sent'] === 'Yes' && c['Failed Mail'] !== 'Yes') {
      deliveredBySource[source] = (deliveredBySource[source] || 0) + 1
    }
    if (c['Opted Out'] === 'Yes') {
      optOutBySource[source] = (optOutBySource[source] || 0) + 1
    }
  })

  // Opt-outs by industry (sorted by count desc)
  const optOutByIndustry = {}
  contacts.forEach((c) => {
    if (c['Opted Out'] === 'Yes') {
      const ind = c['Industry'] || 'Unknown'
      optOutByIndustry[ind] = (optOutByIndustry[ind] || 0) + 1
    }
  })
  const industryRows = Object.entries(optOutByIndustry)
    .sort((a, b) => b[1] - a[1])

  return {
    delivered,
    optedOut,
    replied,
    optOutRate,
    replyRate,
    deliveredBySource,
    optOutBySource,
    industryRows,
  }
}

export function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + diff)
  return d
}

export function getWeekEnd(weekStart) {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

export function formatWeekLabel(weekStart) {
  const weekEnd = getWeekEnd(weekStart)
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(weekStart)} – ${fmt(weekEnd)}`
}

export function filterContactsByWeek(contacts, weekStart) {
  if (!weekStart) return contacts
  const weekEnd = getWeekEnd(weekStart)
  return contacts.filter((c) => {
    const raw = c['Created on'] || c.created_on || c['Date Added'] || c['Created']
    if (!raw) return false
    const d = new Date(raw)
    return d >= weekStart && d <= weekEnd
  })
}

export function getContactStatus(c) {
  if (c['Failed Mail'] === 'Yes') return 'Failed Mail'
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
