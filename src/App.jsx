import { useState, useEffect } from 'react'
import { useBaserow } from './useBaserow'
import BottomNav from './components/BottomNav'
import Dashboard from './screens/Dashboard'
import Contacts from './screens/Contacts'
import ContactDetail from './screens/ContactDetail'
import Replies from './screens/Replies'
import Settings from './screens/Settings'

export default function App() {
  const { contacts, loading, error, lastFetched, refresh } = useBaserow()
  const [screen, setScreen] = useState('dashboard')
  const [selectedContact, setSelectedContact] = useState(null)
  const [contactsScrollPos, setContactsScrollPos] = useState(0)
  const [prevNavScreen, setPrevNavScreen] = useState('contacts')

  // Initial fetch
  useEffect(() => {
    refresh()
  }, [])

  const handleNavigate = (tab) => {
    setSelectedContact(null)
    setScreen(tab)
  }

  const handleSelectContact = (contact, fromScreen = screen) => {
    setPrevNavScreen(fromScreen)
    setSelectedContact(contact)
    setScreen('detail')
  }

  const handleBackFromDetail = () => {
    setSelectedContact(null)
    setScreen(prevNavScreen)
  }

  const sharedProps = { contacts, loading, error, onRefresh: refresh, lastFetched }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-[#0f1117] relative">
      <div className="flex flex-col flex-1 overflow-hidden pb-[56px]">
        {screen === 'dashboard' && (
          <Dashboard {...sharedProps} />
        )}
        {screen === 'contacts' && (
          <Contacts
            {...sharedProps}
            onSelectContact={(c) => handleSelectContact(c, 'contacts')}
            savedScroll={contactsScrollPos}
            onSaveScroll={setContactsScrollPos}
          />
        )}
        {screen === 'detail' && (
          <ContactDetail contact={selectedContact} onBack={handleBackFromDetail} />
        )}
        {screen === 'replies' && (
          <Replies
            {...sharedProps}
            onSelectContact={(c) => handleSelectContact(c, 'replies')}
          />
        )}
        {screen === 'settings' && (
          <Settings {...sharedProps} />
        )}
      </div>

      <BottomNav
        active={screen === 'detail' ? prevNavScreen : screen}
        onNavigate={handleNavigate}
      />
    </div>
  )
}
