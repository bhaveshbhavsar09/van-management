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
    });
  }
});

module.exports = db;
