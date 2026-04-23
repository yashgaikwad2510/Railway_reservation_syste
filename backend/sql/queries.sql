-- RailFlow Reservation System SQL Queries
-- Required 15 Queries demonstrating database DML concepts, Joins, Grouping, Updates, and more.

-- 1. Simple SELECT with WHERE (Find Trains between two stations)
SELECT train_no, train_name, train_type
FROM Trains
WHERE source_station = 'NDLS' AND destination_station = 'MMCT';

-- 2. Inner JOIN (Get full passenger booking history for a specific User)
SELECT b.pnr_no, b.journey_date, p.first_name, p.last_name, p.seat_number, p.passenger_status
FROM Bookings b
JOIN Passengers p ON b.pnr_no = p.pnr_no
WHERE b.user_id = 101
ORDER BY b.journey_date DESC;

-- 3. GROUP BY with COUNT (Count the total number of bookings for each class type)
SELECT class_type, COUNT(*) as total_bookings
FROM Bookings
GROUP BY class_type
ORDER BY total_bookings DESC;

-- 4. UPDATE Query (Decrease available seat count when a ticket is booked)
UPDATE Seat_Availability
SET available_seats = available_seats - 2
WHERE train_no = 12951 AND class_type = '3A' AND journey_date = '2026-03-20';

-- 5. GROUP BY with HAVING and SUM (Find total revenue for positive performance per train)
SELECT train_no, SUM(total_amount) as total_revenue
FROM Bookings
WHERE booking_status = 'Confirmed'
GROUP BY train_no
HAVING SUM(total_amount) > 50000;

-- 6. DELETE Query (Remove old cancelled bookings history from over 2 years ago)
DELETE FROM Bookings
WHERE booking_status = 'Cancelled' AND booking_date < DATE_SUB(NOW(), INTERVAL 2 YEAR);

-- 7. LEFT JOIN (List all users and their bookings, including users who haven't made bookings)
SELECT u.first_name, u.email, b.pnr_no, b.total_amount
FROM Users u
LEFT JOIN Bookings b ON u.user_id = b.user_id;

-- 8. Subquery (IN) (Find passengers travelling on a Rajdhani Express)
SELECT first_name, last_name, seat_number
FROM Passengers
WHERE pnr_no IN (
    SELECT pnr_no FROM Bookings
    WHERE train_no IN (
        SELECT train_no FROM Trains WHERE train_type = 'Rajdhani'
    )
);

-- 9. Using LIKE for Pattern Matching (Find stations ending with 'Central')
SELECT station_code, station_name, city
FROM Stations
WHERE station_name LIKE '%Central%';

-- 10. Multiple JOINs (Show full Route mapping with actual Station Names instead of codes)
SELECT r.train_no, t.train_name, s.station_name, r.arrival_time, r.departure_time, r.stop_sequence
FROM Routes r
JOIN Trains t ON r.train_no = t.train_no
JOIN Stations s ON r.station_code = s.station_code
WHERE r.train_no = 12157
ORDER BY r.stop_sequence ASC;

-- 11. Aggregate Functions (MIN, MAX, AVG) on Fares
SELECT t.train_no, MAX(tc.base_fare) as max_fare, MIN(tc.base_fare) as min_fare, AVG(tc.base_fare) as avg_fare
FROM Trains t
JOIN Train_Classes tc ON t.train_no = tc.train_no
GROUP BY t.train_no;

-- 12. UPDATE with a nested calculation (Upgrade Waitlist to RAC if a Confirmed ticket is cancelled)
UPDATE Passengers
SET passenger_status = 'RAC', seat_number = 'RAC-15'
WHERE pnr_no = 1394030193 AND passenger_status = 'WL' AND seat_number = 'WL-1';

-- 13. Complex Subquery in SELECT clause (Show each user and their total lifetime spent amount relative to others)
SELECT first_name, last_name,
       (SELECT SUM(total_amount) FROM Bookings b WHERE b.user_id = u.user_id) as total_spent
FROM Users u
WHERE role = 'Passenger'
ORDER BY total_spent DESC;

-- 14. Query enforcing constraints / checking capacity (Show remaining capacity percentage on a train)
SELECT train_no, class_type, journey_date,
       (available_seats / (SELECT total_seats FROM Train_Classes tc WHERE tc.train_no = sa.train_no AND tc.class_type = sa.class_type)) * 100 as available_percentage
FROM Seat_Availability sa;

-- 15. Transaction Control (Bonus concepts - Start Transaction for strict booking logic)
START TRANSACTION;
INSERT INTO Bookings (pnr_no, user_id, train_no, class_type, source_station, destination_station, journey_date, total_amount)
VALUES (9304958302, 105, 12951, 'SL', 'NDLS', 'MMCT', '2026-03-25', 1800.00);
INSERT INTO Passengers (pnr_no, first_name, last_name, age, gender, passenger_status, seat_number)
VALUES (9304958302, 'Ravi', 'Kumar', 28, 'M', 'Confirmed', 'S3-72');
UPDATE Seat_Availability SET available_seats = available_seats - 1 WHERE train_no = 12951 AND class_type = 'SL' AND journey_date = '2026-03-25';
COMMIT;
