import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, Github } from 'lucide-react';

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate successful login/signup
    alert(`${mode === 'login' ? 'Logged in' : 'Signed up'} successfully!`);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(10, 25, 47, 0.85)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1rem'
    }}>
      <div className="animate-fade-in glass-panel" style={{
        backgroundColor: 'white',
        width: '100%', maxWidth: '450px',
        padding: '2.5rem',
        borderRadius: '1.5rem',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '1.25rem', right: '1.25rem',
          background: 'var(--gray-100)', border: 'none',
          padding: '0.5rem', borderRadius: '50%', cursor: 'pointer',
          color: 'var(--navy-600)', transition: 'var(--transition)'
        }} className="hover:bg-gray-200">
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--navy-900)', fontWeight: '800' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {mode === 'login' ? 'Login to manage your bookings' : 'Join RailFlow for seamless travel'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {mode === 'signup' && (
            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--navy-700)', marginBottom: '0.4rem', display: 'block' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input 
                  type="text" required className="form-control" placeholder="John Doe" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }} 
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--navy-700)', marginBottom: '0.4rem', display: 'block' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input 
                type="email" required className="form-control" placeholder="john@example.com" 
                style={{ width: '100%', paddingLeft: '2.5rem' }} 
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--navy-700)', marginBottom: '0.4rem', display: 'block' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input 
                type="password" required className="form-control" placeholder="••••••••" 
                style={{ width: '100%', paddingLeft: '2.5rem' }} 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontWeight: '700', marginTop: '0.5rem' }}>
            {mode === 'login' ? <><LogIn size={20} style={{ marginRight: '0.5rem' }} /> Login to Account</> : <><UserPlus size={20} style={{ marginRight: '0.5rem' }} /> Create Account</>}
          </button>
        </form>

        <div style={{ margin: '2rem 0', textAlign: 'center', position: 'relative' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)' }} />
          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '0 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>or continue with</span>
        </div>

        <button className="btn btn-outline" style={{ width: '100%', padding: '0.75rem', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}>
          <Github size={20} /> GitHub
        </button>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          {mode === 'login' ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              Don't have an account? 
              <button 
                onClick={() => setMode('signup')}
                style={{ background: 'none', border: 'none', color: 'var(--orange-500)', fontWeight: '700', cursor: 'pointer', marginLeft: '0.4rem' }}
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>
              Already have an account? 
              <button 
                onClick={() => setMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--orange-500)', fontWeight: '700', cursor: 'pointer', marginLeft: '0.4rem' }}
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
