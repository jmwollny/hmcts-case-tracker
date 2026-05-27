const { v4: uuidv4 } = require('uuid');
const { queryAsync, runAsync, getAsync } = require('../db/queries');

/**
 * The task service talks to the database by preparing SQL statements and handling errors
 */
class TaskService {

  /**
   * Insert a task into the database
   * @param {*} taskData The task
   * @returns The new task
   */
  static async createTask(taskData) {
    const id = uuidv4();
    const dueDate = taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null;

    const sql = `
      INSERT INTO tasks (id, title, description, status, dueDate)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      taskData.title,
      taskData.description || null,
      taskData.status || 'pending',
      dueDate
    ];

    await runAsync(sql, params);

    return {
      id,
      title: taskData.title,
      description: taskData.description || null,
      status: taskData.status || 'pending',
      dueDate: dueDate
    };
  }

  /**
   * Get a task by id
   * @param {*} id 
   * @returns The task or 404 error if not found
   */
  static async getTaskById(id) {
    const sql = 'SELECT * FROM tasks WHERE id = ?';
    const task = await getAsync(sql, [id]);

    if (!task) {
      const error = new Error('Task not found');
      error.status = 404;
      throw error;
    }

    return task;
  }

  /**
   * Get all tasks with optional status filter
   * @param {*} filters 
   * @returns Returns a list of tasks ordered by due date
   */
  static async getAllTasks(filters = {}) {
    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY dueDate ASC';

    return await queryAsync(sql, params);
  }

  /**
   * Update the task status
   * @param {*} id 
   * @param {*} status 
   * @returns The updated task
   */
  static async updateTaskStatus(id, status) {
    const task = await this.getTaskById(id);
    const sql = 'UPDATE tasks SET status = ? WHERE id = ?';
    await runAsync(sql, [status, id]);

    return this.getTaskById(id);
  }

  /**
   * Update the task
   * @param {*} id 
   * @param {*} updateData 
   * @returns The updated task
   */
  static async updateTask(id, updateData) {
    const task = await this.getTaskById(id);

    let sql = 'UPDATE tasks SET ';
    const params = [];
    const updates = [];

    if (updateData.title !== undefined) {
      updates.push('title = ?');
      params.push(updateData.title);
    }

    if (updateData.description !== undefined) {
      updates.push('description = ?');
      params.push(updateData.description || null);
    }

    if (updateData.status !== undefined) {
      updates.push('status = ?');
      params.push(updateData.status);
    }

    if (updateData.dueDate !== undefined) {
      updates.push('dueDate = ?');
      params.push(updateData.dueDate ? new Date(updateData.dueDate).toISOString() : null);
    }

    sql += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    await runAsync(sql, params);

    return this.getTaskById(id);
  }

  /**
   * Delete a task
   * @param {*} id 
   * @returns The delete status message
   */
  static async deleteTask(id) {
    await this.getTaskById(id);

    const sql = 'DELETE FROM tasks WHERE id = ?';
    await runAsync(sql, [id]);

    return { message: 'Task deleted successfully' };
  }
}

module.exports = TaskService;
