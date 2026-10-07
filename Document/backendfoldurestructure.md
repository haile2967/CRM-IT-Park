# Backend Folder Structure

## Clear Explanation of Each Folder

### `app/Enums/`
Contains strongly typed enumerations.  
Used for fixed values such as Lead Status, Ticket Priority, Opportunity Status, Roles, etc.  
Prevents using magic strings in the code.

### `app/Exceptions/`
Holds custom exception classes.  
Used when business rules are violated (example: ownership transfer not allowed, escalation rules broken).

### `app/Http/Controllers/`
Contains controller classes.  
They receive HTTP requests from the React frontend, call the appropriate Service, and return the response.

### `app/Http/Middleware/`
Contains middleware classes.  
These run before the request reaches the controller.  
Used for authentication, role checking, ownership validation, and forcing JSON responses.

### `app/Http/Requests/`
Contains Form Request classes.  
Responsible for validating incoming data and checking authorization before the controller runs.

### `app/Http/Resources/`
Contains API Resource classes.  
They transform Eloquent models into clean, consistent JSON responses for the frontend.

### `app/Models/`
Contains Eloquent models.  
Each model represents one database table and defines relationships, casts, and soft deletes.

### `app/Services/`
Contains the business logic of the application.  
Controllers stay thin. All important rules (Lead conversion, Ticket escalation, ownership transfer, etc.) live here.

### `app/Jobs/`
Contains background jobs.  
Used for tasks that should run asynchronously (sending reminders, escalating tickets, generating export files).

### `app/Notifications/`
Contains notification classes.  
Used to send emails or system notifications (Ticket reminders and escalations).

### `app/Policies/`
Contains authorization policies.  
Defines who can view, create, update, or delete a record (CRM Manager, BDO, Support Agent rules).

### `app/Providers/`
Contains service providers.  
Used to register bindings, event listeners, and other application configurations.

### `app/Traits/`
Contains reusable traits.  
Shared logic that can be used by multiple classes (example: ownership handling, soft delete helpers).

---

### Framework & Infrastructure Folders

| Folder | Explanation |
|--------|-------------|
| `bootstrap/` | Laravel’s internal bootstrap files. You rarely touch this. |
| `config/` | All configuration files (database, queue, cors, auth, etc.). |
| `database/migrations/` | Database schema changes. Each migration creates or modifies tables. |
| `database/seeders/` | Classes that insert initial or test data into the database. |
| `database/factories/` | Used to generate fake data for testing. |
| `routes/` | Defines all API endpoints that the React frontend will call. |
| `tests/` | Contains automated tests (Feature tests and Unit tests). |
| `storage/` | Stores logs, cache files, and uploaded files. |
| `public/` | The only publicly accessible folder. Contains `index.php` (entry point). |

---

### Root Files

| File | Explanation |
|------|-------------|
| `artisan` | Laravel’s command-line tool. Used to run migrations, create files, start queues, etc. |
| `composer.json` | Defines PHP dependencies and project metadata. |
| `phpunit.xml` | Configuration for running tests. |
| `.env` | Environment variables (database credentials, app key, etc.). |
| `docker-compose.yml` | Defines the Docker services (Nginx, PostgreSQL, Redis, etc.). |
