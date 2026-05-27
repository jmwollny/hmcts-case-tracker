const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Check if Jest is running the application
const isTestEnv = process.env.NODE_ENV === 'test';

// Integration tests should run in memory to avoid polluting the DB with test data
const dbPath = isTestEnv 
  ? ':memory:' 
  : (process.env.DB_PATH || path.join(__dirname, '../../data/case_tracker.db'));

if (!isTestEnv) {
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log(`Connected to SQLite database (${isTestEnv ? 'In-Memory' : 'File-based'})`);
  }
});

// Enable foreign keys (Works perfectly fine on both physical and in-memory databases)
db.run('PRAGMA foreign_keys = ON');

module.exports = db;