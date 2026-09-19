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
  const query = `
    SELECT drivers.*, vans.name as van_name 
    FROM drivers 
    LEFT JOIN vans ON drivers.van_id = vans.id
  `;
  db.all(query, [], (err, rows) => {
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

app.put('/api/drivers/:id/assign', (req, res) => {
  const { van_id } = req.body;
  db.run('UPDATE drivers SET van_id = ? WHERE id = ?', [van_id, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'assigned', changes: this.changes });
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

// API for Auth
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ id: user.id, email: user.email, role: user.role });
  });
});

app.post('/api/register', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, password, role], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, email, role });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
