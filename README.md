# Railway Reservation System

A modern, full-stack Railway Reservation System built with **React (Vite)**, **Node.js**, and **MySQL**. This project features a professional Navy & Orange design and is fully integrated with a relational database.

## 🚀 Features

- **Smart Search**: Real-time train searching using SQL JOINs for accurate route matching.
- **Seat Selection**: Interactive coach layout for choosing seats.
- **PNR Tracking**: Live status checking for current bookings.
- **Admin Console**: A direct DBMS management interface to view relational tables (`Bookings`, `Users`, `Trains`).
- **Profile Management**: Personal user dashboard with custom avatar uploading and security settings.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide React (Icons), CSS.
- **Backend**: Node.js, Express, MySQL.
- **Database**: 3NF Normalized Schema (MySQL).

## 📂 Project Structure

- `/frontend`: React application (Vite).
- `/backend`: Express API server and database scripts.
- `schema.sql`: Full database structure.
- `queries.sql`: Sample SQL queries for presentation.

## ⚙️ Setup Instructions

### 1. Database Setup
1.  Open MySQL Workbench.
2.  Import and run `schema.sql`.
3.  (Optional) Run `node backend/scripts/seed.js` to populate sample data.

### 2. Backend Setup
1.  Navigate to `/backend`.
2.  Install dependencies: `npm install`.
3.  Configure `.env` with your DB credentials.
4.  Start the server: `node src/server.js`.

### 3. Frontend Setup
1.  Navigate to `/frontend`.
2.  Install dependencies: `npm install`.
3.  Start dev server: `npm run dev`.

---

Developed as a Comprehensive DBMS Project.
