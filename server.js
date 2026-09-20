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

// Helper to log user activity
function logActivity(userId, action) {
  db.run('INSERT INTO activities (user_id, action) VALUES (?, ?)', [userId, action], (err) => {
    if(err) console.error('Error logging activity:', err);
  });
}

// API for Profile
app.get('/api/profile/:id', (req, res) => {
  db.get('SELECT id, email, role, name, phone, avatar FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

app.put('/api/profile/:id', (req, res) => {
  const { name, phone, avatar, password } = req.body;
  
  if (password) {
    db.run('UPDATE users SET name = ?, phone = ?, avatar = ?, password = ? WHERE id = ?', 
      [name, phone, avatar, password, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      logActivity(req.params.id, 'Updated profile and password');
      res.json({ message: 'Profile updated' });
    });
  } else {
    db.run('UPDATE users SET name = ?, phone = ?, avatar = ? WHERE id = ?', 
      [name, phone, avatar, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      logActivity(req.params.id, 'Updated profile details');
      res.json({ message: 'Profile updated' });
    });
  }
});

// API for Activities
app.get('/api/activities/:id', (req, res) => {
  db.all('SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API for Notifications
app.get('/api/notifications/:id', (req, res) => {
  db.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/notifications/:id/read', (req, res) => {
  db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Notifications marked as read' });
  });
});

// API for Auth
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    logActivity(user.id, 'Logged in');
    res.json({ id: user.id, email: user.email, role: user.role, name: user.name, avatar: user.avatar });
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
    
    logActivity(this.lastID, 'Account created');
    db.run('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [this.lastID, 'Welcome to School Van Management!']);
    
    res.json({ id: this.lastID, email, role });
  });
});

// API for Routes
app.get('/api/routes', (req, res) => {
  const query = `
    SELECT routes.*, vans.name as van_name 
    FROM routes 
    LEFT JOIN vans ON routes.van_id = vans.id
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/routes', (req, res) => {
  const { name, van_id } = req.body;
  db.run('INSERT INTO routes (name, van_id) VALUES (?, ?)', [name, van_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, van_id });
  });
});

// API for Stops
app.get('/api/stops/:routeId', (req, res) => {
  db.all('SELECT * FROM stops WHERE route_id = ?', [req.params.routeId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/stops', (req, res) => {
  const { route_id, name, time, lat, lng } = req.body;
  db.run('INSERT INTO stops (route_id, name, time, lat, lng) VALUES (?, ?, ?, ?, ?)', [route_id, name, time, lat, lng], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, route_id, name, time, lat, lng });
  });
});

// API for Attendance
app.get('/api/attendance/:routeId/:date', (req, res) => {
  db.all('SELECT * FROM attendance WHERE route_id = ? AND date = ?', [req.params.routeId, req.params.date], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/attendance', (req, res) => {
  const { student_id, route_id, status, date } = req.body;
  db.run('INSERT INTO attendance (student_id, route_id, status, date) VALUES (?, ?, ?, ?)', [student_id, route_id, status, date], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// API for Maintenance
app.get('/api/maintenance', (req, res) => {
  const query = `
    SELECT maintenance.*, vans.name as van_name 
    FROM maintenance 
    LEFT JOIN vans ON maintenance.van_id = vans.id
    ORDER BY date DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/maintenance', (req, res) => {
  const { van_id, type, cost, date, description } = req.body;
  db.run('INSERT INTO maintenance (van_id, type, cost, date, description) VALUES (?, ?, ?, ?, ?)', [van_id, type, cost, date, description], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// API for Announcements
app.get('/api/announcements', (req, res) => {
  db.all('SELECT * FROM announcements ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/announcements', (req, res) => {
  const { message, created_by, target_role } = req.body;
  db.run('INSERT INTO announcements (message, created_by, target_role) VALUES (?, ?, ?)', [message, created_by, target_role], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// API for Calendar
app.get('/api/calendar', (req, res) => {
  db.all('SELECT * FROM calendar ORDER BY date ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/calendar', (req, res) => {
  const { title, date, is_holiday } = req.body;
  db.run('INSERT INTO calendar (title, date, is_holiday) VALUES (?, ?, ?)', [title, date, is_holiday ? 1 : 0], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// API for Parent Students
app.get('/api/parent/students/:parentId', (req, res) => {
  db.all('SELECT * FROM students WHERE parent_id = ?', [req.params.parentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
