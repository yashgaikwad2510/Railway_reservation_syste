// ============================================
// MongoDB Seed Script
// Run: node seed-mongo.js
// ============================================
require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'railway_reservation';

async function seed() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        console.log('✅ Connected to MongoDB');

        // ============================================
        // DROP existing collections (fresh start)
        // ============================================
        const collections = await db.listCollections().toArray();
        for (const col of collections) {
            await db.collection(col.name).drop();
        }
        console.log('🗑️  Cleared existing collections');

        // ============================================
        // 1. SEED TRAINS
        // ============================================
        const trains = [
            { train_id: 1, train_number: '12301', train_name: 'Rajdhani Express', source: 'Delhi', destination: 'Mumbai', total_seats: 60, available_seats: 60, fare: 1450.00, departure_time: '16:00:00', arrival_time: '08:30:00', running_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', created_at: new Date() },
            { train_id: 2, train_number: '12302', train_name: 'Duronto Express', source: 'Mumbai', destination: 'Delhi', total_seats: 60, available_seats: 60, fare: 1550.00, departure_time: '23:00:00', arrival_time: '16:30:00', running_days: 'Mon,Wed,Fri,Sun', created_at: new Date() },
            { train_id: 3, train_number: '12951', train_name: 'Mumbai Rajdhani', source: 'Mumbai', destination: 'Delhi', total_seats: 60, available_seats: 60, fare: 1650.00, departure_time: '17:00:00', arrival_time: '08:35:00', running_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', created_at: new Date() },
            { train_id: 4, train_number: '12259', train_name: 'Sealdah Duronto', source: 'Delhi', destination: 'Kolkata', total_seats: 60, available_seats: 60, fare: 1250.00, departure_time: '20:00:00', arrival_time: '10:00:00', running_days: 'Tue,Thu,Sat', created_at: new Date() },
            { train_id: 5, train_number: '12627', train_name: 'Karnataka Express', source: 'Delhi', destination: 'Bangalore', total_seats: 60, available_seats: 60, fare: 1100.00, departure_time: '21:30:00', arrival_time: '06:00:00', running_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', created_at: new Date() },
            { train_id: 6, train_number: '12431', train_name: 'Trivandrum Rajdhani', source: 'Delhi', destination: 'Trivandrum', total_seats: 60, available_seats: 60, fare: 2100.00, departure_time: '10:30:00', arrival_time: '05:00:00', running_days: 'Mon,Tue,Wed,Thu,Fri', created_at: new Date() },
            { train_id: 7, train_number: '12839', train_name: 'Chennai Mail', source: 'Mumbai', destination: 'Chennai', total_seats: 60, available_seats: 60, fare: 850.00, departure_time: '21:00:00', arrival_time: '12:30:00', running_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', created_at: new Date() },
            { train_id: 8, train_number: '12245', train_name: 'Shatabdi Express', source: 'Delhi', destination: 'Dehradun', total_seats: 60, available_seats: 60, fare: 750.00, departure_time: '06:45:00', arrival_time: '12:30:00', running_days: 'Mon,Tue,Wed,Thu,Fri,Sat', created_at: new Date() },
            { train_id: 9, train_number: '12049', train_name: 'Gatimaan Express', source: 'Delhi', destination: 'Agra', total_seats: 60, available_seats: 60, fare: 500.00, departure_time: '08:10:00', arrival_time: '09:50:00', running_days: 'Mon,Tue,Wed,Thu,Fri,Sat', created_at: new Date() },
            { train_id: 10, train_number: '22691', train_name: 'Rajdhani Express', source: 'Bangalore', destination: 'Delhi', total_seats: 60, available_seats: 60, fare: 1350.00, departure_time: '20:00:00', arrival_time: '05:30:00', running_days: 'Mon,Wed,Fri', created_at: new Date() },
            { train_id: 11, train_number: '12723', train_name: 'Telangana Express', source: 'Delhi', destination: 'Hyderabad', total_seats: 60, available_seats: 60, fare: 980.00, departure_time: '06:50:00', arrival_time: '09:30:00', running_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', created_at: new Date() },
            { train_id: 12, train_number: '12561', train_name: 'Swatantrata Senani', source: 'Delhi', destination: 'Patna', total_seats: 60, available_seats: 60, fare: 650.00, departure_time: '16:55:00', arrival_time: '06:00:00', running_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', created_at: new Date() }
        ];

        await db.collection('trains').insertMany(trains);
        console.log(`✅ Inserted ${trains.length} trains`);

        // ============================================
        // 2. SEED SEATS (60 per train)
        // ============================================
        const seats = [];
        for (let trainId = 1; trainId <= 12; trainId++) {
            for (let seatNum = 1; seatNum <= 60; seatNum++) {
                seats.push({
                    train_id: trainId,
                    seat_number: seatNum,
                    is_booked: false,
                    booking_id: null
                });
            }
        }
        await db.collection('seats').insertMany(seats);
        console.log(`✅ Inserted ${seats.length} seats (60 per train)`);

        // ============================================
        // 3. SEED PASSENGERS
        // ============================================
        const passengers = [
            { passenger_id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', phone: '9876543210', age: 28, gender: 'Male', created_at: new Date() },
            { passenger_id: 2, name: 'Priya Patel', email: 'priya@email.com', phone: '9876543211', age: 24, gender: 'Female', created_at: new Date() },
            { passenger_id: 3, name: 'Amit Kumar', email: 'amit@email.com', phone: '9876543212', age: 35, gender: 'Male', created_at: new Date() },
            { passenger_id: 4, name: 'Sneha Reddy', email: 'sneha@email.com', phone: '9876543213', age: 22, gender: 'Female', created_at: new Date() },
            { passenger_id: 5, name: 'Vikram Singh', email: 'vikram@email.com', phone: '9876543214', age: 30, gender: 'Male', created_at: new Date() }
        ];

        await db.collection('passengers').insertMany(passengers);
        console.log(`✅ Inserted ${passengers.length} passengers`);

        // ============================================
        // 4. CREATE INDEXES
        // ============================================
        await db.collection('trains').createIndex({ train_number: 1 }, { unique: true });
        await db.collection('trains').createIndex({ source: 1, destination: 1 });
        await db.collection('seats').createIndex({ train_id: 1, seat_number: 1 }, { unique: true });
        await db.collection('seats').createIndex({ train_id: 1, is_booked: 1 });
        await db.collection('bookings').createIndex({ pnr_number: 1 }, { unique: true });
        await db.collection('bookings').createIndex({ train_id: 1, status: 1 });
        await db.collection('passengers').createIndex({ email: 1 });
        await db.collection('payments').createIndex({ booking_id: 1 });
        await db.collection('transaction_logs').createIndex({ timestamp: -1 });
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        console.log('✅ Indexes created');

        // ============================================
        // COUNTERS collection for auto-increment IDs
        // ============================================
        await db.collection('counters').insertMany([
            { _id: 'passenger_id', seq: 5 },
            { _id: 'booking_id', seq: 0 },
            { _id: 'payment_id', seq: 0 },
            { _id: 'log_id', seq: 0 },
            { _id: 'user_id', seq: 0 }
        ]);
        console.log('✅ Counter sequences initialized');

        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║   ✅ MongoDB Seed Complete!                ║');
        console.log('║   Database: ' + DB_NAME.padEnd(30) + '║');
        console.log('║   Trains: 12  |  Seats: 720  |  Pax: 5    ║');
        console.log('╚════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('❌ Seed Error:', error);
    } finally {
        await client.close();
    }
}

seed();
