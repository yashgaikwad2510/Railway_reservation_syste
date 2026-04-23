import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Train, User, Home, Ticket, Monitor, CalendarSearch, Briefcase, XCircle, Mail } from 'lucide-react';
import './index.css';

import SmartSearch from './components/SmartSearch';
import AdminConsole from './components/AdminConsole';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Availability from './components/Availability';
import PNRStatus from './components/PNRStatus';
import CancelTicket from './components/CancelTicket';
import ContactUs from './components/ContactUs';
import ConstructionPage from './components/ConstructionPage';
import AuthModal from './components/AuthModal';

function App() {
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState('login');

  useEffect(() => {
    const savedTheme = localStorage.getItem('railflow-theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    }
  }, []);

  return (
    <Router>
      <div className="app-wrapper">
        
        {/* Top Navigation Bar */}
        <header className="top-nav">
          <div className="logo-container">
            <Train size={36} color="var(--navy-600)" />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ lineHeight: '1', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.5px' }}>RAILWAY</div>
              <div style={{ lineHeight: '1', fontSize: '0.65rem', fontWeight: '500', letterSpacing: '1px', color: 'var(--text-secondary)' }}>RESERVATION SYSTEM</div>
            </div>
          </div>
          <div className="top-auth">
            <button 
              className="btn btn-outline" 
              style={{ padding: '0.5rem 1rem', borderRadius: '2rem' }}
              onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
            >
              <User size={16} /> Login
            </button>
            <button 
              className="btn btn-navy" 
              style={{ padding: '0.5rem 1.5rem', borderRadius: '2rem' }}
              onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
            >
              Sign Up
            </button>
          </div>
        </header>

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          initialMode={authMode} 
        />

        {/* Main Layout Below Header */}
        <div className="app-container">
          
          {/* Persistent Sidebar */}
          <aside className="sidebar">
            <nav className="nav-links">
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                  <>
                    <Home size={20} color={isActive ? "var(--orange-500)" : "white"} />
                    Home
                  </>
                )}
              </NavLink>
              <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                  <>
                    <Ticket size={20} color={isActive ? "var(--orange-500)" : "white"} />
                    Book Ticket
                  </>
                )}
              </NavLink>
              <NavLink to="/availability" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                  <>
                    <Monitor size={20} color={isActive ? "var(--orange-500)" : "white"} />
                    Check Availability
                  </>
                )}
              </NavLink>
              <NavLink to="/pnr-status" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                  <>
                    <CalendarSearch size={20} color={isActive ? "var(--orange-500)" : "white"} />
                    PNR Status
                  </>
                )}
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                  <>
                    <Briefcase size={20} color={isActive ? "var(--orange-500)" : "white"} />
                    My Bookings
                  </>
                )}
              </NavLink>
              <NavLink to="/cancel" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                  <>
                    <XCircle size={20} color={isActive ? "var(--orange-500)" : "white"} />
                    Cancel Ticket
                  </>
                )}
              </NavLink>
              <NavLink to="/contact-us" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                  <>
                    <Mail size={20} color={isActive ? "var(--orange-500)" : "white"} />
                    Contact Us
                  </>
                )}
              </NavLink>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<SmartSearch />} />
              <Route path="/admin" element={<AdminConsole />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/search" element={<SmartSearch />} />
              <Route path="/availability" element={<Availability />} />
              <Route path="/cancel" element={<CancelTicket />} />
              <Route path="/pnr-status" element={<PNRStatus />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="*" element={
                <ConstructionPage 
                  title="Page Under Construction" 
                  description="This section is currently being developed for the new Navy & Orange redesign. Please check back later." 
                />
              } />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
