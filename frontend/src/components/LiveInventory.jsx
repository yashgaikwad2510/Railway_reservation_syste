import React, { useState } from 'react';
import { Clock, TrainFront, CheckCircle2, ChevronDown } from 'lucide-react';
import SeatSelection from './SeatSelection';

function LiveInventory() {
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  // Mock DB Data mapping to `Trains` and `Seat_Availability` tables
  const mockTrains = [
    {
      train_no: 12952,
      train_name: 'Mumbai Rajdhani',
      departure: '16:30',
      arrival: '08:35',
      duration: '16h 05m',
      classes: [
        { type: '1A', available: 12, total: 46, status: 'AVAILABLE', price: 4500 },
        { type: '2A', available: 45, total: 108, status: 'AVAILABLE', price: 2800 },
        { type: '3A', available: 2, total: 256, status: 'FAST _FILLING', price: 2100 }
      ]
    },
    {
      train_no: 12157,
      train_name: 'Pune Express',
      departure: '19:00',
      arrival: '13:45',
      duration: '18h 45m',
      classes: [
        { type: '2A', available: 0, total: 54, status: 'WL-15', price: 2400 },
        { type: '3A', available: 18, total: 192, status: 'AVAILABLE', price: 1800 },
        { type: 'SL', available: 124, total: 432, status: 'AVAILABLE', price: 650 }
      ]
    }
  ];

  const handleBook = (train, cls) => {
    if (selectedTrain?.train_no === train.train_no && selectedClass === cls.type) {
      setSelectedTrain(null);
      setSelectedClass(null);
    } else {
      setSelectedTrain(train);
      setSelectedClass(cls.type);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <TrainFront size={24} color="var(--emerald-500)" />
        Available Trains
      </h2>
      
      {mockTrains.map((train) => (
        <div key={train.train_no} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Train Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--slate-50)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {train.train_name} <span style={{ fontSize: '0.9rem', color: 'var(--slate-400)' }}>({train.train_no})</span>
              </h3>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--slate-300)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={16} /> Dep: <strong>{train.departure}</strong></span>
                <span style={{ color: 'var(--slate-500)' }}>→ {train.duration} →</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Arr: <strong>{train.arrival}</strong></span>
              </div>
            </div>
            <div className="badge badge-confirmed" style={{ alignSelf: 'flex-start' }}>Runs Daily</div>
          </div>

          {/* Classes Cards */}
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {train.classes.map((cls) => {
              const isWl = cls.status.startsWith('WL');
              const isSelected = selectedTrain?.train_no === train.train_no && selectedClass === cls.type;
              
              return (
                <div 
                  key={cls.type}
                  onClick={() => handleBook(train, cls)}
                  style={{ 
                    minWidth: '160px',
                    padding: '1rem', 
                    borderRadius: '0.75rem', 
                    border: `1px solid ${isSelected ? 'var(--emerald-500)' : 'var(--slate-600)'}`,
                    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'var(--slate-800)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    <span>{cls.type}</span>
                    <span style={{ color: 'var(--emerald-400)' }}>₹{cls.price}</span>
                  </div>
                  <div style={{ 
                    color: isWl ? 'var(--status-waiting)' : (cls.available < 10 ? 'var(--status-cancelled)' : 'var(--status-confirmed)'), 
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    marginBottom: '0.25rem'
                  }}>
                    {isWl ? cls.status : `AVAILABLE ${cls.available}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                    Total capacity: {cls.total}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inline Seat Layout Expander */}
          {selectedTrain?.train_no === train.train_no && (
            <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--slate-700)', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--emerald-300)' }}>Select your Berths • {selectedClass} Class</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--emerald-300)', background: 'rgba(6, 78, 59, 0.4)', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--emerald-800)', display: 'inline-flex' }}>
                  <strong>SQL:&nbsp;</strong> <code>SELECT * FROM Seat_Availability WHERE train_no = {train.train_no} AND class_type = '{selectedClass}';</code>
                </div>
              </div>
              <SeatSelection trainNo={train.train_no} classType={selectedClass} />
            </div>
          )}

        </div>
      ))}
    </div>
  );
}

export default LiveInventory;
