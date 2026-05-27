# HMCTS Case Tracker - Backend

Express.js API server for the HMCTS Case Tracker application.

## Quick Start

```bash
# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start server
npm run dev
```

The API will be available at `http://localhost:5050/api`

## Available Scripts

- `npm run dev` - Start the server
- `npm test` - Run all tests 
- `npm run coverage` - Generate HTML coverage report

## Database

SQLite is used for data persistence. The database is automatically created on the first run - `backend/data/case_tracker.db`. 

To reset the DB simply remove the file e.g. `rm data/case_tracker.db` and restart the server.

## Validation
- Title must be supplied and greater than 2 characters and less than 255
- Due date must be supplied and be valid
- Description is optional but must be less than 2000 characters
- Status must be supplied and one of: pending, in-progress, completed, cancelled

## API Endpoints

- GET    /health                 - Health check
- GET    /api                    - API documentation
- POST   /api/tasks              - Create a task
- GET    /api/tasks              - Get all tasks 
- GET    /api/tasks/:id          - Get task by ID
- PATCH  /api/tasks/:id/status   - Update task status
- PUT    /api/tasks/:id          - Update task
- DELETE /api/tasks/:id          - Delete task

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server error |

## Sample curl commands

### Health check
```bash
curl -i -X GET http://localhost:5050/health
```

### Get API documentation
```bash
curl -i -X GET http://localhost:5050/api
```

### Create a task
```bash
curl -i -X POST http://localhost:5050/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task 1",
    "description": "Task 1 description",
    "status": "pending",
    "dueDate": "2026-06-15T12:00:00.000Z"
  }'
  ```

### Get all tasks
```bash
curl -i -X GET http://localhost:5050/api/tasks
```
### Get all tasks with status
```bash
curl -i -X GET http://localhost:3000/api/tasks?status=pending
```
### Get task by ID
```bash
curl -i -X GET http://localhost:5050/api/tasks/e22cfd4a-c2cc-45a0-a45d-5386d45bc152
```

### Update task status
```bash
curl -X PATCH http://localhost:5050/api/tasks/e22cfd4a-c2cc-45a0-a45d-5386d45bc152/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Update task
```bash
curl -i -X PUT http://localhost:3000/api/tasks/e22cfd4a-c2cc-45a0-a45d-5386d45bc152 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task 1 - updated",
    "description": "Task 1 description - updated",
    "status": "in-progress",
    "dueDate": "2026-06-20T12:00:00.000Z"
  }'
```

### Delete task
```bash
curl -i -X DELETE http://localhost:5050/api/tasks/e22cfd4a-c2cc-45a0-a45d-5386d45bc152
```

## Testing

Note: These are integration tests which exercise the server by using each API endpoint and verifying the reponses. To avoid polluting the database with test data the database is initialised inside a test environment which utilises a memory only version.

```bash
# Run all tests
npm run test

# Run tests and generate an HTML coverage report
npm run coverage
```