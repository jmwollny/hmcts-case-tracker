# HMCTS Case Tracker

A system to track and manage tasks.

## Project Overview

The HMCTS Case Tracker is a full-stack web application. Key features:
- Create and manage tasks with titles, descriptions, due dates, and status tracking
- Filter tasks by status to prioritize work
- Update task statuses throughout their lifecycle
- Delete completed or cancelled tasks
- Clean, intuitive user interface
- Fully tested with > 80% coverage

## Installation & Setup

### Backend Setup

See [backend/README.md](./frontend/README.md) for more details.

Create the `.env` file from the example:
```bash
cp .env.example .env
```

Create the dependencies and start the server
```bash
cd backend
npm install
npm run dev
```
### Frontend Setup

See [frontend/README.md](./frontend/README.md) for more details.

In a new terminal, install dependencies and start the application
```bash
cd frontend
npm install
npm run dev
```

Point your browser at `http://localhost:3000`

## Technology Stack

### Backend

- Runtime: Node.js
- Framework: Express.js
- Database: SQLite
- Validation: Joi
- Testing: Jest + Supertest

### Frontend

- Framework: React 18
- HTTP Client: Axios
- Testing: Vitest + React Testing Library

## Testing

### Backend Tests

Run all tests:
```bash
cd backend
npm test
```

Generate HTML coverage report(available in the `coverage` folder)
```bash
npm run test:coverage
```

### Frontend Tests

Run all tests:
```bash
cd frontend
npm test
```

Run tests with UI dashboard:
```bash
npm run test:ui
```
Generate HTML coverage report(available in the `coverage` folder)
```bash
npm run test:coverage
```

## Troubleshooting

### Port Already in Use
If port 5050 or 3000 is already in use, you can change them:

Backend: Update `PORT` in `.env`
Frontend: Update the target URL in `vite.config.js`

### Database Issues
To reset the database, simply delete `backend/data/case_tracker.db`. It will be recreated on next startup.
