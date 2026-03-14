import React, { useState } from 'react';
import { Armchair, Check } from 'lucide-react';
import { useBookings } from '../context/useBookings';

function SeatSelection({ trainNo, trainName, classType }) {
  // Generate a mock coach layout based on class type
  // For 3A or SL, typically standard 8-seat bays (Lower, Middle, Upper x2 + Sub SL, SU)
  // To keep it simple, we render 2 bays (16 seats) as an example representation of the "Seats" table relation.
  
  const generateSeats = () => {
    let seats = [];
    for(let i=1; i<=16; i++) {
        let type = '';
        let rowMod = i % 8;
        if(rowMod === 1 || rowMod === 4) type = 'LB';
        else if(rowMod === 2 || rowMod === 5) type = 'MB';
        else if(rowMod === 3 || rowMod === 6) type = 'UB';
        else if(rowMod === 7) type = 'SL';
        else if(rowMod === 0) type = 'SU';
        
        // Mock some seats as already booked
        const isBooked = [2, 5, 12, 16].includes(i); 
        seats.push({ id: `S1-${i}`, number: i, type, isBooked });
    }
    return seats;
  };

  const [seats] = useState(generateSeats());
  const [selectedSeats, setSelectedSeats] = useState([]);
  const { addBooking } = useBookings();

  const toggleSeat = (seat) => {
    if (seat.isBooked) return;
    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seat.id));
    } else {
      if (selectedSeats.length >= 6) {
        alert("Maximum 6 passengers allowed per booking!");
        return;
      }
      setSelectedSeats([...selectedSeats, seat.id]);
    }
  };

  const handleConfirm = async () => {
    if(selectedSeats.length === 0) return;
    
    // Simulate database insertion logic
    const baseFare = classType === '1A' ? 4500 : (classType === '2A' ? 2800 : (classType === '3A' ? 1800 : 800));
    const totalAmount = baseFare * selectedSeats.length;

    // Add to Global Context
    const pnr = await addBooking({
      trainNo: trainNo,
      train: trainName, // Pass train name for UI
      classType: classType,
      journeyDate: '2026-03-25',
      amount: totalAmount,
      seats: selectedSeats,
      status: 'Confirmed'
    });

    alert(`Confirmed booking for ${selectedSeats.join(', ')}.\nPNR Generated: ${pnr}\n\nSQL Triggered: UPDATE Seat_Availability SET available_seats = available_seats - ${selectedSeats.length} WHERE ...`);
    
    // Reset selection
    setSelectedSeats([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem' }}>
      
      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--slate-300)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: 'var(--slate-700)', borderRadius: '4px' }}></div>
          Available
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: 'var(--status-cancelled)', borderRadius: '4px' }}></div>
          Booked
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: 'var(--orange-500)', borderRadius: '4px' }}></div>
          Selected
        </div>
      </div>

      {/* Coach Layout 2D Map */}
      <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {/* Render bays of 8 */}
        {[0, 1].map(bayIndex => (
          <div key={bayIndex} style={{ display: 'flex', gap: '1rem', border: '1px solid var(--slate-600)', padding: '1rem', borderRadius: '0.5rem', minWidth: 'max-content' }}>
            {/* Left side (Main Berths) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                 {[1,2,3].map(offset => {
                    const seat = seats[bayIndex*8 + offset - 1];
                    const isSelected = selectedSeats.includes(seat.id);
                    return (
                      <div 
                        key={seat.id}
                        onClick={() => toggleSeat(seat)}
                        title={`${seat.id} (${seat.type})`}
                        style={{
                          width: '40px', height: '40px',
                          display: 'flex', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: seat.isBooked ? '#cbd5e1' : (isSelected ? 'var(--orange-500)' : 'var(--navy-800)'),
                            color: seat.isBooked ? 'var(--slate-500)' : 'white', fontSize: '0.75rem', fontWeight: 'bold',
                            borderRadius: '0.25rem', cursor: seat.isBooked ? 'not-allowed' : 'pointer',
                            border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                            transition: 'var(--transition)'
                          }}
                        >
                          {seat.number}
                        </div>
                      )
                   })}
                 </div>
                 <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                   {[4,5,6].map(offset => {
                      const seat = seats[bayIndex*8 + offset - 1];
                      const isSelected = selectedSeats.includes(seat.id);
                      return (
                        <div 
                          key={seat.id}
                          onClick={() => toggleSeat(seat)}
                          title={`${seat.id} (${seat.type})`}
                          style={{
                            width: '40px', height: '40px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: seat.isBooked ? '#cbd5e1' : (isSelected ? 'var(--orange-500)' : 'var(--navy-800)'),
                            color: seat.isBooked ? 'var(--slate-500)' : 'white', fontSize: '0.75rem', fontWeight: 'bold',
                            borderRadius: '0.25rem', cursor: seat.isBooked ? 'not-allowed' : 'pointer',
                            border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                            transition: 'var(--transition)'
                          }}
                        >
                          {seat.number}
                        </div>
                      )
                   })}
                 </div>
              </div>

              {/* Aisle Space */}
              <div style={{ width: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <span style={{ color: 'var(--slate-400)', fontSize: '0.7rem', writingMode: 'vertical-rl', fontWeight: '600', letterSpacing: '0.1em' }}>AISLE</span>
              </div>

              {/* Right side (Side Berths) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
                   {[7,8].map(offset => {
                      const seat = seats[bayIndex*8 + offset - 1];
                      const isSelected = selectedSeats.includes(seat.id);
                      return (
                        <div 
                          key={seat.id}
                          onClick={() => toggleSeat(seat)}
                          title={`${seat.id} (${seat.type})`}
                          style={{
                            width: '40px', height: '50px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: seat.isBooked ? '#cbd5e1' : (isSelected ? 'var(--orange-500)' : 'var(--navy-800)'),
                            color: seat.isBooked ? 'var(--slate-500)' : 'white', fontSize: '0.75rem', fontWeight: 'bold',
                            borderRadius: '0.25rem', cursor: seat.isBooked ? 'not-allowed' : 'pointer',
                            border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                            transition: 'var(--transition)'
                          }}
                        >
                          {seat.number}
                        </div>
                      )
                   })}
              </div>
          </div>
        ))}
      </div>

      {/* Confirmation Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--slate-700)', padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0 0 1rem 1rem' }}>
        <div style={{ color: 'var(--slate-300)', fontSize: '1rem' }}>
          Selected: <strong style={{ color: 'var(--orange-500)', fontSize: '1.2rem' }}>{selectedSeats.length}</strong> seat(s)
          {selectedSeats.length > 0 && <span style={{ marginLeft: '1rem', color: 'var(--slate-400)' }}>| [ {selectedSeats.map(id => id.split('-')[1]).join(', ')} ]</span>}
        </div>
        <button 
          className="btn btn-primary" 
          disabled={selectedSeats.length === 0} 
          onClick={handleConfirm} 
          style={{ 
            padding: '0.75rem 2rem', 
            fontSize: '1rem', 
            fontWeight: 'bold',
            boxShadow: selectedSeats.length > 0 ? '0 4px 15px rgba(249, 115, 22, 0.4)' : 'none',
            opacity: selectedSeats.length === 0 ? 0.5 : 1 
          }}
        >
          <Check size={18} style={{ marginRight: '0.5rem' }} /> Proceed to Book
        </button>
      </div>

    </div>
  );
}

export default SeatSelection;
