const express = require('express');
const TaskController = require('../controllers/taskController');

const router = express.Router();

/** CREATE, READ, UPDATE, DELETE (CRUD) routes for tasks */

/** 
 * CREATE
 * POST /api/tasks
 * Create a new task
 * Body: { title, description?, status?, dueDate? }
 */
router.post('/', TaskController.createTask);

/**
 * READ
 * GET /api/tasks/:id
 * Retrieve a task by ID
 */
router.get('/:id', TaskController.getTask);

/** READ
 * GET /api/tasks
 * Retrieve all tasks
 * Query params: status? (filter by status)
 */
router.get('/', TaskController.getAllTasks);

/** UPDATE
 * PATCH /api/tasks/:id/status
 * Update the status of a task
 * Body: { status }
 */
router.patch('/:id/status', TaskController.updateTaskStatus);

/** UPDATE
 * PUT /api/tasks/:id
 * Update a task
 * Body: { title?, description?, status?, dueDate? }
 */
router.put('/:id', TaskController.updateTask);

/** DELETE
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', TaskController.deleteTask);

module.exports = router;
