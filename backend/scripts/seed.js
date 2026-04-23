const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seed() {
  let conn;
  try {
    console.log('--- Starting Database Seeding ---');

    // 1. Setup connection and create DB
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      multipleStatements: true
    });
    
    console.log('1. Recreating database `railflow_db`...');
    await conn.query('DROP DATABASE IF EXISTS railflow_db');
    await conn.query('CREATE DATABASE railflow_db');
    await conn.query('USE railflow_db');

    // 2. Execute schema.sql (Splitting by ; to handle errors better if needed, but multipleStatements handles it)
    console.log('2. Executing schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '../../schema.sql'), 'utf8');
    // Remove USE statements from schema if present to avoid conflicts
    const cleanedSchema = schemaSql.replace(/USE railflow_db;/gi, '');
    await conn.query(cleanedSchema);

    console.log('3. Inserting refined sample data...');
    
    // Stations - Must be first
    await conn.query(`INSERT INTO Stations (station_code, station_name, city, state) VALUES 
      ('NDLS', 'New Delhi', 'Delhi', 'Delhi'),
      ('MMCT', 'Mumbai Central', 'Mumbai', 'Maharashtra'),
      ('NK', 'Nashik Road', 'Nashik', 'Maharashtra'),
      ('PUNE', 'Pune Junction', 'Pune', 'Maharashtra'),
      ('SBC', 'Bangalore City', 'Bangalore', 'Karnataka')`);

    // Trains - Must have stations first
    await conn.query(`INSERT INTO Trains (train_no, train_name, source_station, destination_station, train_type) VALUES 
      (12001, 'Rajdhani Express', 'NDLS', 'MMCT', 'Rajdhani'),
      (12045, 'Shatabdi Express', 'NDLS', 'PUNE', 'Shatabdi')`);

    // Train Classes - Must have trains first
    await conn.query(`INSERT INTO Train_Classes (train_no, class_type, total_seats, base_fare) VALUES 
      (12001, '1A', 20, 4500.00),
      (12001, '2A', 50, 2800.00),
      (12001, '3A', 80, 2100.00),
      (12045, 'CC', 100, 1200.00),
      (12045, 'EC', 25, 2400.00)`);

    // Routes
    await conn.query(`INSERT INTO Routes (train_no, station_code, stop_sequence, arrival_time, departure_time, distance_from_source) VALUES 
      (12001, 'NDLS', 1, '16:30:00', '16:30:00', 0),
      (12001, 'NK', 2, '04:15:00', '04:20:00', 1100),
      (12001, 'MMCT', 3, '08:35:00', '08:35:00', 1380),
      (12045, 'NDLS', 1, '06:00:00', '06:00:00', 0),
      (12045, 'NK', 2, '22:30:00', '22:35:00', 1150),
      (12045, 'PUNE', 3, '02:15:00', '02:15:00', 1450)`);

    // Seat Availability
    await conn.query(`INSERT INTO Seat_Availability (train_no, class_type, journey_date, available_seats) VALUES 
      (12001, '1A', '2026-03-25', 12),
      (12001, '2A', '2026-03-25', 45),
      (12045, 'CC', '2026-03-25', 85)`);

    // Users
    await conn.query(`INSERT INTO Users (first_name, last_name, email, password_hash, phone_number, role) VALUES 
      ('Harshad', 'Thok', 'harshad@example.com', 'Admin', '9876543210', 'Admin')`);

    console.log('--- Seeding Completed Successfully ---');
  } catch (err) {
    console.error('Seeding Error Details:', err.sqlMessage || err);
  } finally {
    if (conn) await conn.end();
    process.exit(0);
  }
}

seed();
