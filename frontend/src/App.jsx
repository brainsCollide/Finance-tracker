import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/Dashboard';
import TransactionBar from './Components/TransactionBar';
import ProfileBoard from './Components/ProfileBoard';
import WelcomePage from './Components/WelcomePage';

function MainApp() {
  const [activeSection, setActiveSection] = useState('Dashboard');

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="w-full flex">
      <Sidebar onSectionChange={handleSectionChange} />
      <main className="grow">
        {activeSection === "Dashboard" && <Dashboard />}
        {activeSection === "Transactions" && <TransactionBar onSectionChange={handleSectionChange} />}
        {activeSection === "Account" && <ProfileBoard />}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/app" element={<MainApp />} />
        <Route path="*" element={<Navigate to="/" replace />} /> {/* Redirect unknown routes to WelcomePage */}
      </Routes>
    </Router>
  );
}

export default App;
