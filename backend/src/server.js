const app = require('./index');
const { initializeDatabase } = require('./db/schema');

const PORT = process.env.PORT || 5000;

// Initialize the database and start the server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });