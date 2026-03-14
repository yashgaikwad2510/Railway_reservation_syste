import React, { useState } from 'react';
import { Monitor, Search, Train } from 'lucide-react';

function Availability() {
  const [searchTerm, setSearchTerm] = useState('');

  const availabilityData = [
    { id: '12001', name: 'Rajdhani Express', route: 'NDLS - MMCT', sleeper: 45, ac3: 12, ac2: 5, ac1: 2 },
    { id: '12045', name: 'Shatabdi Express', route: 'NDLS - PUNE', sleeper: 0, ac3: 40, ac2: 15, ac1: 10 },
    { id: '12222', name: 'Duronto Express', route: 'PUNE - HWH', sleeper: 120, ac3: 60, ac2: 25, ac1: 5 },
    { id: '22416', name: 'Vande Bharat', route: 'NDLS - CNB', sleeper: 'N/A', ac3: 85, ac2: 30, ac1: 15 },
    { id: '12157', name: 'Hutatma Express', route: 'PUNE - SUR', sleeper: 200, ac3: 50, ac2: 20, ac1: 'N/A' },
    { id: '12105', name: 'Vidarbha Express', route: 'MMCT - NK - NGP', sleeper: 85, ac3: 110, ac2: 40, ac1: 12 },
    { id: '12137', name: 'Punjab Mail', route: 'MMCT - NK - FZR', sleeper: 12, ac3: 45, ac2: 8, ac1: 4 },
  ];

  const filteredData = availabilityData.filter(train => 
    train.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    train.id.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Monitor size={28} color="var(--orange-500)" />
          Check Seat Availability
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Real-time seat counts across all classes and routes.</p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden', background: 'white' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search Train Name or Number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--navy-900)', color: 'white' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Train</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Route</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Sleeper</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>AC 3-Tier</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>AC 2-Tier</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>AC First</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((train, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--gray-200)', transition: 'var(--transition)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--navy-900)' }}>{train.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>#{train.id}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--navy-700)' }}>{train.route}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={train.sleeper === 0 ? 'badge badge-cancelled' : 'badge badge-confirmed'} style={{ backgroundColor: train.sleeper === 'N/A' ? 'var(--gray-200)' : undefined, color: train.sleeper === 'N/A' ? 'var(--text-secondary)' : undefined }}>
                      {train.sleeper === 0 ? 'Full' : train.sleeper}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className="badge badge-confirmed">{train.ac3}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className="badge badge-confirmed">{train.ac2}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className="badge badge-confirmed" style={{ backgroundColor: train.ac1 === 'N/A' ? 'var(--gray-200)' : undefined, color: train.ac1 === 'N/A' ? 'var(--text-secondary)' : undefined }}>
                      {train.ac1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Availability;
