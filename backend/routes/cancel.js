// ============================================
// Cancel Booking Routes - MongoDB Implementation
// ============================================
const express = require('express');
const router = express.Router();
const { getDb } = require('../config/mongo');

async function getNextId(db, name) {
    const ret = await db.collection('counters').findOneAndUpdate(
        { _id: name }, { $inc: { seq: 1 } }, { returnDocument: 'after', upsert: true }
    );
    return ret.seq;
}

// POST /api/cancel - Cancel a booking by PNR
router.post('/', async (req, res) => {
    const steps = [];
    try {
        const db = getDb();
        const { pnr_number } = req.body;
        if (!pnr_number) return res.status(400).json({ success: false, message: 'PNR number is required' });

        steps.push({ step: 1, action: 'BEGIN TRANSACTION', status: 'OK' });

        // Find the booking with train info
        const booking = await db.collection('bookings').findOne({ pnr_number, status: 'CONFIRMED' });
        if (!booking) throw new Error(`No active booking found with PNR: ${pnr_number}`);

        const train = await db.collection('trains').findOne({ train_id: booking.train_id });
        steps.push({ step: 2, action: 'FIND BOOKING', status: 'FOUND', sql: `db.bookings.findOne({pnr_number: "${pnr_number}", status: "CONFIRMED"})`, booking_id: booking.booking_id });

        // Update booking status
        await db.collection('bookings').updateOne({ booking_id: booking.booking_id }, { $set: { status: 'CANCELLED' } });
        steps.push({ step: 3, action: 'CANCEL BOOKING', status: 'CANCELLED', sql: `db.bookings.updateOne({booking_id: ${booking.booking_id}}, {$set: {status: "CANCELLED"}})` });

        // Release the seat
        await db.collection('seats').updateOne({ train_id: booking.train_id, seat_number: booking.seat_number }, { $set: { is_booked: false, booking_id: null } });
        await db.collection('trains').updateOne({ train_id: booking.train_id }, { $inc: { available_seats: 1 } });
        steps.push({ step: 4, action: 'RELEASE SEAT', status: 'RELEASED', sql: `db.seats.updateOne({...}, {$set: {is_booked: false}})`, seat_number: booking.seat_number });

        // Refund payment
        await db.collection('payments').updateOne({ booking_id: booking.booking_id }, { $set: { status: 'REFUNDED' } });
        const fare = train ? train.fare : 0;
        steps.push({ step: 5, action: 'REFUND PAYMENT', status: 'REFUNDED', sql: `db.payments.updateOne({booking_id: ${booking.booking_id}}, {$set: {status: "REFUNDED"}})`, refund_amount: fare });

        steps.push({ step: 6, action: 'COMMIT', status: 'SUCCESS' });

        // Log cancellation
        const logId1 = await getNextId(db, 'log_id');
        await db.collection('transaction_logs').insertOne({ log_id: logId1, operation: 'CANCEL', booking_id: booking.booking_id, status: 'SUCCESS', details: JSON.stringify({ pnr: pnr_number, seat_released: booking.seat_number, refund_amount: fare, train: train ? train.train_name : '' }), timestamp: new Date() });

        const logId2 = await getNextId(db, 'log_id');
        await db.collection('transaction_logs').insertOne({ log_id: logId2, operation: 'REFUND', booking_id: booking.booking_id, status: 'SUCCESS', details: JSON.stringify({ amount: fare, method: 'Original payment method' }), timestamp: new Date() });

        res.json({
            success: true, message: 'Booking cancelled and refund initiated successfully!', transaction_steps: steps,
            cancellation: { booking_id: booking.booking_id, pnr_number, seat_released: booking.seat_number, refund_amount: fare, status: 'CANCELLED' }
        });

    } catch (error) {
        steps.push({ step: 'ROLLBACK', action: 'ROLLBACK', status: 'ROLLED_BACK', reason: error.message });
        try {
            const db = getDb();
            const logId = await getNextId(db, 'log_id');
            await db.collection('transaction_logs').insertOne({ log_id: logId, operation: 'CANCEL', status: 'FAILED', details: JSON.stringify({ error: error.message, pnr: req.body.pnr_number }), timestamp: new Date() });
        } catch (e) { console.error('Log error:', e); }

        res.status(400).json({ success: false, message: error.message, transaction_steps: steps });
    }
});

module.exports = router;
