# 🚂 Railway Reservation Management System

> **DBMS FA-2 Project** — A production-grade railway reservation system demonstrating real database operations with MySQL + MongoDB.

---

## 📁 Project Structure

```
Railway_reservation_system/
├── backend/
│   ├── server.js              # Express server entry
│   ├── package.json           # Dependencies
│   ├── .env                   # Environment config
│   ├── config/
│   │   ├── db.js              # MySQL connection pool
│   │   └── mongo.js           # MongoDB connection + indexes
│   ├── routes/
│   │   ├── trains.js          # Train search & listing (SQL)
│   │   ├── bookings.js        # Booking with transactions
│   │   ├── cancel.js          # Cancel with rollback demo
│   │   ├── transactions.js    # Transaction log viewer
│   │   ├── analytics.js       # Dashboard analytics (GROUP BY)
│   │   ├── mongo.js           # 14 MongoDB operations
│   │   └── dbms.js            # Concurrency, serializability, deadlock, ACID
│   └── sql/
│       ├── schema.sql         # Database schema (7 tables)
│       └── seed.sql           # Sample data (12 trains, 720 seats)
├── frontend/
│   ├── index.html             # Single-page app (8 tabs)
│   ├── css/style.css          # Premium dark theme
│   └── js/app.js              # API integration logic
└── README.md
```

---

## 🚀 Setup & Run Instructions

### Prerequisites
- **Node.js** (v16+)
- **MySQL** (v8.0+)
- **MongoDB** (v6.0+)

### Step 1: Setup MySQL Database
```bash
# Open MySQL CLI or Workbench and run:
mysql -u root -p < backend/sql/schema.sql
mysql -u root -p < backend/sql/seed.sql
```

### Step 2: Configure Environment
Edit `backend/.env` and set your MySQL password:
```
MYSQL_PASSWORD=your_mysql_password
```

### Step 3: Install Dependencies
```bash
cd backend
npm install
```

### Step 4: Start the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### Step 5: Open the Application
```
http://localhost:3000
```

---

## 📡 API Endpoints

### Trains (SQL)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trains` | Get all trains |
| GET | `/api/trains/search?source=X&destination=Y` | Search trains |
| GET | `/api/trains/:id/seats` | Seat availability |

### Bookings (SQL Transactions)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Book ticket (full transaction) |
| GET | `/api/bookings` | All bookings |
| GET | `/api/bookings/:pnr` | Get by PNR |

### Cancellation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cancel` | Cancel booking (rollback demo) |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard data (GROUP BY) |

### Transaction Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | All transaction logs |
| GET | `/api/transactions/stats` | Transaction statistics |

### MongoDB (14 Operations)
| Method | Endpoint | MongoDB Query |
|--------|----------|---------------|
| POST | `/api/mongo/book` | insertOne() |
| GET | `/api/mongo/search` | find() |
| PUT | `/api/mongo/update/:id` | updateOne() |
| DELETE | `/api/mongo/delete/:id` | deleteOne() |
| GET | `/api/mongo/aggregate/revenue` | aggregate($group) |
| GET | `/api/mongo/aggregate/stats` | aggregate($facet) |
| GET | `/api/mongo/lookup` | aggregate($lookup) |
| GET | `/api/mongo/indexes` | listIndexes() |
| GET | `/api/mongo/findone/:pnr` | findOne() |
| GET | `/api/mongo/count` | countDocuments() |
| GET | `/api/mongo/distinct/:field` | distinct() |
| PUT | `/api/mongo/update-many` | updateMany() |
| GET | `/api/mongo/compare` | SQL vs MongoDB |
| GET | `/api/mongo/all-queries` | All queries list |

### DBMS Concepts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/dbms/simulate-concurrent-booking` | Concurrent transaction simulation |
| POST | `/api/dbms/check-serializability` | Serializability check |
| POST | `/api/dbms/simulate-deadlock` | Deadlock detection |
| GET | `/api/dbms/acid-demo` | ACID properties demo |

---

## 🏗️ MySQL Schema (7 Tables)

1. **Train** — train_id, train_number, train_name, source, destination, total_seats, available_seats, fare
2. **Passenger** — passenger_id, name, email, phone, age, gender
3. **Seat** — seat_id, train_id, seat_number, is_booked, booking_id
4. **Booking** — booking_id, passenger_id, train_id, seat_number, status, pnr_number
5. **Payment** — payment_id, booking_id, amount, payment_method, status, transaction_ref
6. **TransactionLog** — log_id, operation, booking_id, status, details, timestamp
7. **ResourceLock** — lock_id, resource_type, resource_id, transaction_id, lock_type

### Indexes Created
- `idx_source_dest` on Train(source, destination)
- `idx_train_seat` on Seat(train_id, is_booked)
- `idx_pnr` on Booking(pnr_number)
- `idx_train_booking` on Booking(train_id, status)

---

## 🍃 MongoDB Collections & Indexes

### Collections
- `bookings` — Booking documents with embedded passenger info
- `trains` — Train reference data
- `analytics` — Analytics cache

### Indexes
```javascript
db.bookings.createIndex({ train: 1 })
db.bookings.createIndex({ pnr: 1 }, { unique: true })
db.bookings.createIndex({ status: 1 })
db.bookings.createIndex({ passenger_email: 1 })
db.trains.createIndex({ source: 1, destination: 1 })
db.trains.createIndex({ train_number: 1 }, { unique: true })
```

---

## 📌 DBMS Concepts Implemented

| Concept | Implementation |
|---------|---------------|
| **Transactions** | BEGIN → operations → COMMIT / ROLLBACK |
| **ACID - Atomicity** | Full rollback on any failure in booking |
| **ACID - Consistency** | UNIQUE constraints, FOREIGN KEY |
| **ACID - Isolation** | SELECT ... FOR UPDATE (row-level lock) |
| **ACID - Durability** | InnoDB WAL, data persists after restart |
| **Concurrency Control** | FOR UPDATE lock simulation with 2 connections |
| **Serializability** | Precedence graph + DFS cycle detection |
| **Deadlock** | Wait-for graph, circular wait detection, Wait-Die scheme |
| **Indexing (SQL)** | B-tree indexes on frequently queried columns |
| **Indexing (MongoDB)** | Indexes on train, pnr, status, email |
| **Aggregation (SQL)** | GROUP BY, SUM, COUNT, JOIN |
| **Aggregation (Mongo)** | $group, $facet, $lookup, $match, $sort |
| **Normalization** | 3NF schema with proper decomposition |

---

## 🎤 Viva Questions & Answers

### Q1: What is a Transaction in DBMS?
**A:** A transaction is a sequence of database operations that are treated as a single logical unit of work. It must follow ACID properties. In our system, booking a ticket is a transaction: check availability → lock seat → insert booking → insert payment → commit.

### Q2: Explain ACID properties with examples from your project.
**A:**
- **Atomicity:** If payment fails after booking insertion, the entire booking is rolled back (BEGIN/ROLLBACK)
- **Consistency:** UNIQUE constraint on (train_id, seat_number) prevents double booking
- **Isolation:** FOR UPDATE locks prevent two users from booking the same seat simultaneously
- **Durability:** After COMMIT, the booking persists even if the server crashes (InnoDB WAL)

### Q3: How do you prevent double booking?
**A:** Using SELECT ... FOR UPDATE which acquires an exclusive row-level lock. When T1 locks a seat row, T2 must wait. If T1 books the seat and commits, T2 finds it already booked and rolls back.

### Q4: What is a Deadlock? How do you detect it?
**A:** A deadlock occurs when two or more transactions are waiting for each other's locks, creating a circular wait. We detect it using a Wait-For Graph — if the graph has a cycle, deadlock exists. Resolution uses Wait-Die scheme where younger transactions are aborted.

### Q5: What is Serializability?
**A:** A schedule is serializable if its result is equivalent to some serial execution of the transactions. We check this by building a Precedence Graph from conflicting operations (R-W, W-R, W-W on same data) and checking for cycles using DFS. No cycle = serializable.

### Q6: Explain the difference between SQL and MongoDB.
**A:** SQL (MySQL) uses fixed schema, relational model, JOINs, and SQL language. MongoDB uses flexible document schema, embedded data model, $lookup for joins, and MQL. Our project implements the same operations (search, aggregate revenue) in both to compare.

### Q7: What is an Index? Why is it important?
**A:** An index is a data structure (B-tree) that speeds up data retrieval. Without indexing, the database scans every row (full table scan). We create indexes on train source/destination, PNR numbers, and booking status for fast lookups.

### Q8: Explain the Booking Transaction flow.
**A:** BEGIN TRANSACTION → SELECT seat FOR UPDATE (lock row) → INSERT INTO Passenger → INSERT INTO Booking → UPDATE Seat (mark booked) → INSERT INTO Payment → COMMIT. If any step fails → ROLLBACK all changes.

### Q9: What is a Foreign Key? Where do you use it?
**A:** A foreign key ensures referential integrity between tables. Booking.train_id references Train.train_id, Booking.passenger_id references Passenger.passenger_id, Payment.booking_id references Booking.booking_id.

### Q10: What MongoDB aggregation operations did you use?
**A:** $match (filter), $group (group by train, sum fare), $sort (order results), $facet (parallel pipelines), $lookup (join collections), $unwind (flatten arrays), $project (select fields), $limit (restrict results).

### Q11: How does SELECT FOR UPDATE work?
**A:** It acquires an exclusive lock on the selected rows within a transaction. Other transactions attempting to read the same rows with FOR UPDATE will be blocked until the first transaction commits or rolls back. This prevents lost updates.

### Q12: What is the purpose of the TransactionLog table?
**A:** It records every database operation (BOOK, CANCEL, REFUND, FAILURE) with timestamps. This provides an audit trail and helps in debugging, recovery, and demonstrating transaction behavior.

### Q13: Explain normalization in your schema.
**A:** Our schema is in 3NF: Train data is in its own table (no redundancy), Passenger is separate from Booking (eliminates insertion anomaly), Payment is separate from Booking (each fact stored once). No transitive dependencies.

### Q14: What is the difference between $lookup and SQL JOIN?
**A:** SQL JOIN is native and efficient — it combines rows from multiple tables based on related columns. MongoDB $lookup is an aggregation stage that performs a left outer join with another collection. SQL JOINs are generally faster for complex multi-table queries.

### Q15: How do you handle concurrent seat booking?
**A:** Using MySQL's InnoDB row-level locking with SELECT ... FOR UPDATE. When two transactions try to book the same seat, the first acquires the lock, the second waits. After the first commits, the second checks and finds the seat booked, then rolls back.

### Q16: What is a Wait-For Graph?
**A:** A directed graph where nodes are transactions and an edge T1→T2 means T1 is waiting for a lock held by T2. If this graph has a cycle, a deadlock exists. Our system builds this graph and detects cycles.

### Q17: Explain the rollback process in cancellation.
**A:** BEGIN → Find booking → UPDATE Booking SET status='CANCELLED' → UPDATE Seat SET is_booked=FALSE → UPDATE Payment SET status='REFUNDED' → COMMIT. If any step fails, ROLLBACK undoes all changes.

### Q18: What is the role of connection pooling?
**A:** Connection pooling (mysql2 pool) maintains a set of reusable database connections. Instead of creating/destroying connections per request, the pool reuses them, reducing overhead and improving performance.

### Q19: How is MongoDB different in handling transactions?
**A:** MongoDB supports multi-document transactions since v4.0, but its primary design uses embedded documents to avoid the need for joins/transactions. Our SQL implementation uses strict ACID transactions while MongoDB relies on atomic single-document operations.

### Q20: What indexing strategies did you use?
**A:** SQL: Composite index on (source, destination) for search queries, index on pnr_number for lookups, index on (train_id, is_booked) for seat availability. MongoDB: Index on train field for search, unique index on pnr for fast lookups, index on status for filtering.

---

## 📊 10-Slide PPT Content

### Slide 1: Title
**Railway Reservation Management System**
DBMS FA-2 Project | Node.js + MySQL + MongoDB

### Slide 2: Problem Statement
- Manual railway booking is error-prone
- Need for concurrent booking management
- ACID compliance for financial transactions
- Real-time seat availability tracking

### Slide 3: Tech Stack
- Frontend: HTML, CSS, JavaScript (modern UI)
- Backend: Node.js, Express.js
- SQL Database: MySQL (pure SQL, no ORM)
- NoSQL Database: MongoDB
- Architecture: REST API, SPA frontend

### Slide 4: Database Design
- 7 MySQL Tables: Train, Passenger, Seat, Booking, Payment, TransactionLog, ResourceLock
- 3 MongoDB Collections: bookings, trains, analytics
- Normalized to 3NF, indexed on key columns

### Slide 5: Transaction Implementation
- Full SQL Transaction: BEGIN → Check → Lock → Insert → COMMIT
- ROLLBACK on any failure step
- SELECT ... FOR UPDATE for row-level locking
- Every operation logged in TransactionLog

### Slide 6: ACID Properties (Practical)
- Atomicity: Complete rollback on failure
- Consistency: UNIQUE + FOREIGN KEY constraints
- Isolation: FOR UPDATE exclusive locks
- Durability: InnoDB WAL ensures persistence

### Slide 7: Concurrency & Deadlock
- Concurrent booking simulation with 2 connections
- FOR UPDATE lock prevents double booking
- Wait-For Graph detects circular wait deadlock
- Resolution via Wait-Die scheme

### Slide 8: Serializability
- Precedence graph built from conflicting operations
- DFS cycle detection algorithm
- Conflict-serializable if graph is acyclic

### Slide 9: MongoDB Operations
- 14 queries: CRUD + Aggregation + $lookup + Indexing
- $group for revenue aggregation
- $lookup for collection joins
- SQL vs MongoDB comparison API

### Slide 10: Conclusion
- Fully functional production-grade system
- All DBMS concepts implemented practically
- Real databases with real queries
- Premium UI with real-time updates

---

## ⚙️ DBMS Concept Explanations

| Concept | One-Line Explanation |
|---------|---------------------|
| Transaction | Logical unit of work with BEGIN/COMMIT/ROLLBACK |
| ACID | Properties ensuring reliable database transactions |
| Atomicity | All-or-nothing execution of transaction |
| Consistency | Database moves from one valid state to another |
| Isolation | Concurrent transactions don't interfere |
| Durability | Committed data survives failures |
| Concurrency Control | Managing simultaneous access to data |
| Locking | Restricting access to data being modified |
| Row-level Lock | FOR UPDATE locks specific rows, not entire table |
| Deadlock | Circular wait among transactions for locks |
| Wait-For Graph | Directed graph to detect deadlocks |
| Serializability | Schedule equivalence to serial execution |
| Precedence Graph | Directed graph from conflicting operations |
| Indexing | B-tree structures for fast data retrieval |
| Normalization | Organizing tables to reduce redundancy (1NF→3NF) |
| Foreign Key | Constraint ensuring referential integrity |
| Aggregation | GROUP BY, SUM, COUNT for analytics |
| $lookup | MongoDB's equivalent of SQL JOIN |
| Connection Pool | Reusable database connections for performance |
| Transaction Log | Audit trail of all database operations |
