const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.serialize(() => {
      // Create Users Table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
      )`);

      // Seed Users
      const insertUser = db.prepare('INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)');
      insertUser.run('admin@vanbusiness.com', 'admin123', 'admin');
      insertUser.run('driver@vanbusiness.com', 'driver123', 'driver');
      insertUser.run('student@vanbusiness.com', 'student123', 'student');
      insertUser.run('parent@vanbusiness.com', 'parent123', 'parent');
      insertUser.finalize();

      // Create Vans Table
      db.run(`CREATE TABLE IF NOT EXISTS vans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        status TEXT
      )`);

      // Create Drivers Table
      db.run(`CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        status TEXT,
        van_id INTEGER
      )`);

      // Safely add column for existing databases
      db.run(`ALTER TABLE drivers ADD COLUMN van_id INTEGER`, (err) => {
        // Will throw an error if the column already exists, which is safe to ignore.
      });

      // Create Students Table
      db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        status TEXT
      )`);
      db.run(`ALTER TABLE students ADD COLUMN parent_id INTEGER`, (err) => {});

      // Add new columns to users for profile
      db.run(`ALTER TABLE users ADD COLUMN name TEXT`, (err) => {});
      db.run(`ALTER TABLE users ADD COLUMN phone TEXT`, (err) => {});
      db.run(`ALTER TABLE users ADD COLUMN avatar TEXT`, (err) => {});

      // Create Activities Table
      db.run(`CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Create Notifications Table
      db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        message TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Create Routes Table
      db.run(`CREATE TABLE IF NOT EXISTS routes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        van_id INTEGER
      )`);

      // Create Stops Table
      db.run(`CREATE TABLE IF NOT EXISTS stops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_id INTEGER,
        name TEXT,
        time TEXT,
        lat REAL,
        lng REAL
      )`);

      // Create Student Routes Table
      db.run(`CREATE TABLE IF NOT EXISTS student_routes (
        student_id INTEGER,
        route_id INTEGER,
        stop_id INTEGER,
        PRIMARY KEY (student_id, route_id)
      )`);

      // Create Attendance Table
      db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        route_id INTEGER,
        status TEXT,
        date TEXT
      )`);

      // Create Maintenance Table
      db.run(`CREATE TABLE IF NOT EXISTS maintenance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        van_id INTEGER,
        type TEXT,
        cost REAL,
        date TEXT,
        description TEXT
      )`);

      // Create Announcements Table
      db.run(`CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT,
        created_by INTEGER,
        target_role TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Create Calendar Table
      db.run(`CREATE TABLE IF NOT EXISTS calendar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        date TEXT,
        is_holiday INTEGER DEFAULT 0
      )`);
    });
  }
});

module.exports = db;
