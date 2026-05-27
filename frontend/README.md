# HMCTS Case Tracker - Frontend

`React.js` frontend application for the HMCTS Case Tracker system. The application is fully keyboard navigable and uses Aria roles and attributes where applicable to assist screen readers.

The main `App.tsx` component
handles the communication with the backend via the `taskService` component. The main UI comprises of a status filter dropdown and a list of tasks. 

Tasks can be filtered by status. If all tasks are selected, then the list of completed tasks are shown separately in a collapsable accordion component. This allows the user to hide completed tasks so the UI is less cluttered. Completed tasks cannot be edited but *can* be deleted. In order to edit a completed tasks the status much be changed.

Editing a task replaces the current task card with an edit form. While editing, all other task cards and buttons are disabled. Similarly when adding a new task all buttons and cards are disabled until the task is created or the form is cancelled.

## Form validation
- Title must be entered 
- Due date must be supplied
- Description is optional

## Quick Start

```bash
# Install dependencies
npm install

# Start application
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start the application
- `npm test` - Run all tests
- `npm run test:ui` - Run tests with an interactive UI
- `npm run coverage` - Generate HTML coverage report

## Components

### TaskForm
Component for creating and editing tasks.

Props:
- `onSubmit(taskData)` - Handle form submission
- `task` - not null when editing, null when creating
- `onCancel` - Handle cancel action

### TaskList
Component for displaying and managing tasks.

Props:
- `tasks` - Array of task objects
- `onStatusChange(id, status)` - Handle status change
- `onUpdate(id, taskData)` - Handle update action
- `onDelete(id)` - Handle delete action
- `disabled(optional)` - Disable the component
- `onEditChange(isEditing)` - Handle edit change

### TaskCard
Component for displaying a single task.

Props:
- `task` - Task objectUpdate(id, taskData)` - Handle update action
- `disabled(optional)` - Disable the component
- `onStatusChange(id, status)` - Handle status change
- `onEdit(task)` - Handle edit
- `onDelete(id)` - Handle delete action

### Button
Simple styled button - two sizes and three colours.

Props:
- `text` - The button label
- `size` - normal or large
- `colour` - primary, secondary or danger(used for deleting)
- `disabled(optional)` - Disable the button

### StatusDropDown
Common drop down component that lists the available task statuses(defined by the `TaskStatus` enum)

Props:
- `value` - The current selected option
- `onChange` - Handle option change
- `showAllOption(optional)` - Show the 'All tasks' option
- `disabled(optional)` - Disable the component

### Trafficlight
Simple component to assign a colour and title to a status. 
due date in the past - overdue - `red`
Less than 48 hours remaining due soon - `amber`
Greater than 48 hours remaining - plenty of time - `green`

Props:
- `dueDate` - The due date for the task

### Accordian
Simple component that renders arbitrary child components in a named collapsable section. Fully keyboard navigable.

Props:
- `title` - The section title
- `children` - The child component to be rendered inside the Accordian
- `defaultOpen(optional)` - Should the section be in the open state initially?
- `disabled(optional)` - Disable the component

## Custom Hooks

### useTasks
Manages task state and API operations.

Returns:
- `tasks` - Array of tasks
- `loading` - Loading state
- `error` - Error message
- `fetchTasks(filters)` - Load tasks
- `createTask(taskData)` - Create new task
- `updateTaskStatus(id, status)` - Update status
- `updateTask(id, taskData)` - Update task
- `deleteTask(id)` - Delete task

## Services

### taskService
Handles all API communication with the backend.

Methods:
- `createTask(taskData)`
- `getTaskById(id)`
- `getAllTasks(filters)`
- `updateTaskStatus(id, status)`
- `updateTask(id, taskData)`
- `deleteTask(id)`

## Testing

Comprehensive suite of tests using Vitest and React Testing Library. Test coverage > 90%

# Future enhancements

- Internationalize(i18n) all strings by pulling them out into a strings file and templating them in the code
- Convert CSS to scoped CSS using CSS modules
- Convert DB layer to use a production level DB such as MariaDB
- Add paging to the UI
- Add ability to sort the list, by Name, Status etc.
- Add a completed date
