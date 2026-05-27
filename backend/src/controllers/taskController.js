const TaskService = require('./taskService');
const { validateCreateTask, validateUpdateStatus } = require('../validators/taskValidator');

/**
 * This TaskController takes incoming HTTP requests from the frontend, ensures the data
 * is valid and calls the DB service, handling any errors and wrapping up the response
 */
class TaskController {

  /**
   * Create the task
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  static async createTask(req, res, next) {
    try {
      const { error, value } = validateCreateTask(req.body);

      if (error) {
        error.details = error.details;
        throw error;
      }

      const task = await TaskService.createTask(value);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieve a task
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  static async getTask(req, res, next) {
    try {
      const { id } = req.params;
      const task = await TaskService.getTaskById(id);

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieve all tasks
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  static async getAllTasks(req, res, next) {
    try {
      const { status } = req.query;
      const filters = status ? { status } : {};

      const tasks = await TaskService.getAllTasks(filters);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update the task status
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  static async updateTaskStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = validateUpdateStatus(req.body);

      if (error) {
        error.details = error.details;
        throw error;
      }

      const task = await TaskService.updateTaskStatus(id, value.status);

      res.status(200).json({
        success: true,
        message: 'Task status updated successfully',
        data: task
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update the task
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  static async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const task = await TaskService.updateTask(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete a task
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  static async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const result = await TaskService.deleteTask(id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TaskController;
