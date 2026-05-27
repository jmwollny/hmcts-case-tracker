const request = require('supertest');
const app = require('../src/index');
const db = require('../src/db/connection');
const { initializeDatabase } = require('../src/db/schema');

describe('Task API', () => {
  let taskId;

  // 1. Run database initialization inside the test environment before any tests execute
  beforeAll(async () => {
    await initializeDatabase();
  });

  // 2. Shut the database handle down completely when all tests finish
  afterAll((done) => {
    db.close((err) => {
      if (err) console.error(err);
      done();
    });
  });

  describe('POST /api/tasks', () => {
    test('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Sample Task',
          description: 'This is a test task',
          status: 'pending',
          dueDate: '2026-06-15:00:00:00.000Z'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('Sample Task');
      expect(response.body.data.description).toBe('This is a test task');
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.dueDate).toBe('2026-06-15T00:00:00.000Z');
      expect(response.body.data.id).toBeDefined();
    });

    test('should fail validation if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          description: 'Task without title'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should fail validation if title is too short', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'ab'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should fail validation if due date is invalid', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task with invalid due date',
          dueDate: 'ab'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/:id', () => {
    test('should retrieve a task by ID', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task to Retrieve',
          description: 'Test retrieval'
        });

      const response = await request(app)
        .get(`/api/tasks/${createRes.body.data.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Task to Retrieve');
    });

    test('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    test('should retrieve all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should filter tasks by status', async () => {
      // Create a completed task
      await request(app)
        .post('/api/tasks')
        .send({
          title: 'Completed Task',
          status: 'completed'
        });

      const response = await request(app)
        .get('/api/tasks?status=completed');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(t => t.status === 'completed')).toBe(true);
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    test('should update task status', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Status Update Task',
          status: 'pending'
        });

      const response = await request(app)
        .patch(`/api/tasks/${createRes.body.data.id}/status`)
        .send({
          status: 'in-progress'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in-progress');
    });

    test('should reject invalid status', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Status Test Task'
        });

      const response = await request(app)
        .patch(`/api/tasks/${createRes.body.data.id}/status`)
        .send({
          status: 'invalid-status'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('should update a task', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task to Update',
          description: 'Original description'
        });

      const response = await request(app)
        .put(`/api/tasks/${createRes.body.data.id}`)
        .send({
          description: 'Updated description',
          status: 'completed'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('Updated description');
      expect(response.body.data.status).toBe('completed');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('should delete a task', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Task to Delete'
        });

      const response = await request(app)
        .delete(`/api/tasks/${createRes.body.data.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify task is deleted
      const getRes = await request(app)
        .get(`/api/tasks/${createRes.body.data.id}`);

      expect(getRes.status).toBe(404);
    });
  });
});
