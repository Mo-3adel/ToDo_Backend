# ToDo Backend

Simple, ready-to-run Node.js REST API for managing Projects, Tasks, and Team members.
Built with Express and MongoDB (Mongoose).

---

## Project overview and purpose

- Purpose: provide a small backend to create and manage projects, assign tasks to team members
  (by email or id), and keep tasks linked to projects by project name. Good for demos and
  small team workflows.

---

## Quick setup & installation

1. Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd ToDo_Backend
npm install
```

2. Configure environment / database (see Database setup below).

3. Start the server:

```bash
node src/index.js
```

---

## Database setup and configuration

- This project uses MongoDB. Connection is configured in `src/config/mangodb.js`.
- You can provide a MongoDB URI using an environment variable (recommended). Example `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/todo_db
PORT=3000
```

- If you run MongoDB locally, ensure `mongod` is running. If using a hosted service (Atlas),
  replace `MONGODB_URI` with the provided connection string.

---

## API Endpoints (summary)

Note: the app mounts routers at `/api/v1` (see `src/app.js`). Use `/api/v1` as the base path.

### Projects
- POST `/api/v1/projects` — Create a project
- GET `/api/v1/projects` — List all projects
- GET `/api/v1/projects/:title` — Get a project by its title
- PUT `/api/v1/projects/:id` — Update a project
- DELETE `/api/v1/projects/:id` — Delete a project

### Tasks
- POST `/api/v1/tasks` — Create a task. `assignedTo` accepts an array of team member emails or IDs; `project` receives the project title (string).
- GET `/api/v1/tasks` — List all tasks
- PUT `/api/v1/tasks/:id` — Update a task (can update `assignedTo` and `project`)
- DELETE `/api/v1/tasks/:id` — Delete a task

### Teams
- POST `/api/v1/team` — Create a team member (note: route uses singular `team`)
- GET `/api/v1/team` — List all team members
- PUT `/api/v1/team/:id` — Update a team member
- DELETE `/api/v1/team/:id` — Delete a team member

### Reports
- GET `/api/v1/report` — Generate tasks report and save to `reports/tasks_report.json`.
  - Calls `src/utils/reportsGen.js` which aggregates tasks per project and writes the JSON report.
  - The generated report file lives at `reports/tasks_report.json` in the repo when generated locally.

---

## Example requests & responses

Create Project (request)

POST `/api/v1/projects`

```json
{
  "title": "Website Redesign",
  "description": "Update UI and content",
  "dueDate": "2025-12-31"
}
```

Create Project (response)

```json
{
  "_id": "64c...",
  "title": "Website Redesign",
  "description": "Update UI and content",
  "dueDate": "2025-12-31T00:00:00.000Z",
  "createdAt": "2025-06-01T12:00:00.000Z",
  "tasks": [],
  "Members": []
}
```

Create Team Member (request)

POST `/api/v1/team`

```json
{
  "name": "John Doe",
  "role": "Developer",
  "email": "john@example.com"
}
```

Create Task (request)

POST `/api/v1/tasks`

```json
{
  "title": "Design Homepage",
  "description": "Create mockups",
  "status": "pending",
  "assignedTo": ["john@example.com"],
  "dueDate": "2025-12-31",
  "project": "Website Redesign"
}
```

Create Task (behavior)
- The server converts any emails in `assignedTo` into team member `_id` values (looks up by `email`).
- The task is saved with `project` as the project title and the task id is pushed into the referenced project's `tasks` array.

Postman
- A Postman collection is included: `Todo_projects.postman_collection.json` — import it to test endpoints and see example requests.

---

## Folder structure & architecture layers

Top-level layout (key folders/files):

```
src/
  config/        # DB connection and environment config (src/config/mangodb.js)
  controllers/   # Route handlers (project_controller.js, tasksController.js, teamController.js)
  models/        # Mongoose schemas (project_model.js, taskModel.js, teamModel.js)
  routers/       # Express routers mapping endpoints to controllers
  middlewares/   # Logging, error handling, etc.
  utils/         # Helpers (reportsGen.js)
  index.js       # App entry (server start)
```

Architecture
- Models: Mongoose schemas and validations.
- Controllers: Business logic (creating entities, converting emails to IDs, syncing relations).
- Routers: Define HTTP routes and map to controllers.
- Config: Single place to configure DB connections and environment variables.

Data relationships
- Tasks reference team members in `assignedTo` (array of ObjectId) and store the `project` as a project title string.
- When tasks are created/updated/deleted the code keeps the related `Project.tasks` and `Team.tasks` arrays in sync.

---

## Testing & next steps

- Import the included Postman collection: `Todo_projects.postman_collection.json` and run the requests.
- Consider adding:
  - Authentication (JWT) and authorization
  - Validation middleware (Joi / express-validator)
  - Unit / integration tests

---

## Where to look in the code
- `src/models/` — data schemas
- `src/controllers/` — request handling and conversion logic for `assignedTo`
- `src/routers/` — route definitions
- `src/config/mangodb.js` — DB connection
- `Todo_projects.postman_collection.json` — Postman collection with examples

