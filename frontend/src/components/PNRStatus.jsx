import React, { useState } from 'react';
import { CalendarSearch, Search, Ticket, User, MapPin } from 'lucide-react';

function PNRStatus() {
  const [pnr, setPnr] = useState('');
  const [status, setStatus] = useState(null);

  const mockStatuses = {
    '4567890123': { 
      passenger: 'Harshad Thok', 
      train: 'Rajdhani Express (12001)', 
      from: 'New Delhi (NDLS)', 
      to: 'Mumbai Central (MMCT)', 
      date: '2026-03-25', 
      status: 'CNF', 
      coach: 'B1', 
      berth: '32 (Side Lower)' 
    },
    '1234567890': { 
      passenger: 'Aryan Kumar', 
      train: 'Shatabdi Express (12045)', 
      from: 'New Delhi (NDLS)', 
      to: 'Pune Junction (PUNE)', 
      date: '2026-03-28', 
      status: 'WL 12', 
      coach: 'N/A', 
      berth: 'N/A' 
    },
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pnr) return;

    try {
      const response = await fetch(`http://localhost:5000/api/pnr/${pnr}`);
      const data = await response.json();

      if (response.ok) {
        setStatus({
          passenger: `${data.first_name} ${data.last_name}`,
          train: `${data.train_name} (${data.train_no})`,
          from: data.source_station,
          to: data.destination_station,
          date: new Date(data.journey_date).toLocaleDateString(),
          status: data.booking_status === 'Confirmed' ? 'CNF' : 'WL',
          coach: 'Pending',
          berth: 'Waitlisted/Confirmed'
        });
      } else {
        setStatus('NOT_FOUND');
      }
    } catch (err) {
      console.error('PNR Fetch Error:', err);
      setStatus('NOT_FOUND');
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CalendarSearch size={28} color="var(--orange-500)" />
          PNR Status Check
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Check the current booking status of your rail ticket.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', background: 'white', maxWidth: '600px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Ticket size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Enter 10-digit PNR Number" 
              maxLength="10"
              value={pnr}
              onChange={(e) => setPnr(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            <Search size={18} /> Get Status
          </button>
        </form>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Try PNR: <strong>4567890123</strong> or <strong>1234567890</strong>
        </p>
      </div>

      {status === 'NOT_FOUND' && (
        <div className="glass-panel" style={{ padding: '2rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', textAlign: 'center' }}>
          No records found for PNR: <strong>{pnr}</strong>. Please check the number and try again.
        </div>
      )}

      {status && status !== 'NOT_FOUND' && (
        <div className="glass-panel animate-fade-in" style={{ background: 'white', overflow: 'hidden' }}>
          <div style={{ backgroundColor: 'var(--navy-600)', color: 'white', padding: '1rem 2rem', fontWeight: '600' }}>
            PNR SEARCH RESULT
          </div>
          <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Passenger Name</div>
              <div style={{ fontWeight: '600', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} /> {status.passenger}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Train Details</div>
              <div style={{ fontWeight: '600', color: 'var(--navy-900)' }}>{status.train}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Journey From</div>
              <div style={{ fontWeight: '600', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} /> {status.from}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Journey To</div>
              <div style={{ fontWeight: '600', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} /> {status.to}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Journey Date</div>
              <div style={{ fontWeight: '600', color: 'var(--navy-900)' }}>{status.date}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Booking Status</div>
              <div className={`badge ${status.status === 'CNF' ? 'badge-confirmed' : 'badge-waiting'}`} style={{ fontSize: '1rem' }}>
                {status.status}
              </div>
            </div>
            {status.coach !== 'N/A' && (
              <>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Coach</div>
                  <div style={{ fontWeight: '600', color: 'var(--navy-900)' }}>{status.coach}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Berth</div>
                  <div style={{ fontWeight: '600', color: 'var(--navy-900)' }}>{status.berth}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PNRStatus;
