// ============================================
// Analytics Routes - MongoDB Aggregation
// ============================================
const express = require('express');
const router = express.Router();
const { getDb } = require('../config/mongo');

// GET /api/analytics/dashboard - Complete dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        const db = getDb();

        // Total bookings
        const totalBookings = await db.collection('bookings').countDocuments();
        const confirmedBookings = await db.collection('bookings').countDocuments({ status: 'CONFIRMED' });
        const cancelledBookings = await db.collection('bookings').countDocuments({ status: 'CANCELLED' });

        // Total revenue
        const revenueResult = await db.collection('payments').aggregate([
            { $match: { status: 'SUCCESS' } },
            { $group: { _id: null, total_revenue: { $sum: '$amount' } } }
        ]).toArray();
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total_revenue : 0;

        // Revenue per train
        const revenuePerTrain = await db.collection('bookings').aggregate([
            { $match: { status: 'CONFIRMED' } },
            { $lookup: { from: 'trains', localField: 'train_id', foreignField: 'train_id', as: 'train' } },
            { $unwind: { path: '$train', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'payments', localField: 'booking_id', foreignField: 'booking_id', as: 'payment' } },
            { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } },
            { $match: { 'payment.status': 'SUCCESS' } },
            { $group: { _id: '$train_id', train_name: { $first: '$train.train_name' }, train_number: { $first: '$train.train_number' }, total_bookings: { $sum: 1 }, revenue: { $sum: '$payment.amount' } } },
            { $sort: { revenue: -1 } }
        ]).toArray();

        // Most booked train
        const mostBooked = await db.collection('bookings').aggregate([
            { $match: { status: 'CONFIRMED' } },
            { $group: { _id: '$train_id', booking_count: { $sum: 1 } } },
            { $sort: { booking_count: -1 } },
            { $limit: 1 },
            { $lookup: { from: 'trains', localField: '_id', foreignField: 'train_id', as: 'train' } },
            { $unwind: '$train' },
            { $project: { train_name: '$train.train_name', train_number: '$train.train_number', booking_count: 1 } }
        ]).toArray();

        // Total passengers
        const totalPassengers = await db.collection('passengers').countDocuments();

        // Seat utilization per train
        const trains = await db.collection('trains').find({}).sort({ train_name: 1 }).toArray();
        const seatUtilization = [];
        for (const t of trains) {
            const bookedSeats = await db.collection('seats').countDocuments({ train_id: t.train_id, is_booked: true });
            const availableSeats = await db.collection('seats').countDocuments({ train_id: t.train_id, is_booked: false });
            seatUtilization.push({ train_name: t.train_name, train_number: t.train_number, total_seats: t.total_seats, booked_seats: bookedSeats, available_seats: availableSeats });
        }
        seatUtilization.sort((a, b) => b.booked_seats - a.booked_seats);

        // Recent bookings
        const recentBookings = await db.collection('bookings').aggregate([
            { $sort: { booking_date: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'passengers', localField: 'passenger_id', foreignField: 'passenger_id', as: 'passenger' } },
            { $unwind: { path: '$passenger', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'trains', localField: 'train_id', foreignField: 'train_id', as: 'train' } },
            { $unwind: { path: '$train', preserveNullAndEmptyArrays: true } },
            { $project: { pnr_number: 1, booking_date: 1, status: 1, passenger_name: '$passenger.name', train_name: '$train.train_name', seat_number: 1 } }
        ]).toArray();

        // Bookings by date
        const bookingsByDate = await db.collection('bookings').aggregate([
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$booking_date' } }, count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
            { $limit: 7 },
            { $project: { _id: 0, date: '$_id', count: 1 } }
        ]).toArray();

        res.json({
            success: true,
            data: {
                summary: {
                    total_bookings: totalBookings,
                    confirmed_bookings: confirmedBookings,
                    cancelled_bookings: cancelledBookings,
                    total_revenue: totalRevenue,
                    total_passengers: totalPassengers,
                    most_booked_train: mostBooked.length > 0 ? mostBooked[0] : null
                },
                revenue_per_train: revenuePerTrain,
                seat_utilization: seatUtilization,
                recent_bookings: recentBookings,
                bookings_by_date: bookingsByDate
            },
            queries_used: [
                'db.bookings.countDocuments() – Total & status counts',
                'db.payments.aggregate([{$match}, {$group}]) – Revenue',
                'db.bookings.aggregate([{$lookup}, {$group}]) – Revenue per train',
                'db.bookings.aggregate([{$group}, {$sort}, {$limit}]) – Most booked',
                'db.seats.countDocuments({is_booked}) – Seat utilization'
            ]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
