import { useState } from "react"
import Sidebar from "./Components/Sidebar"
import Dashboard from "./Components/Dashboard"
import TransactionBar from "./Components/TransactionBar"
import ProfileBoard from "./Components/ProfileBoard"


function App() {
  const [activeSection, setActiveSection ] = useState('Dashboard');

  const handleSectionChange = (section) => {
    setActiveSection(section)
  }

  return (
    <>
      <div className="w-full flex">
        <Sidebar onSectionChange={handleSectionChange} />

        <main className="grow">
          { activeSection === 'Dashboard' && <Dashboard/> }
          { activeSection === 'Transactions' && <TransactionBar/> }
          { activeSection === 'Account' && <ProfileBoard/> }
        </main>
      </div>
    </>
  )
}

export default App
