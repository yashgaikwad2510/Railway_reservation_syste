import React, { useState } from 'react';
import { XCircle, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useBookings } from '../context/useBookings';

function CancelTicket() {
  const { bookings, cancelBooking } = useBookings();
  const [showConfirm, setShowConfirm] = useState(null);
  const [cancelledPnr, setCancelledPnr] = useState(null);

  const handleCancelClick = (pnr) => {
    setShowConfirm(pnr);
  };

  const confirmCancellation = () => {
    cancelBooking(showConfirm);
    setCancelledPnr(showConfirm);
    setShowConfirm(null);
    setTimeout(() => setCancelledPnr(null), 3000);
  };

  const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Waiting');

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <XCircle size={28} color="var(--orange-500)" />
          Cancel Ticket
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>View and manage your bookings. Please note that cancellation charges may apply.</p>
      </div>

      {cancelledPnr && (
        <div className="animate-fade-in" style={{ background: '#dcfce7', color: '#166534', padding: '1rem 2rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CheckCircle size={24} />
          <span>Ticket with PNR <strong>{cancelledPnr}</strong> has been successfully cancelled. Refund will be initiated shortly.</span>
        </div>
      )}

      {showConfirm && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', background: 'white', border: '2px solid var(--orange-500)', maxWidth: '500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#991b1b' }}>
            <AlertTriangle size={32} />
            <h3 style={{ margin: 0 }}>Confirm Cancellation?</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Are you sure you want to cancel the booking for PNR: <strong>{showConfirm}</strong>? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-navy" style={{ flex: 1 }} onClick={() => setShowConfirm(null)}>No, Keep It</button>
            <button className="btn" style={{ flex: 1, backgroundColor: '#ef4444', color: 'white' }} onClick={confirmCancellation}>Yes, Cancel It</button>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ background: 'white', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--navy-900)', color: 'white', fontWeight: '600' }}>
          YOUR ACTIVE BOOKINGS
        </div>
        
        {activeBookings.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>PNR</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Train</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeBookings.map((booking, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--navy-600)' }}>{booking.pnr}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--navy-900)' }}>{booking.train}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{booking.date}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={`badge ${booking.status === 'Confirmed' ? 'badge-confirmed' : 'badge-waiting'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.8rem', color: '#ef4444', borderColor: '#fecaca', fontSize: '0.9rem' }}
                        onClick={() => handleCancelClick(booking.pnr)}
                      >
                        <Trash2 size={16} /> Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <XCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>You have no active bookings to cancel.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CancelTicket;
