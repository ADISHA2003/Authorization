const express = require('express');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

// Routes
app.use('/api/auth', authRoutes);

// Serve frontend
app.get('/', (req, res) => {
  res.redirect('/signup');
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/signup.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
