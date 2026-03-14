import React, { useState } from 'react';
import { Database, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useBookings } from '../context/useBookings';

function AdminConsole() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { bookings } = useBookings();

  // Filter Bookings DB data to demonstrate the output of JOIN queries
  const filteredBookings = bookings.filter(b => 
    b.pnr.includes(searchTerm) || b.user.toLowerCase().includes(searchTerm.toLowerCase()) || b.train.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 if searching
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database size={28} color="var(--emerald-500)" />
            DBMS Management Console
          </h1>
          <p style={{ color: 'var(--slate-400)', marginTop: '0.5rem' }}>Live view of the `Bookings` and `Users` relational tables.</p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--emerald-300)', background: 'rgba(6, 78, 59, 0.4)', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--emerald-800)' }}>
          <strong>Executed SQL:&nbsp;</strong> 
          <code>SELECT b.pnr, u.name, t.name, b.amount, b.status FROM Bookings b JOIN Users u ...</code>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {/* Table Toolbar */}
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--slate-700)' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search PNR, User, or Train..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem', backgroundColor: 'var(--slate-800)' }}
            />
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => alert("Advanced filtering panel coming soon!")}>
            <Filter size={16} /> Filter
          </button>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--slate-800)' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--slate-300)', fontWeight: '600', fontSize: '0.875rem' }}>PNR No</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--slate-300)', fontWeight: '600', fontSize: '0.875rem' }}>Passenger Name</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--slate-300)', fontWeight: '600', fontSize: '0.875rem' }}>Train Details</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--slate-300)', fontWeight: '600', fontSize: '0.875rem' }}>Journey Date</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--slate-300)', fontWeight: '600', fontSize: '0.875rem' }}>Amount</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--slate-300)', fontWeight: '600', fontSize: '0.875rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.length > 0 ? paginatedBookings.map((booking, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--slate-800)', transition: 'var(--transition)' }}>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: '500' }}>{booking.pnr}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--slate-300)' }}>{booking.user}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--slate-300)' }}>{booking.train}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--slate-400)' }}>{booking.date}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--emerald-400)', fontWeight: '500' }}>{booking.amount}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge badge-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--slate-700)', backgroundColor: 'var(--slate-800)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--slate-400)' }}>Showing <strong style={{ color: 'white' }}>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong style={{ color: 'white' }}>{Math.min(currentPage * itemsPerPage, filteredBookings.length)}</strong> of <strong style={{ color: 'white' }}>{filteredBookings.length}</strong> results</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.5rem', borderRadius: '0.25rem', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            ><ChevronLeft size={16} /></button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.5rem', borderRadius: '0.25rem', opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1, cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }} 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
            ><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AdminConsole;
