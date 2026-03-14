import React from 'react';
import { Hammer } from 'lucide-react';

function ConstructionPage({ title, description }) {
  return (
    <div className="animate-fade-in" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', backgroundColor: 'var(--bg-color)' }}>
      <div style={{ background: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--orange-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <Hammer size={40} color="var(--orange-500)" />
        </div>
        <h2 style={{ color: 'var(--navy-900)', fontSize: '2rem', marginBottom: '1rem', fontWeight: '700' }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
          {description}
        </p>
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--gray-100)', borderRadius: '0.5rem', border: '1px solid var(--gray-200)' }}>
          <span style={{ color: 'var(--navy-600)', fontWeight: '600', fontSize: '0.9rem' }}>Status: Under Development</span>
        </div>
      </div>
    </div>
  );
}

export default ConstructionPage;
