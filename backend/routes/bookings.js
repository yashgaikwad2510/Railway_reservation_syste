// ============================================
// Booking Routes - MongoDB Implementation
// ============================================
const express = require('express');
const router = express.Router();
const { getDb } = require('../config/mongo');

function generatePNR() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnr = '';
    for (let i = 0; i < 10; i++) pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    return pnr;
}

function generateTxnRef() { return 'TXN' + Date.now() + Math.floor(Math.random() * 1000); }

async function getNextId(db, name) {
    const ret = await db.collection('counters').findOneAndUpdate(
        { _id: name }, { $inc: { seq: 1 } }, { returnDocument: 'after', upsert: true }
    );
    return ret.seq;
}

// POST /api/bookings - Book a ticket
router.post('/', async (req, res) => {
    const steps = [];
    let bookingId = null, paymentId = null, passengerId = null, targetSeat = null, passengerCreated = false;

    try {
        const db = getDb();
        const { passenger_name, email, phone, age, gender, train_id, seat_number, payment_method, simulate_payment_failure } = req.body;

        if (!passenger_name || !email || !phone || !age || !gender || !train_id) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        steps.push({ step: 1, action: 'BEGIN TRANSACTION', status: 'OK', sql: 'session.startTransaction()' });

        const trainIdNum = parseInt(train_id);

        if (seat_number) {
            targetSeat = await db.collection('seats').findOne({ train_id: trainIdNum, seat_number: parseInt(seat_number), is_booked: false });
            if (!targetSeat) throw new Error(`Seat ${seat_number} is already booked or does not exist`);
            steps.push({ step: 2, action: 'CHECK SPECIFIC SEAT', status: 'AVAILABLE', sql: `db.seats.findOne({train_id: ${trainIdNum}, seat_number: ${seat_number}, is_booked: false})` });
        } else {
            targetSeat = await db.collection('seats').findOne({ train_id: trainIdNum, is_booked: false }, { sort: { seat_number: 1 } });
            if (!targetSeat) throw new Error('No seats available on this train');
            steps.push({ step: 2, action: 'CHECK AVAILABILITY (AUTO-ASSIGN)', status: `SEAT ${targetSeat.seat_number} AVAILABLE`, sql: `db.seats.findOne({train_id: ${trainIdNum}, is_booked: false})` });
        }

        const pnr = generatePNR();
        let existingPassenger = await db.collection('passengers').findOne({ email });
        if (existingPassenger) {
            passengerId = existingPassenger.passenger_id;
        } else {
            passengerId = await getNextId(db, 'passenger_id');
            await db.collection('passengers').insertOne({ passenger_id: passengerId, name: passenger_name, email, phone, age: parseInt(age), gender, created_at: new Date() });
            passengerCreated = true;
        }
        steps.push({ step: 3, action: 'PASSENGER RECORD', status: 'OK', passenger_id: passengerId });

        bookingId = await getNextId(db, 'booking_id');
        await db.collection('bookings').insertOne({ booking_id: bookingId, passenger_id: passengerId, train_id: trainIdNum, seat_number: targetSeat.seat_number, booking_date: new Date(), status: 'CONFIRMED', pnr_number: pnr });
        steps.push({ step: 4, action: 'INSERT BOOKING', status: 'OK', sql: `db.bookings.insertOne({...})`, booking_id: bookingId });

        await db.collection('seats').updateOne({ _id: targetSeat._id }, { $set: { is_booked: true, booking_id: bookingId } });
        await db.collection('trains').updateOne({ train_id: trainIdNum, available_seats: { $gt: 0 } }, { $inc: { available_seats: -1 } });
        steps.push({ step: 5, action: 'LOCK SEAT', status: 'LOCKED', sql: `db.seats.updateOne({...}, {$set: {is_booked: true}})` });

        const trainInfo = await db.collection('trains').findOne({ train_id: trainIdNum });
        const fare = trainInfo.fare;
        const txnRef = generateTxnRef();
        paymentId = await getNextId(db, 'payment_id');
        await db.collection('payments').insertOne({ payment_id: paymentId, booking_id: bookingId, amount: fare, payment_date: new Date(), payment_method: payment_method || 'UPI', status: 'SUCCESS', transaction_ref: txnRef });
        steps.push({ step: 6, action: 'INSERT PAYMENT', status: 'SUCCESS', sql: `db.payments.insertOne({...})`, payment_id: paymentId, amount: fare });

        if (simulate_payment_failure) {
            steps.push({ step: 6.5, action: 'PAYMENT GATEWAY', status: 'FAILED', detail: 'Simulated payment gateway error' });
            throw new Error('Payment Gateway Error: Transaction will be rolled back to maintain Atomicity.');
        }

        steps.push({ step: 7, action: 'COMMIT', status: 'SUCCESS', sql: 'Transaction committed' });

        const logId = await getNextId(db, 'log_id');
        await db.collection('transaction_logs').insertOne({ log_id: logId, operation: 'BOOK', booking_id: bookingId, status: 'SUCCESS', details: JSON.stringify({ pnr, seat: targetSeat.seat_number, train_id: trainIdNum, amount: fare }), timestamp: new Date() });

        res.json({
            success: true, message: 'Booking confirmed successfully!', transaction_steps: steps,
            booking: { booking_id: bookingId, pnr_number: pnr, seat_number: targetSeat.seat_number, amount: fare, payment_ref: txnRef, status: 'CONFIRMED' }
        });

    } catch (error) {
        const db = getDb();
        try {
            if (paymentId) await db.collection('payments').deleteOne({ payment_id: paymentId });
            if (targetSeat) {
                await db.collection('seats').updateOne({ _id: targetSeat._id }, { $set: { is_booked: false, booking_id: null } });
                await db.collection('trains').updateOne({ train_id: parseInt(req.body.train_id) }, { $inc: { available_seats: 1 } });
            }
            if (bookingId) await db.collection('bookings').deleteOne({ booking_id: bookingId });
            if (passengerCreated && passengerId) await db.collection('passengers').deleteOne({ passenger_id: passengerId });
        } catch (e) { console.error('Rollback error:', e); }

        steps.push({ step: 'ROLLBACK', action: 'ROLLBACK', status: 'ROLLED_BACK', reason: error.message, sql: 'Manual undo of all operations' });

        try {
            const logId = await getNextId(db, 'log_id');
            await db.collection('transaction_logs').insertOne({ log_id: logId, operation: 'FAILURE', booking_id: null, status: 'FAILED', details: JSON.stringify({ error: error.message }), timestamp: new Date() });
        } catch (e) { console.error('Log error:', e); }

        res.status(400).json({ success: false, message: error.message, transaction_steps: steps });
    }
});

// GET /api/bookings - Get all bookings
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const bookings = await db.collection('bookings').find({}).sort({ booking_date: -1 }).toArray();
        const enriched = [];
        for (const b of bookings) {
            const p = await db.collection('passengers').findOne({ passenger_id: b.passenger_id });
            const t = await db.collection('trains').findOne({ train_id: b.train_id });
            const pay = await db.collection('payments').findOne({ booking_id: b.booking_id });
            enriched.push({
                ...b,
                passenger_name: p ? p.name : 'Unknown', email: p ? p.email : '', phone: p ? p.phone : '', age: p ? p.age : 0, gender: p ? p.gender : '',
                train_name: t ? t.train_name : 'Unknown', train_number: t ? t.train_number : '', source: t ? t.source : '', destination: t ? t.destination : '',
                fare: t ? t.fare : 0, departure_time: t ? t.departure_time : '', arrival_time: t ? t.arrival_time : '',
                amount: pay ? pay.amount : 0, payment_method: pay ? pay.payment_method : '', payment_status: pay ? pay.status : '', transaction_ref: pay ? pay.transaction_ref : ''
            });
        }
        res.json({ success: true, count: enriched.length, data: enriched });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// GET /api/bookings/:pnr - Get booking by PNR
router.get('/:pnr', async (req, res) => {
    try {
        const db = getDb();
        const b = await db.collection('bookings').findOne({ pnr_number: req.params.pnr });
        if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
        const p = await db.collection('passengers').findOne({ passenger_id: b.passenger_id });
        const t = await db.collection('trains').findOne({ train_id: b.train_id });
        const pay = await db.collection('payments').findOne({ booking_id: b.booking_id });
        res.json({ success: true, data: {
            ...b,
            passenger_name: p ? p.name : 'Unknown', email: p ? p.email : '', phone: p ? p.phone : '', age: p ? p.age : 0, gender: p ? p.gender : '',
            train_name: t ? t.train_name : 'Unknown', train_number: t ? t.train_number : '', source: t ? t.source : '', destination: t ? t.destination : '',
            fare: t ? t.fare : 0, departure_time: t ? t.departure_time : '', arrival_time: t ? t.arrival_time : '',
            amount: pay ? pay.amount : 0, payment_method: pay ? pay.payment_method : '', payment_status: pay ? pay.status : '', transaction_ref: pay ? pay.transaction_ref : ''
        }});
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
