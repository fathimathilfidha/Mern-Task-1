const express = require('express');
const router = express.Router(); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const User = require('../models/user'); 

router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
       const hashedPassword = await bcrypt.hash(password, 10); 
        user = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role: role || 'staff' 
        });

        await user.save();

        res.json({ msg: "User created successfully" });
    } catch (err) {
        console.error("Error in Register Route:", err); 
        res.status(500).json({ error: err.message }); 
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { id: user.id, role: user.role };
        
        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }, 
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    user: { id: user.id, name: user.name, role: user.role } 
                });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;