import React, { createContext, useState, useContext } from 'react';

// Create Context
export const BookingContext = createContext();

// Context Provider Component
export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);

  // Fetch initial bookings from DB
  React.useEffect(() => {
    fetch('http://localhost:5000/api/pnr/8910293402') 
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          // Normalize DB keys (snake_case) to UI keys (camelCase/flat)
          const normalized = {
            ...data,
            pnr: data.pnr_no || data.pnr,
            train: data.train_name || data.train,
            date: data.journey_date || data.date,
            status: data.booking_status || data.status
          };
          setBookings([normalized]);
        }
      })
      .catch(err => console.error('Error fetching bookings:', err));
  }, []);

  // Method to add a new booking
  const addBooking = async (newBooking) => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }
      
      const fullBooking = {
        ...newBooking,
        pnr: data.pnr || data.pnr_no,
        train: newBooking.train || newBooking.trainName,
        date: newBooking.journeyDate || newBooking.date
      };
      
      setBookings([fullBooking, ...bookings]);
      return fullBooking.pnr;
    } catch (err) {
      console.error('Booking Error:', err);
      return null;
    }
  };

  // Method to cancel a booking
  const cancelBooking = async (pnr) => {
    try {
      await fetch('http://localhost:5000/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pnr })
      });
      
      setBookings(prev => prev.map(b => 
        b.pnr === pnr ? { ...b, status: 'Cancelled' } : b
      ));
    } catch (err) {
      console.error('Cancellation Error:', err);
    }
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  );
};
