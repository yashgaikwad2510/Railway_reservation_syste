// ============================================
// Transaction Log Routes - MongoDB
// ============================================
const express = require('express');
const router = express.Router();
const { getDb } = require('../config/mongo');

// GET /api/transactions - Get all transaction logs
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const { operation, status, limit } = req.query;
        const filter = {};
        if (operation) filter.operation = operation;
        if (status) filter.status = status;

        let cursor = db.collection('transaction_logs').find(filter).sort({ timestamp: -1 });
        if (limit) cursor = cursor.limit(parseInt(limit));

        const rows = await cursor.toArray();
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/transactions/stats - Get transaction statistics
router.get('/stats', async (req, res) => {
    try {
        const db = getDb();

        const operationStats = await db.collection('transaction_logs').aggregate([
            { $group: { _id: { operation: '$operation', status: '$status' }, count: { $sum: 1 } } },
            { $project: { _id: 0, operation: '$_id.operation', status: '$_id.status', count: 1 } },
            { $sort: { operation: 1 } }
        ]).toArray();

        const recentLogs = await db.collection('transaction_logs').find({}).sort({ timestamp: -1 }).limit(10).toArray();
        const totalCount = await db.collection('transaction_logs').countDocuments();

        res.json({
            success: true,
            data: { total_logs: totalCount, by_operation: operationStats, recent: recentLogs }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
