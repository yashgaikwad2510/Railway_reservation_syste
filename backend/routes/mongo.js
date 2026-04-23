// ============================================
// MongoDB Routes - Full CRUD + Advanced Queries
// ============================================
// 12+ MongoDB operations including aggregation,
// $lookup, indexing, and comparison with SQL
// ============================================
const express = require('express');
const router = express.Router();
const { getDb } = require('../config/mongo');
const { ObjectId } = require('mongodb');

// ══════════════════════════════════════════════
// 1. POST /api/mongo/book - Insert a booking
// MongoDB Query: insertOne()
// ══════════════════════════════════════════════
router.post('/book', async (req, res) => {
    try {
        const db = getDb();
        const { passenger_name, email, phone, age, gender, train, train_number, source, destination, seat_number, fare, payment_method } = req.body;

        if (!passenger_name || !train) {
            return res.status(400).json({ success: false, message: 'passenger_name and train are required' });
        }

        const pnr = 'MNG' + Date.now().toString(36).toUpperCase();

        // QUERY 1: insertOne
        const booking = {
            pnr,
            passenger_name,
            passenger_email: email || '',
            passenger_phone: phone || '',
            passenger_age: age || 0,
            passenger_gender: gender || 'Other',
            train,
            train_number: train_number || '',
            source: source || '',
            destination: destination || '',
            seat_number: seat_number || Math.floor(Math.random() * 60) + 1,
            fare: parseFloat(fare) || 0,
            payment_method: payment_method || 'UPI',
            payment_status: 'SUCCESS',
            status: 'CONFIRMED',
            booking_date: new Date(),
            created_at: new Date()
        };

        const result = await db.collection('bookings').insertOne(booking);

        res.json({
            success: true,
            message: 'MongoDB booking created successfully',
            mongo_query: 'db.bookings.insertOne({...})',
            data: { ...booking, _id: result.insertedId }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// 2. GET /api/mongo/search - Find bookings
// MongoDB Query: find()
// ══════════════════════════════════════════════
router.get('/search', async (req, res) => {
    try {
        const db = getDb();
        const { train, status, email, pnr } = req.query;
        const filter = {};

        if (train) filter.train = { $regex: train, $options: 'i' };
        if (status) filter.status = status;
        if (email) filter.passenger_email = email;
        if (pnr) filter.pnr = pnr;

        // QUERY 2: find with filter
        const bookings = await db.collection('bookings')
            .find(filter)
            .sort({ booking_date: -1 })
            .toArray();

        res.json({
            success: true,
            count: bookings.length,
            mongo_query: `db.bookings.find(${JSON.stringify(filter)}).sort({booking_date: -1})`,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// 3. PUT /api/mongo/update/:id - Update a booking
// MongoDB Query: updateOne()
// ══════════════════════════════════════════════
router.put('/update/:id', async (req, res) => {
    try {
        const db = getDb();
        const updates = req.body;
        delete updates._id; // Prevent _id modification

        // QUERY 3: updateOne
        const result = await db.collection('bookings').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { ...updates, updated_at: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({
            success: true,
            message: 'Booking updated successfully',
            mongo_query: `db.bookings.updateOne({_id: ObjectId("${req.params.id}")}, {$set: {...}})`,
            modified: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// 4. DELETE /api/mongo/delete/:id - Delete a booking
// MongoDB Query: deleteOne()
// ══════════════════════════════════════════════
router.delete('/delete/:id', async (req, res) => {
    try {
        const db = getDb();

        // QUERY 4: deleteOne
        const result = await db.collection('bookings').deleteOne(
            { _id: new ObjectId(req.params.id) }
        );

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({
            success: true,
            message: 'Booking deleted successfully',
            mongo_query: `db.bookings.deleteOne({_id: ObjectId("${req.params.id}")})`,
            deleted: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// 5. GET /api/mongo/aggregate/revenue - Aggregation: Total revenue per train
// MongoDB Query: aggregate() with $group
// ══════════════════════════════════════════════
router.get('/aggregate/revenue', async (req, res) => {
    try {
        const db = getDb();

        // QUERY 5: aggregate with $group
        const pipeline = [
            { $match: { status: 'CONFIRMED', payment_status: 'SUCCESS' } },
            {
                $group: {
                    _id: '$train',
                    total_revenue: { $sum: '$fare' },
                    total_bookings: { $sum: 1 },
                    avg_fare: { $avg: '$fare' },
                    passengers: { $push: '$passenger_name' }
                }
            },
            { $sort: { total_revenue: -1 } }
        ];

        const results = await db.collection('bookings').aggregate(pipeline).toArray();

        res.json({
            success: true,
            mongo_query: 'db.bookings.aggregate([{$match: ...}, {$group: {_id: "$train", total_revenue: {$sum: "$fare"}, ...}}, {$sort: ...}])',
            data: results
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// 6. GET /api/mongo/aggregate/stats - Aggregation: Booking stats
// MongoDB Query: aggregate() with $facet
// ══════════════════════════════════════════════
router.get('/aggregate/stats', async (req, res) => {
    try {
        const db = getDb();

        // QUERY 6: aggregate with $facet
        const pipeline = [
            {
                $facet: {
                    statusCounts: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    paymentMethods: [
                        { $group: { _id: '$payment_method', count: { $sum: 1 }, total: { $sum: '$fare' } } }
                    ],
                    recentBookings: [
                        { $sort: { booking_date: -1 } },
                        { $limit: 5 },
                        { $project: { pnr: 1, passenger_name: 1, train: 1, status: 1, fare: 1 } }
                    ],
                    totalRevenue: [
                        { $match: { status: 'CONFIRMED' } },
                        { $group: { _id: null, total: { $sum: '$fare' } } }
                    ]
                }
            }
        ];

        const results = await db.collection('bookings').aggregate(pipeline).toArray();

        res.json({
            success: true,
            mongo_query: 'db.bookings.aggregate([{$facet: {statusCounts: [...], paymentMethods: [...], ...}}])',
            data: results[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// 7. GET /api/mongo/lookup - $lookup (JOIN collections)
// MongoDB Query: aggregate() with $lookup
// ══════════════════════════════════════════════
router.get('/lookup', async (req, res) => {
    try {
        const db = getDb();

        // First ensure we have a trains collection
        const trainCount = await db.collection('trains').countDocuments();
        if (trainCount === 0) {
            // Seed trains collection
            await db.collection('trains').insertMany([
                { train_number: '12301', name: 'Rajdhani Express', source: 'Delhi', destination: 'Mumbai', fare: 1450, type: 'Superfast' },
                { train_number: '12302', name: 'Duronto Express', source: 'Mumbai', destination: 'Delhi', fare: 1550, type: 'Superfast' },
                { train_number: '12951', name: 'Mumbai Rajdhani', source: 'Mumbai', destination: 'Delhi', fare: 1650, type: 'Rajdhani' },
                { train_number: '12627', name: 'Karnataka Express', source: 'Delhi', destination: 'Bangalore', fare: 1100, type: 'Express' },
                { train_number: '12839', name: 'Chennai Mail', source: 'Mumbai', destination: 'Chennai', fare: 850, type: 'Mail' }
            ]);
        }

        // QUERY 7: $lookup (LEFT JOIN equivalent)
        const pipeline = [
            {
                $lookup: {
                    from: 'trains',
                    localField: 'train',
                    foreignField: 'name',
                    as: 'train_details'
                }
            },
            { $unwind: { path: '$train_details', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    pnr: 1,
                    passenger_name: 1,
                    train: 1,
                    seat_number: 1,
                    fare: 1,
                    status: 1,
                    'train_details.type': 1,
                    'train_details.source': 1,
                    'train_details.destination': 1
                }
            },
            { $limit: 20 }
        ];

        const results = await db.collection('bookings').aggregate(pipeline).toArray();

        res.json({
            success: true,
            mongo_query: 'db.bookings.aggregate([{$lookup: {from: "trains", localField: "train", foreignField: "name", as: "train_details"}}, ...])',
            equivalent_sql: 'SELECT b.*, t.type, t.source, t.destination FROM bookings b LEFT JOIN trains t ON b.train = t.name',
            data: results
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// 8. GET /api/mongo/indexes - Show indexes
// MongoDB Query: listIndexes()
// ══════════════════════════════════════════════
router.get('/indexes', async (req, res) => {
    try {
        const db = getDb();

        // QUERY 8: listIndexes
        const bookingIndexes = await db.collection('bookings').listIndexes().toArray();
        const trainIndexes = await db.collection('trains').listIndexes().toArray();

        res.json({
            success: true,
            mongo_query: 'db.bookings.getIndexes()',
            indexes: {
                bookings: bookingIndexes,
                trains: trainIndexes
            },
            indexing_explanation: {
                why: 'Indexes speed up queries by creating efficient lookup structures (B-tree)',
                created: [
                    'db.bookings.createIndex({train: 1}) – Speeds up train searches',
                    'db.bookings.createIndex({pnr: 1}, {unique: true}) – Fast PNR lookup + uniqueness',
                    'db.bookings.createIndex({status: 1}) – Filter by booking status',
                    'db.bookings.createIndex({passenger_email: 1}) – Find by email'
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// 9. GET /api/mongo/findone/:pnr - FindOne by PNR
// MongoDB Query: findOne()
// ══════════════════════════════════════════════
router.get('/findone/:pnr', async (req, res) => {
    try {
        const db = getDb();

        // QUERY 9: findOne
        const booking = await db.collection('bookings').findOne({ pnr: req.params.pnr });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({
            success: true,
            mongo_query: `db.bookings.findOne({pnr: "${req.params.pnr}"})`,
            data: booking
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// 10. GET /api/mongo/count - Count documents
// MongoDB Query: countDocuments()
// ══════════════════════════════════════════════
router.get('/count', async (req, res) => {
    try {
        const db = getDb();
        const { status } = req.query;
        const filter = status ? { status } : {};

        // QUERY 10: countDocuments
        const count = await db.collection('bookings').countDocuments(filter);

        res.json({
            success: true,
            mongo_query: `db.bookings.countDocuments(${JSON.stringify(filter)})`,
            count
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// 11. GET /api/mongo/distinct - Get distinct values
// MongoDB Query: distinct()
// ══════════════════════════════════════════════
router.get('/distinct/:field', async (req, res) => {
    try {
        const db = getDb();
        const allowedFields = ['train', 'status', 'payment_method', 'passenger_gender', 'source', 'destination'];

        if (!allowedFields.includes(req.params.field)) {
            return res.status(400).json({ success: false, message: `Field must be one of: ${allowedFields.join(', ')}` });
        }

        // QUERY 11: distinct
        const values = await db.collection('bookings').distinct(req.params.field);

        res.json({
            success: true,
            mongo_query: `db.bookings.distinct("${req.params.field}")`,
            field: req.params.field,
            values,
            count: values.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// 12. PUT /api/mongo/update-many - Update multiple documents
// MongoDB Query: updateMany()
// ══════════════════════════════════════════════
router.put('/update-many', async (req, res) => {
    try {
        const db = getDb();
        const { filter, update } = req.body;

        if (!filter || !update) {
            return res.status(400).json({ success: false, message: 'filter and update are required' });
        }

        // QUERY 12: updateMany
        const result = await db.collection('bookings').updateMany(
            filter,
            { $set: { ...update, updated_at: new Date() } }
        );

        res.json({
            success: true,
            mongo_query: `db.bookings.updateMany(${JSON.stringify(filter)}, {$set: ${JSON.stringify(update)}})`,
            matched: result.matchedCount,
            modified: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// 13. GET /api/mongo/compare - MongoDB Features Comparison
// ══════════════════════════════════════════════
router.get('/compare', async (req, res) => {
    try {
        const db = getDb();

        const mongoBookings = await db.collection('bookings')
            .find({})
            .project({ pnr: 1, passenger_name: 1, train: 1, seat_number: 1, status: 1, fare: 1 })
            .sort({ booking_date: -1 })
            .limit(10)
            .toArray();

        const mongoRevenue = await db.collection('bookings').aggregate([
            { $match: { status: 'CONFIRMED' } },
            { $group: { _id: '$train', revenue: { $sum: '$fare' }, bookings: { $sum: 1 } } }
        ]).toArray();

        res.json({
            success: true,
            comparison: {
                bookings: {
                    query: 'db.bookings.find({}).project({...}).sort({booking_date: -1}).limit(10)',
                    result_count: mongoBookings.length,
                    data: mongoBookings
                },
                revenue_aggregation: {
                    query: 'db.bookings.aggregate([{$match}, {$group}])',
                    data: mongoRevenue
                },
                key_features: [
                    { feature: 'Schema', description: 'Flexible schema (schema-less) — no DDL required' },
                    { feature: 'Joins', description: '$lookup aggregation pipeline for cross-collection queries' },
                    { feature: 'Transactions', description: 'Multi-document transactions (v4.0+) with session support' },
                    { feature: 'Scaling', description: 'Horizontal scaling via sharding' },
                    { feature: 'Query Language', description: 'MQL (MongoDB Query Language) — JSON-based' },
                    { feature: 'Indexing', description: 'B-tree, text, geospatial, compound, and hashed indexes' },
                    { feature: 'Data Model', description: 'Document-oriented with embedded and referenced patterns' }
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ══════════════════════════════════════════════
// GET /api/mongo/all-queries - Summary of all MongoDB queries
// ══════════════════════════════════════════════
router.get('/all-queries', async (req, res) => {
    res.json({
        success: true,
        title: 'All MongoDB Queries Used in This System',
        queries: [
            { id: 1, operation: 'INSERT', query: 'db.bookings.insertOne({...})', endpoint: 'POST /api/mongo/book' },
            { id: 2, operation: 'FIND', query: 'db.bookings.find({filter}).sort({...})', endpoint: 'GET /api/mongo/search' },
            { id: 3, operation: 'UPDATE ONE', query: 'db.bookings.updateOne({_id: ...}, {$set: {...}})', endpoint: 'PUT /api/mongo/update/:id' },
            { id: 4, operation: 'DELETE ONE', query: 'db.bookings.deleteOne({_id: ...})', endpoint: 'DELETE /api/mongo/delete/:id' },
            { id: 5, operation: 'AGGREGATION ($group)', query: 'db.bookings.aggregate([{$group: {_id: "$train", total: {$sum: "$fare"}}}])', endpoint: 'GET /api/mongo/aggregate/revenue' },
            { id: 6, operation: 'AGGREGATION ($facet)', query: 'db.bookings.aggregate([{$facet: {...}}])', endpoint: 'GET /api/mongo/aggregate/stats' },
            { id: 7, operation: '$lookup (JOIN)', query: 'db.bookings.aggregate([{$lookup: {from: "trains", ...}}])', endpoint: 'GET /api/mongo/lookup' },
            { id: 8, operation: 'LIST INDEXES', query: 'db.bookings.getIndexes()', endpoint: 'GET /api/mongo/indexes' },
            { id: 9, operation: 'FIND ONE', query: 'db.bookings.findOne({pnr: "..."})', endpoint: 'GET /api/mongo/findone/:pnr' },
            { id: 10, operation: 'COUNT', query: 'db.bookings.countDocuments({filter})', endpoint: 'GET /api/mongo/count' },
            { id: 11, operation: 'DISTINCT', query: 'db.bookings.distinct("field")', endpoint: 'GET /api/mongo/distinct/:field' },
            { id: 12, operation: 'UPDATE MANY', query: 'db.bookings.updateMany({filter}, {$set: {...}})', endpoint: 'PUT /api/mongo/update-many' },
            { id: 13, operation: 'CREATE INDEX', query: 'db.bookings.createIndex({train: 1})', endpoint: 'Auto-created on connection' }
        ]
    });
});

module.exports = router;
