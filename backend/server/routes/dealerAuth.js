const express = require('express');
const Dealer = require('../models/Dealer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_secure_secret';

// Dealer Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if dealer exists
        const dealer = await Dealer.findOne({ email });
        if (!dealer) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if active
        if (dealer.status !== 'active') {
            return res.status(403).json({ error: 'Account is inactive. Contact Admin.' });
        }

        const valid = await bcrypt.compare(password, dealer.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({
            userId: dealer._id,
            role: 'dealer',
            name: dealer.name,
            email: dealer.email
        }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            role: 'dealer',
            userId: dealer._id,
            name: dealer.name,
            email: dealer.email
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
