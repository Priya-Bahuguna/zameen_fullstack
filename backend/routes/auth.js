const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'zameen_secret_key', { expiresIn: '30d' });

// Register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').optional().isIn(['buyer', 'seller']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { name, email, password, phone, role } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });
      const user = await User.create({ name, email, password, phone, role: role || 'buyer' });
      res.status(201).json({ user, token: generateToken(user._id) });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password)))
        return res.status(401).json({ message: 'Invalid email or password' });
      res.json({ user, token: generateToken(user._id) });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get profile
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save/unsave property
router.post('/save-property/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propId = req.params.id;
    const idx = user.savedProperties.indexOf(propId);
    if (idx === -1) user.savedProperties.push(propId);
    else user.savedProperties.splice(idx, 1);
    await user.save();
    res.json({ saved: idx === -1, savedProperties: user.savedProperties });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
