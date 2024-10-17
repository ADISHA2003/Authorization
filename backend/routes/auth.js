const express = require('express');
const pool = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// Configure nodemailer transporter (replace with your email provider's settings)
const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., 'gmail'
  auth: {
    user: 'adityasharma56697@gmail.com',
    pass: 'ykpq ljki ugsk icqy' // Replace with your actual Gmail password or app password
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email already exists
    const existsResult = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existsResult.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [email, hashedPassword]
    );

    console.log('User inserted:', result.rows[0]);

    // Set session (if using sessions)
    req.session.userId = result.rows[0].id; 

    res.json({ message: 'Signup successful' });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Set session (if using sessions)
        req.session.userId = user.id; 
        res.json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      // User not found, redirect to signup (optional)
      res.status(401).json({ message: 'Invalid credentials', redirectToSignup: true }); 
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Route to check if the user is logged in
router.get('/check-auth', (req, res) => {
  if (req.session.userId) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// Forgot Password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = new Date(Date.now() + 3600000); // 1 hour from now

    // 2. Store Token in Database
    const result = await pool.query(
      'UPDATE users SET reset_token = $1, token_expiration = $2 WHERE email = $3 RETURNING *',
      [resetToken, tokenExpiration, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 3. Send Password Reset Email
    const mailOptions = {
      from: 'adityasharma56697@gmail.com', // Replace with your email
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You are receiving this email because you (or someone else) requested a password reset for your account.</p>
        <p>Please click on the following link to reset your password:</p>
        <a href="http://localhost:5000/reset-password.html?token=${resetToken}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Error sending password reset email:', err);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
});

// Reset Password route
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // 1. Verify Token
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND token_expiration > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const user = result.rows[0];

    // 2. Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update Password in Database
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, token_expiration = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
