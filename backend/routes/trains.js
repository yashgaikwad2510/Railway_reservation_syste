// ============================================
// Train Routes - MongoDB Query Execution
// ============================================
const express = require('express');
const router = express.Router();
const { getDb } = require('../config/mongo');

// Helper: get next auto-increment ID
async function getNextId(db, name) {
    const ret = await db.collection('counters').findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true }
    );
    return ret.seq;
}

// ──────────────────────────────────────────────
// GET /api/trains/sources/list - Get unique sources
// ──────────────────────────────────────────────
router.get('/sources/list', async (req, res) => {
    try {
        const db = getDb();
        const sources = await db.collection('trains').distinct('source');
        sources.sort();
        res.json({ success: true, data: sources });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ──────────────────────────────────────────────
// GET /api/trains/destinations/list - Get unique destinations
// ──────────────────────────────────────────────
router.get('/destinations/list', async (req, res) => {
    try {
        const db = getDb();
        const destinations = await db.collection('trains').distinct('destination');
        destinations.sort();
        res.json({ success: true, data: destinations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ──────────────────────────────────────────────
// GET /api/trains/search - Search trains by source & destination
// ──────────────────────────────────────────────
router.get('/search', async (req, res) => {
    try {
        const db = getDb();
        const { source, destination } = req.query;

        if (!source || !destination) {
            return res.status(400).json({
                success: false,
                message: 'Source and destination are required'
            });
        }

        // Find trains matching source and destination (case-insensitive)
        const trains = await db.collection('trains').find({
            source: { $regex: new RegExp(`^${source.trim()}$`, 'i') },
            destination: { $regex: new RegExp(`^${destination.trim()}$`, 'i') }
        }).toArray();

        // Get real available seat counts for each train
        for (const train of trains) {
            const availableCount = await db.collection('seats').countDocuments({
                train_id: train.train_id,
                is_booked: false
            });
            train.real_available = availableCount;
        }

        res.json({
            success: true,
            count: trains.length,
            query: `db.trains.find({source: "${source}", destination: "${destination}"})`,
            data: trains
        });
    } catch (error) {
        console.error('Train search error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ──────────────────────────────────────────────
// GET /api/trains - Get all trains
// ──────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const trains = await db.collection('trains')
            .find({})
            .sort({ train_name: 1 })
            .toArray();

        // Get real available seat counts
        for (const train of trains) {
            const availableCount = await db.collection('seats').countDocuments({
                train_id: train.train_id,
                is_booked: false
            });
            train.real_available = availableCount;
        }

        res.json({ success: true, count: trains.length, data: trains });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ──────────────────────────────────────────────
// GET /api/trains/:id - Get train by ID
// ──────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const train = await db.collection('trains').findOne({
            train_id: parseInt(req.params.id)
        });

        if (!train) {
            return res.status(404).json({ success: false, message: 'Train not found' });
        }
        res.json({ success: true, data: train });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ──────────────────────────────────────────────
// GET /api/trains/:id/seats - Get seat availability for a train
// ──────────────────────────────────────────────
router.get('/:id/seats', async (req, res) => {
    try {
        const db = getDb();
        const trainId = parseInt(req.params.id);

        // Get all seats for this train
        const seats = await db.collection('seats')
            .find({ train_id: trainId })
            .sort({ seat_number: 1 })
            .toArray();

        // For booked seats, look up passenger and booking info
        for (const seat of seats) {
            if (seat.is_booked && seat.booking_id) {
                const booking = await db.collection('bookings').findOne({
                    booking_id: seat.booking_id,
                    status: 'CONFIRMED'
                });
                if (booking) {
                    const passenger = await db.collection('passengers').findOne({
                        passenger_id: booking.passenger_id
                    });
                    seat.pnr_number = booking.pnr_number;
                    seat.passenger_name = passenger ? passenger.name : 'Unknown';
                }
            }
        }

        const available = seats.filter(s => !s.is_booked).length;
        const booked = seats.filter(s => s.is_booked).length;

        res.json({
            success: true,
            train_id: trainId,
            total: seats.length,
            available,
            booked,
            seats
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
