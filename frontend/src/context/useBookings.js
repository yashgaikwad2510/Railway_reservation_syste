import { useContext } from 'react';
import { BookingContext } from './BookingContext';

export const useBookings = () => useContext(BookingContext);
