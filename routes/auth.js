const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../models/db');  

router.get('/login', (req, res) => {
  res.render('login');  
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    req.flash('error', 'Username and password are required');
    return res.redirect('/auth/login');  
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], async (err, result) => {
    if (err) {
      console.error('Database error:', err);
      req.flash('error', 'There was a problem with the database');
      return res.redirect('/auth/login');
    }

    if (result.length > 0) {
      const match = await bcrypt.compare(password, result[0].password);
      if (match) {
        req.session.userId = result[0].id;
        return res.redirect('/tracker/dashboard');  
      } else {
        req.flash('error', 'Invalid credentials');
        return res.redirect('/auth/login');  
      }
    } else {
      req.flash('error', 'User not found');
      return res.redirect('/auth/login');  
    }
  });
});

router.get('/register', (req, res) => {
  res.render('register');  
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(sql, [username, hashedPassword], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      req.flash('error', 'Registration failed');
      return res.redirect('/auth/register');  
    }

    req.flash('success', 'Registration successful! You can now log in.');
    return res.redirect('/auth/login');  
  });
});

module.exports = router;
