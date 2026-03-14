import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Moon, Shield, CreditCard, ChevronDown } from 'lucide-react';

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('railflow-theme');
    return saved !== 'light';
  });

  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('railflow-theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('railflow-theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SettingsIcon size={28} color="var(--emerald-500)" />
          Application Settings
        </h1>
        <p style={{ color: 'var(--slate-400)', marginTop: '0.5rem' }}>Customize your RailFlow experience and preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Appearance Settings */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--slate-700)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Moon size={18} /> Appearance
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '500', color: 'white' }}>Dark Mode Theme</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-400)' }}>Use Midnight Slate aesthetics</div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              style={{
                width: '44px', height: '24px', borderRadius: '12px', padding: '2px',
                backgroundColor: darkMode ? 'var(--emerald-500)' : 'var(--slate-600)',
                border: 'none', cursor: 'pointer', transition: 'var(--transition)'
              }}
            >
              <div style={{ 
                width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
                transform: `translateX(${darkMode ? '20px' : '0'})`, transition: 'var(--transition)'
              }} />
            </button>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--slate-700)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} /> Notifications
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '500', color: 'white' }}>SMS / Email Alerts</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-400)' }}>Receive PNR status updates</div>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              style={{
                width: '44px', height: '24px', borderRadius: '12px', padding: '2px',
                backgroundColor: notifications ? 'var(--emerald-500)' : 'var(--slate-600)',
                border: 'none', cursor: 'pointer', transition: 'var(--transition)'
              }}
            >
              <div style={{ 
                width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
                transform: `translateX(${notifications ? '20px' : '0'})`, transition: 'var(--transition)'
              }} />
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--slate-700)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} /> Security & Privacy
          </h3>
          <div>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }} onClick={() => alert("Session management feature coming soon! (SQL: SELECT * FROM UserSessions WHERE user_id = ...)")}>
              Manage Active Sessions <ChevronDown size={16} />
            </button>
          </div>
          <div>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }} onClick={() => alert("2FA Setup initiated. Check your registered email for the code.")}>
              Two-Factor Authentication (2FA) <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ alignSelf: 'flex-start' }}>
        <button className="btn btn-primary" onClick={() => alert("Preferences saved successfully! (Dark Mode: " + darkMode + ", Notifications: " + notifications + ")")}>Save Preferences</button>
      </div>

    </div>
  );
}

export default Settings;
