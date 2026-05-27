require('dotenv').config();
const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Add the API routes
app.use('/api/tasks', taskRoutes);

// Sanity check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    message: 'HMCTS Case Tracker API',
    version: '1.0.0',
    endpoints: {
      'POST /api/tasks': 'Create a new task',
      'GET /api/tasks': 'Retrieve all tasks (supports status filter)',
      'GET /api/tasks/:id': 'Retrieve a task by ID',
      'PATCH /api/tasks/:id/status': 'Update task status',
      'PUT /api/tasks/:id': 'Update a task',
      'DELETE /api/tasks/:id': 'Delete a task'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);
module.exports = app;