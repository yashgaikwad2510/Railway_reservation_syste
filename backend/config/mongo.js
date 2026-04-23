// ============================================
// MongoDB Connection Configuration
// ============================================
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'railway_reservation';

let db = null;
let client = null;

async function connectMongo() {
    try {
        client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log('✅ MongoDB connected successfully');

        // Create indexes for all collections
        // Trains
        await db.collection('trains').createIndex({ train_number: 1 }, { unique: true });
        await db.collection('trains').createIndex({ source: 1, destination: 1 });
        await db.collection('trains').createIndex({ source: 1 });
        await db.collection('trains').createIndex({ destination: 1 });

        // Passengers
        await db.collection('passengers').createIndex({ email: 1 });
        await db.collection('passengers').createIndex({ phone: 1 });

        // Seats
        await db.collection('seats').createIndex({ train_id: 1, seat_number: 1 }, { unique: true });
        await db.collection('seats').createIndex({ train_id: 1, is_booked: 1 });

        // Bookings
        await db.collection('bookings').createIndex({ pnr_number: 1 }, { unique: true });
        await db.collection('bookings').createIndex({ train_id: 1 });
        await db.collection('bookings').createIndex({ passenger_id: 1 });
        await db.collection('bookings').createIndex({ status: 1 });
        await db.collection('bookings').createIndex({ train_id: 1, status: 1 });

        // Payments
        await db.collection('payments').createIndex({ booking_id: 1 });
        await db.collection('payments').createIndex({ status: 1 });

        // Transaction Logs
        await db.collection('transaction_logs').createIndex({ operation: 1 });
        await db.collection('transaction_logs').createIndex({ status: 1 });
        await db.collection('transaction_logs').createIndex({ timestamp: -1 });

        // Users
        await db.collection('users').createIndex({ email: 1 }, { unique: true });

        // Resource Locks (for DBMS concepts)
        await db.collection('resource_locks').createIndex({ resource_type: 1, resource_id: 1 });
        await db.collection('resource_locks').createIndex({ transaction_id: 1 });

        console.log('✅ MongoDB indexes created');
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        return null;
    }
}

function getDb() {
    if (!db) throw new Error('MongoDB not initialized. Call connectMongo() first.');
    return db;
}

function getClient() {
    return client;
}

module.exports = { connectMongo, getDb, getClient };
