# 🚀  Setup Guide
### Ethiopian IT Park — Customer Relationship Management (CRM) System

Welcome to the **Ethiopian IT Park CRM** engineering team! This guide contains step-by-step instructions to get your local development environment fully up and running in minutes, set up your environment variables, and connect directly to the PostgreSQL database using **pgAdmin 4** 

---

## 📋 Table of Contents
1. [Prerequisites Checklist](#-prerequisites-checklist)
2. [Step 1: Clone the Repository](#step-1-clone-the-repository)
3. [Step 2: Place the Shared `.env` Files](#step-2-place-the-shared-env-files)
4. [Step 3: Start the Project with Docker](#step-3-start-the-project-with-docker)
5. [Step 4: Initialize the Database (Migrations & Seeders)](#step-4-initialize-the-database-migrations--seeders)
6. [Step 5: Access the Applications & Default Logins](#step-5-access-the-applications--default-logins)
7. [Step 6: Connect to PostgreSQL via pgAdmin 4](#step-6-connect-to-postgresql-via-pgadmin-4)
8. [Alternative Ways to Access the Database](#-alternative-ways-to-access-the-database)

---

## 🧰 Prerequisites Checklist

Ensure the following tools are installed on your computer before starting:

1. **Git**: [Download Git](https://git-scm.com/downloads)
2. **Docker Desktop**:
   * **Windows**: [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/) (Ensure WSL 2 backend is enabled and running).
   * **macOS / Linux**: [Docker Desktop](https://docs.docker.com/get-docker/) or Docker Engine + Compose plugin.
3. **Database GUI Client**:
   * **pgAdmin 4**: [Download pgAdmin 4](https://www.pgadmin.org/download/) *(Recommended)*
   * *Or alternatives*: [DBeaver Community](https://dbeaver.io/) or the **Database Client** extension in VS Code.

---

## Step 1: Clone the Repository

Open your terminal (PowerShell, Command Prompt, or Git Bash) and run:

```bash
git clone https://github.com/haile2967/CRM-IT-Park.git
cd CRM-IT-Park
```

> [!IMPORTANT]
> **Working Directory Rule**:
> Always run your `docker compose` and `docker exec` commands from the **root directory** of the repository (`CRM-IT-Park/`).

---

## Step 2: Place the Shared `.env` Files

Because `.env` files contain sensitive secrets, application encryption keys, and database passwords, they are **not committed to the GitHub repository**. 

Your team lead or manager will share the official `.env` files with you (e.g., via Telegram, Slack, or secure drive).

### There are TWO separate `.env` files you need to place:

```text
CRM-IT-Park/                      <--- Root project directory
├── .env                          <--- [FILE 1] Place Shared Root .env here!
├── CRM_backend/
│   └── .env                      <--- [FILE 2] Place Shared Backend .env here!
├── CRM_frontend/
├── Document/
└── docker-compose.yml
```

---

## Step 3: Start the Project with Docker

1. Make sure **Docker Desktop** is running 
2. From the root directory (`CRM-IT-Park/`), run:

```bash
docker compose up -d --build
```

---

## Step 4: Initialize the Database (Migrations & Seeders)

Once the containers are running and healthy, run the database migrations and baseline data seeders inside the backend container:

```bash
docker exec -it crm_backend php artisan migrate --seed
```

---

## Step 5: Access the Applications & Default Logins

Once started, access the project via your browser:

| Application / Service | URL | Description |
|---|---|---|
| 🌐 **Frontend UI** | [http://localhost:5174](http://localhost:5174) | React 19 Web App (or port `5173`) |
| ⚙️ **Backend API** | [http://localhost:8000](http://localhost:8000) | Laravel REST API |
| 🩺 **Health Check** | [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health) | Live diagnostics (Postgres, Redis, Mailpit) |
| 📚 **Interactive API Docs** | [http://localhost:8000/docs/api](http://localhost:8000/docs/api) | Swagger / Scramble OpenAPI documentation |
| ✉️ **Mailpit Inbox** | [http://localhost:8025](http://localhost:8025) | Local inbox for automated emails & notifications |

### 🔑 Default Pre-seeded Login Credentials:

Use these accounts to test the application based on role:

| Role | Email | Password | Permissions Scope |
|---|---|---|---|
| **System Administrator** | `e9710092@gmail.com` | `12345678` | Full administrative access, user management, system configs |

---

## Step 6: Connect to PostgreSQL via pgAdmin 4

Follow these exact steps to view tables, inspect rows, and run SQL queries using **pgAdmin 4**:

### 1. Open pgAdmin 4
Launch **pgAdmin 4** on your host computer.

### 2. Register a New Server
* In the left **Object Explorer** tree, right-click on **Servers** (or **Server Groups**).
* Click **Register** ➔ **Server...**

---

### 3. General Tab
In the modal that appears, under the **General** tab:
* **Name**: `CRM PostgreSQL Local` *(or any name you like)*

---

### 4. Connection Tab (Crucial Settings)
Switch to the **Connection** tab and enter the following values:

| Field in pgAdmin | Value to Enter | Why / Notes |
|---|---|---|
| **Host name/address** | `localhost` or `127.0.0.1` | ⚠️ **Do NOT enter `postgres`**! `postgres` is only valid inside the Docker network. From your host machine, use `localhost`. |
| **Port** | `5433` *(or check root `.env`)* | ⚠️ **Check `DB_PORT` in your root `.env`**. Default is `5433` to prevent conflict with local Postgres installations. If your `.env` has `DB_PORT=5432`, enter `5432`. |
| **Maintenance database** | `crm_db` | Value of `DB_DATABASE` in your root `.env`. |
| **Username** | `crm_user` | Value of `DB_USERNAME` in your root `.env`. |
| **Password** | `crm_secret12` | Value of `DB_PASSWORD` in your root `.env`. |

* Check the box: **☑ Save password?**
* Click the blue **Save** button.

---

## 💻 Alternative Ways to Access the Database

If you do not want to use pgAdmin, you can access the database using any of these methods:

### Method A: Command-Line `psql` (Inside Docker)
You can directly jump into an interactive PostgreSQL terminal without installing anything locally:

```bash
docker exec -it crm_postgres psql -U crm_user -d crm_db
```

**Helpful `psql` commands:**
* `\dt` — List all tables
* `\d users` — Show table columns and schema for `users`
* `SELECT email, full_name, role_id FROM users;` — Run a query
* `\q` — Exit psql
