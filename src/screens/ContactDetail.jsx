import { useState } from 'react'
import StatusPill from '../components/StatusPill'
import LeadSourcePill from '../components/LeadSourcePill'
import { getContactStatus } from '../useBaserow'

function ExpandableEmail({ label, body }) {
  const [open, setOpen] = useState(false)
  if (!body) return null
  return (
    <div className="border border-[#2a2d3a] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left min-h-[44px] bg-[#1e2130]"
      >
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-4 py-3 bg-[#1a1d27] border-t border-[#2a2d3a]">
          <div
            className="text-sm text-slate-300 leading-relaxed [&_a]:text-blue-400 [&_a]:underline [&_img]:max-w-full [&_img]:rounded"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value, href, type }) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#2a2d3a] last:border-0">
      <span className="text-xs text-slate-500 font-medium uppercase tracking-wide w-28 shrink-0">{label}</span>
      {href ? (
        <a href={href} className="text-blue-400 text-sm text-right flex-1 min-w-0 truncate active:text-blue-300">
          {type === 'email' ? value : type === 'phone' ? value : value}
        </a>
      ) : (
        <span className="text-sm text-slate-300 text-right flex-1 min-w-0 truncate">{value}</span>
      )}
    </div>
  )
}

function StatusRow({ label, value }) {
  const yes = value === 'Yes'
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#2a2d3a] last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span className={`text-sm font-semibold ${yes ? 'text-green-400' : 'text-slate-500'}`}>
        {yes ? 'Yes' : 'No'}
      </span>
    </div>
  )
}

export default function ContactDetail({ contact, onBack }) {
  if (!contact) return null
  const status = getContactStatus(contact)
  const leadSource = contact['Lead Source']

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-[#0f1117] border-b border-[#2a2d3a]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-blue-400 text-sm font-medium mb-3 min-h-[44px] -ml-1 px-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Contacts
        </button>
        <h1 className="text-xl font-bold text-white">
          {contact['First Name']} {contact['Last Name']}
        </h1>
        {contact['Company Name'] && (
          <p className="text-sm text-slate-400 mt-0.5">{contact['Company Name']}</p>
        )}
        {contact['Job Title'] && (
          <p className="text-xs text-slate-500">{contact['Job Title']}</p>
        )}
        <div className="flex gap-2 mt-2.5">
          <LeadSourcePill source={leadSource} />
          <StatusPill status={status} />
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4 space-y-5">

        {/* Outreach section */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Outreach</h2>
          <div className="space-y-2">
            {contact['Email#1 Subject'] && (
              <div className="bg-[#1a1d27] rounded-xl px-4 py-3 border border-[#2a2d3a]">
                <p className="text-xs text-slate-500 mb-1">Email 1 Subject</p>
                <p className="text-sm text-slate-200">{contact['Email#1 Subject']}</p>
              </div>
            )}
            <ExpandableEmail label="Email 1 Body" body={contact['Email#1 Body']} />
            <ExpandableEmail label="Email 2 Body" body={contact['Email #2 Body']} />
            {contact['Email#3 Subject'] && (
              <div className="bg-[#1a1d27] rounded-xl px-4 py-3 border border-[#2a2d3a]">
                <p className="text-xs text-slate-500 mb-1">Email 3 Subject</p>
                <p className="text-sm text-slate-200">{contact['Email#3 Subject']}</p>
              </div>
            )}
            <ExpandableEmail label="Email 3 Body" body={contact['Email#3 Body']} />
          </div>
        </section>

        {/* Status section */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Status</h2>
          <div className="bg-[#1a1d27] rounded-xl px-4 border border-[#2a2d3a]">
            <StatusRow label="Email 1 Sent" value={contact['Email#1 Sent']} />
            <StatusRow label="Email 2 Sent" value={contact['Email#2 Sent']} />
            <StatusRow label="Email 3 Sent" value={contact['Email#3 Sent']} />
            <StatusRow label="Replied" value={contact['Replied']} />
            <StatusRow label="Opted Out" value={contact['Opted Out']} />
          </div>
        </section>

        {/* Contact info */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact Info</h2>
          <div className="bg-[#1a1d27] rounded-xl px-4 border border-[#2a2d3a]">
            <InfoRow
              label="Email"
              value={contact['Email Address']}
              href={contact['Email Address'] ? `mailto:${contact['Email Address']}` : null}
              type="email"
            />
            <InfoRow
              label="Phone"
              value={contact['Phone Number']}
              href={contact['Phone Number'] ? `tel:${contact['Phone Number']}` : null}
              type="phone"
            />
            <InfoRow
              label="LinkedIn"
              value={contact['LinkedIn URL'] ? 'View Profile' : null}
              href={contact['LinkedIn URL']}
            />
            {contact['Lead Source']?.value?.toLowerCase() === 'realtor' && (
              <InfoRow
                label="Profile"
                value={contact['Profile URL'] ? 'View Listing' : null}
                href={contact['Profile URL']}
              />
            )}
            <InfoRow label="Location" value={contact['Location']} />
          </div>
        </section>

      </div>
    </div>
  )
}
