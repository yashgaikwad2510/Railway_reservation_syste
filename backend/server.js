// ============================================
// Railway Reservation System - Main Server
// ============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

// Import configuration
const { connectMongo } = require('./config/mongo');

// Import routes
const trainRoutes = require('./routes/trains');
const bookingRoutes = require('./routes/bookings');
const cancelRoutes = require('./routes/cancel');
const transactionRoutes = require('./routes/transactions');
const analyticsRoutes = require('./routes/analytics');
const mongoRoutes = require('./routes/mongo');
const dbmsRoutes = require('./routes/dbms');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ──────────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────────
app.use('/api/trains', trainRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cancel', cancelRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/mongo', mongoRoutes);
app.use('/api/dbms', dbmsRoutes);
app.use('/api/auth', authRoutes);

// ──────────────────────────────────────────────
// API Index (shows all available endpoints)
// ──────────────────────────────────────────────
app.get('/api', (req, res) => {
    res.json({
        title: '🚂 Railway Reservation System API',
        version: '1.0.0',
        database: 'MongoDB',
        status: 'Running',
        endpoints: {
            trains: {
                'GET /api/trains': 'Get all trains',
                'GET /api/trains/search?source=X&destination=Y': 'Search trains',
                'GET /api/trains/:id': 'Get train by ID',
                'GET /api/trains/:id/seats': 'Get seat availability',
                'GET /api/trains/sources/list': 'Get all source stations',
                'GET /api/trains/destinations/list': 'Get all destination stations'
            },
            bookings: {
                'POST /api/bookings': 'Book a ticket (full transaction)',
                'GET /api/bookings': 'Get all bookings',
                'GET /api/bookings/:pnr': 'Get booking by PNR'
            },
            cancellation: {
                'POST /api/cancel': 'Cancel a booking (rollback demo)'
            },
            transactions: {
                'GET /api/transactions': 'Get transaction logs',
                'GET /api/transactions/stats': 'Get transaction statistics'
            },
            analytics: {
                'GET /api/analytics/dashboard': 'Get dashboard analytics'
            },
            mongodb: {
                'POST /api/mongo/book': 'MongoDB: Insert booking',
                'GET /api/mongo/search': 'MongoDB: Find bookings',
                'PUT /api/mongo/update/:id': 'MongoDB: Update booking',
                'DELETE /api/mongo/delete/:id': 'MongoDB: Delete booking',
                'GET /api/mongo/aggregate/revenue': 'MongoDB: Revenue aggregation',
                'GET /api/mongo/aggregate/stats': 'MongoDB: Stats aggregation ($facet)',
                'GET /api/mongo/lookup': 'MongoDB: $lookup (JOIN)',
                'GET /api/mongo/indexes': 'MongoDB: List indexes',
                'GET /api/mongo/findone/:pnr': 'MongoDB: Find one by PNR',
                'GET /api/mongo/count': 'MongoDB: Count documents',
                'GET /api/mongo/distinct/:field': 'MongoDB: Distinct values',
                'PUT /api/mongo/update-many': 'MongoDB: Update many',
                'GET /api/mongo/compare': 'MongoDB features comparison',
                'GET /api/mongo/all-queries': 'List all MongoDB queries'
            },
            dbms_concepts: {
                'POST /api/dbms/simulate-concurrent-booking': 'Concurrent transaction simulation',
                'POST /api/dbms/check-serializability': 'Serializability check (precedence graph)',
                'POST /api/dbms/simulate-deadlock': 'Deadlock detection simulation',
                'GET /api/dbms/acid-demo': 'ACID properties demonstration'
            }
        }
    });
});

// ──────────────────────────────────────────────
// Serve frontend for all non-API routes
// ──────────────────────────────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────
async function startServer() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   🚂 Railway Reservation System Server    ║');
    console.log('╚════════════════════════════════════════════╝');

    // Connect to MongoDB
    const mongoDb = await connectMongo();
    if (!mongoDb) {
        console.error('⚠️  MongoDB is not connected. The system will not work.');
        console.error('   Make sure MongoDB is running on localhost:27017');
    }

    app.listen(PORT, () => {
        console.log(`\n🌐 Server running at: http://localhost:${PORT}`);
        console.log(`📡 API Index at:      http://localhost:${PORT}/api`);
        console.log(`🖥️  Frontend at:       http://localhost:${PORT}\n`);
    });
}

startServer();
