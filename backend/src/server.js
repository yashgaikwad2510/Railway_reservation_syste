const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// --- API Routes ---

// 1. Search Trains (Filters by route stations)
app.get('/api/search', async (req, res) => {
  let { source, destination } = req.query;

  // Robust parsing: Handles "Name (CODE)", "Name", or "CODE"
  const parseStation = (str) => {
    if (!str) return { name: '', code: '' };
    const cleaned = str.trim();
    const match = cleaned.match(/\(([^)]+)\)/);
    const code = match ? match[1].toUpperCase() : (cleaned.length <= 5 ? cleaned.toUpperCase() : '');
    const name = cleaned.split('(')[0].trim();
    return { name, code };
  };

  const s = parseStation(source);
  const d = parseStation(destination);

  console.log(`[Search] ${source} -> ${destination} | Parsed: ${s.name} (${s.code}) -> ${d.name} (${d.code})`);

  try {
    const [trains] = await db.query(`
      SELECT DISTINCT t.*, 
             r1.departure_time as dep_time, 
             r2.arrival_time as arr_time
      FROM Trains t
      JOIN Routes r1 ON t.train_no = r1.train_no
      JOIN Routes r2 ON t.train_no = r2.train_no
      JOIN Stations s1 ON r1.station_code = s1.station_code
      JOIN Stations s2 ON r2.station_code = s2.station_code
      WHERE (s1.station_name LIKE ? OR s1.station_code = ?)
        AND (s2.station_name LIKE ? OR s2.station_code = ?)
        AND r1.stop_sequence < r2.stop_sequence
    `, [`%${s.name}%`, s.code, `%${d.name}%`, d.code]);

    for (let train of trains) {
      const [classes] = await db.query('SELECT * FROM Train_Classes WHERE train_no = ?', [train.train_no]);
      train.classes = classes.map(c => ({
        class_id: c.class_id,
        class_name: c.class_type,
        available_seats: c.total_seats,
        base_fare: c.base_fare
      }));
    }

    res.json(trains);
  } catch (err) {
    console.error('Search API Error:', err.message);
    res.status(500).json({ error: 'Database search failed', details: err.message });
  }
});

// 2. Get PNR Status
app.get('/api/pnr/:pnr', async (req, res) => {
  try {
    const [booking] = await db.query(`
      SELECT b.*, u.first_name, u.last_name, t.train_name, t.train_no
      FROM Bookings b
      JOIN Users u ON b.user_id = u.user_id
      JOIN Trains t ON b.train_no = t.train_no
      WHERE b.pnr_no = ?
    `, [req.params.pnr]);

    if (booking.length === 0) return res.status(404).json({ error: 'PNR not found' });
    res.json(booking[0]);
  } catch (err) {
    console.error('PNR API Error:', err.message);
    res.status(500).json({ error: 'PNR lookup failed' });
  }
});

// 3. Create Booking
app.post('/api/bookings', async (req, res) => {
  const { trainNo, classType, journeyDate, amount } = req.body;
  const pnr = Math.floor(1000000000 + Math.random() * 9000000000);

  try {
    // Note: In real app, we'd get source/dest from the search context
    // For demo, we'll use NDLS -> MMCT as default or fetch from Trains table
    await db.query(
      `INSERT INTO Bookings (pnr_no, user_id, train_no, class_type, source_station, destination_station, journey_date, total_amount, booking_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pnr, 1, trainNo, classType, 'NDLS', 'MMCT', journeyDate || '2026-03-25', amount || 0.00, 'Confirmed']
    );

    res.json({ pnr, status: 'Confirmed' });
  } catch (err) {
    console.error('Booking API Error:', err.message);
    res.status(500).json({ error: 'Booking failed', details: err.message });
  }
});

// 4. Cancel Booking
app.post('/api/bookings/cancel', async (req, res) => {
  const { pnr } = req.body;
  try {
    await db.query('UPDATE Bookings SET status = ? WHERE pnr_no = ?', ['Cancelled', pnr]);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Cancellation failed' });
  }
});

// 5. User Auth (Mock for now, easy to extend)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM Users WHERE email = ? AND password_hash = ?', [email, password]);
    if (users.length > 0) {
      res.json({ success: true, user: users[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
