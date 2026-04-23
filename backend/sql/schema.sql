-- RailFlow Reservation System Database Schema
-- Designed for 3NF Normalization
-- Constraints enforced: PRIMARY KEY, FOREIGN KEY, NOT NULL, CHECK, UNIQUE

CREATE DATABASE IF NOT EXISTS railflow_db;
USE railflow_db;

-- 1. Users Table (Passengers & Admins)
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    role ENUM('Passenger', 'Admin') DEFAULT 'Passenger',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Stations Table
CREATE TABLE Stations (
    station_code VARCHAR(10) PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL
);

-- 3. Trains Table
CREATE TABLE Trains (
    train_no INT PRIMARY KEY,
    train_name VARCHAR(100) NOT NULL,
    source_station VARCHAR(10) NOT NULL,
    destination_station VARCHAR(10) NOT NULL,
    train_type ENUM('Express', 'Superfast', 'Passenger', 'Rajdhani', 'Shatabdi') NOT NULL,
    FOREIGN KEY (source_station) REFERENCES Stations(station_code),
    FOREIGN KEY (destination_station) REFERENCES Stations(station_code),
    CHECK (source_station != destination_station)
);

-- 4. Train Classes (Mapping Trains to available classes and base fares)
CREATE TABLE Train_Classes (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    train_no INT NOT NULL,
    class_type ENUM('SL', '3A', '2A', '1A', 'CC', 'EC') NOT NULL,
    total_seats INT NOT NULL,
    base_fare DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (train_no) REFERENCES Trains(train_no) ON DELETE CASCADE,
    UNIQUE (train_no, class_type),
    CHECK (total_seats > 0)
);

-- 5. Routes Table (Train route with stops)
CREATE TABLE Routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    train_no INT NOT NULL,
    station_code VARCHAR(10) NOT NULL,
    stop_sequence INT NOT NULL,
    arrival_time TIME NOT NULL,
    departure_time TIME NOT NULL,
    distance_from_source INT NOT NULL DEFAULT 0,
    FOREIGN KEY (train_no) REFERENCES Trains(train_no) ON DELETE CASCADE,
    FOREIGN KEY (station_code) REFERENCES Stations(station_code) ON UPDATE CASCADE,
    UNIQUE (train_no, stop_sequence),
    CHECK (distance_from_source >= 0)
);

-- 6. Seat Inventory Availability (Live cache for fast lookup)
CREATE TABLE Seat_Availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    train_no INT NOT NULL,
    class_type ENUM('SL', '3A', '2A', '1A', 'CC', 'EC') NOT NULL,
    journey_date DATE NOT NULL,
    available_seats INT NOT NULL,
    waiting_list_count INT DEFAULT 0,
    FOREIGN KEY (train_no, class_type) REFERENCES Train_Classes(train_no, class_type) ON DELETE CASCADE,
    UNIQUE (train_no, class_type, journey_date),
    CHECK (available_seats >= 0),
    CHECK (waiting_list_count >= 0)
);

-- 7. Bookings Table (Header record for a ticket)
CREATE TABLE Bookings (
    pnr_no BIGINT PRIMARY KEY,
    user_id INT NOT NULL,
    train_no INT NOT NULL,
    class_type ENUM('SL', '3A', '2A', '1A', 'CC', 'EC') NOT NULL,
    source_station VARCHAR(10) NOT NULL,
    destination_station VARCHAR(10) NOT NULL,
    journey_date DATE NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('Confirmed', 'Waiting', 'Cancelled') DEFAULT 'Confirmed',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (train_no) REFERENCES Trains(train_no),
    FOREIGN KEY (source_station) REFERENCES Stations(station_code),
    FOREIGN KEY (destination_station) REFERENCES Stations(station_code),
    CHECK (total_amount >= 0)
);

-- 8. Passengers Table (Details of individuals on a booking)
CREATE TABLE Passengers (
    passenger_id INT AUTO_INCREMENT PRIMARY KEY,
    pnr_no BIGINT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    gender ENUM('M', 'F', 'O') NOT NULL,
    seat_number VARCHAR(10), -- e.g., 'S1-42' or 'WL-1'
    berth_preference ENUM('Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper', 'None') DEFAULT 'None',
    passenger_status ENUM('Confirmed', 'RAC', 'WL', 'Cancelled') NOT NULL,
    FOREIGN KEY (pnr_no) REFERENCES Bookings(pnr_no) ON DELETE CASCADE,
    CHECK (age > 0)
);

-- 9. Payment Transactions (Optional financial tracking)
CREATE TABLE Payment_Transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,
    pnr_no BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('Credit Card', 'UPI', 'Net Banking', 'Debit Card') NOT NULL,
    payment_status ENUM('Success', 'Failed', 'Refunded') DEFAULT 'Success',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pnr_no) REFERENCES Bookings(pnr_no) ON DELETE CASCADE
);
