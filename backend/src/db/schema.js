const db = require('./connection');

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create tasks table
      db.run(
        `CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL CHECK(status IN ('pending', 'in-progress', 'completed', 'cancelled')),
          dueDate TEXT
        )`,
        (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Tasks table initialized');
            resolve();
          }
        }
      );
    });
  });
};

module.exports = { initializeDatabase };
