// ============================================
// Auth Routes - MongoDB Implementation
// ============================================
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/mongo');

const JWT_SECRET = process.env.JWT_SECRET || 'dbms_secret_key_railreserve_pro_2026';

async function getNextId(db, name) {
    const ret = await db.collection('counters').findOneAndUpdate(
        { _id: name }, { $inc: { seq: 1 } }, { returnDocument: 'after', upsert: true }
    );
    return ret.seq;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const db = getDb();

        // Check if email exists
        const existing = await db.collection('users').findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const userId = await getNextId(db, 'user_id');

        await db.collection('users').insertOne({
            user_id: userId, full_name, email, password_hash, created_at: new Date()
        });

        const token = jwt.sign({ user_id: userId, email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ success: true, message: 'User registered successfully!', token, user: { full_name, email } });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const db = getDb();
        const user = await db.collection('users').findOne({ email });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ success: true, message: 'Logged in successfully!', token, user: { full_name: user.full_name, email: user.email } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

module.exports = router;
