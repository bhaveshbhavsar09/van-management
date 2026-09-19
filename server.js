const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API for Vans
app.get('/api/vans', (req, res) => {
  db.all('SELECT * FROM vans', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/vans', (req, res) => {
  const { name, status } = req.body;
  db.run('INSERT INTO vans (name, status) VALUES (?, ?)', [name, status || 'Active'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, status: status || 'Active' });
  });
});

app.delete('/api/vans/:id', (req, res) => {
  db.run('DELETE FROM vans WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'deleted', changes: this.changes });
  });
});

// API for Drivers
app.get('/api/drivers', (req, res) => {
  db.all('SELECT * FROM drivers', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/drivers', (req, res) => {
  const { name, status } = req.body;
  db.run('INSERT INTO drivers (name, status) VALUES (?, ?)', [name, status || 'Pending'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, status: status || 'Pending' });
  });
});

app.delete('/api/drivers/:id', (req, res) => {
  db.run('DELETE FROM drivers WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'deleted', changes: this.changes });
  });
});

// API for Students
app.get('/api/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/students', (req, res) => {
  const { name, status } = req.body;
  db.run('INSERT INTO students (name, status) VALUES (?, ?)', [name, status || 'Pending'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, status: status || 'Pending' });
  });
});

app.delete('/api/students/:id', (req, res) => {
  db.run('DELETE FROM students WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'deleted', changes: this.changes });
  });
});

// API for Dashboard Stats
app.get('/api/stats', (req, res) => {
  const stats = {};
  db.get('SELECT COUNT(*) as count FROM vans', (err, row) => {
    stats.vanCount = row ? row.count : 0;
    db.get('SELECT COUNT(*) as count FROM drivers', (err, row) => {
      stats.driverCount = row ? row.count : 0;
      db.get('SELECT COUNT(*) as count FROM students', (err, row) => {
        stats.studentCount = row ? row.count : 0;
        res.json(stats);
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
