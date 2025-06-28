
const express = require('express');
const router = express.Router();
const db = require('../models/db'); 

router.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }

  const sql = 'SELECT * FROM workouts WHERE user_id = ?';
  db.query(sql, [req.session.userId], (err, results) => {
    if (err) throw err;
    res.render('dashboard', { workouts: results });
  });
});

router.post('/add', (req, res) => {
  const { workout_type, duration, calories_burned } = req.body;
  const userId = req.session.userId;

  const sql = 'INSERT INTO workouts (user_id, workout_type, duration, calories_burned, workout_date) VALUES (?, ?, ?, ?, CURDATE())';
  db.query(sql, [userId, workout_type, duration, calories_burned], (err, result) => {
    if (err) throw err;
    res.redirect('/tracker/dashboard');
  });
});

router.get('/previous', (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');

  const { search, date } = req.query;
  let sql = 'SELECT * FROM workouts WHERE user_id = ?';
  const params = [req.session.userId];

  if (search) {
    sql += ' AND workout_type LIKE ?';
    params.push(`%${search}%`);
  }

  if (date) {
    sql += ' AND workout_date = ?';
    params.push(date);
  }

  db.query(sql, params, (err, results) => {
    if (err) throw err;

    const totalCalories = results.reduce((sum, w) => sum + w.calories_burned, 0);
    res.render('previousworkouts', { workouts: results, totalCalories });
  });
});



router.post('/track', (req, res) => {
  const { workoutType, duration, caloriesBurned, date } = req.body;
  const sql = 'INSERT INTO workouts (user_id, workout_type, duration, calories_burned, date) VALUES (?, ?, ?, ?, ?)';

  db.query(sql, [req.session.userId, workoutType, duration, caloriesBurned, date || new Date()], (err, result) => {
    if (err) throw err;
    res.redirect('/tracker/dashboard');
  });
});

router.post('/delete/:id', (req, res) => {
  const sql = 'DELETE FROM workouts WHERE id = ? AND user_id = ?';
  db.query(sql, [req.params.id, req.session.userId], (err, result) => {
    if (err) throw err;
    res.redirect('/tracker/previous');
  });
});

router.post('/edit/:id', (req, res) => {
  const { workoutType, duration, caloriesBurned } = req.body;
  const sql = 'UPDATE workouts SET workout_type = ?, duration = ?, calories_burned = ? WHERE id = ? AND user_id = ?';
  db.query(sql, [workoutType, duration, caloriesBurned, req.params.id, req.session.userId], (err, result) => {
    if (err) throw err;
    res.redirect('/tracker/previous');
  });
});


module.exports = router;
