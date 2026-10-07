# Docker Execution & Team Setup Guide

This guide provides step-by-step instructions for developers working on the **Ethiopian IT Park CRM System**. It covers how to run the full application stack together or run specific services (Backend/Frontend) individually.

---

## 📁 Working Directory Context

> [!IMPORTANT]  
> All `docker compose` commands MUST be executed from the **root project directory**:  
> `c:\Users\dev.user\Documents\CRM-IT-Park` (or wherever your cloned `CRM-IT-Park` folder resides).

```text
CRM-IT-Park/                <-- EXECUTE ALL DOCKER COMMANDS FROM HERE!
├── CRM_backend/
├── frontend/
├── docker/
├── Document/
└── docker-compose.yml
```

---

## 🚀 Option 1: Run Everything Together with Docker (Full Stack)

Use this method when developing full-stack features or testing the complete system end-to-end.

### Step 1: Environment Setup (.env Files)
> [!IMPORTANT]
> The active `.env` files contain sensitive credentials and are **not committed to GitHub**. 
> The project lead will share the `.env` files with you directly via **Telegram**.

Once you download the files from Telegram, place them into these exact locations:

1. **Root `.env` file**:
   * Save the shared root `.env` directly in the project root:
   * **Location**: `CRM-IT-Park/.env`
   *(Controls Docker ports, PostgreSQL container variables, etc.)*

2. **Backend `.env` file**:
   * Save the shared backend `.env` inside the `CRM_backend` folder:
   * **Location**: `CRM-IT-Park/CRM_backend/.env`
   *(Controls Laravel app key, database connection, cache, and session settings)*

> [!TIP]  
> **If you already have PostgreSQL installed on your computer (Port 5432 conflict):**  
> Check line 10 in the root `CRM-IT-Park/.env`. If you see a port conflict when starting Docker, change `DB_PORT=5432` to `DB_PORT=5433`. Docker will bind without stopping your local Postgres.

*(Alternative if creating from templates manually):*
```bash
# Execute in root directory (CRM-IT-Park/) only if not receiving from Telegram
cp .env.example .env
cp CRM_backend/.env.example CRM_backend/.env
```

### Step 2: Build & Start All Containers
```bash
# Execute in root directory (CRM-IT-Park/)
docker compose up -d --build
```

### Step 3: Run Database Migrations & Seeders
Once containers are running, execute database setup inside the `crm_backend` container:

```bash
# Execute in root directory (CRM-IT-Park/)
docker exec -it crm_backend php artisan migrate --seed
```

### 🌐 Access URLs (Full Stack)
| Application / Service | Service Name | Access URL | Description |
|---|---|---|---|
| **Frontend Web App** | `crm_frontend` | [http://localhost:5173](http://localhost:5173) | React 19 + Vite UI |
| **Backend API** | `crm_nginx` / `crm_backend` | [http://localhost:8000](http://localhost:8000) | Laravel API Endpoints |
| **Mailpit Dashboard** | `crm_mailpit` | [http://localhost:8025](http://localhost:8025) | Local Email Testing Web Interface |
| **PostgreSQL Database** | `crm_postgres` | `localhost:5432` | DB: `crm_db`, User: `crm_user` |

---

## ⚡ Option 2: Using Docker for Specific Services

Use these options if you only want to focus on backend API development or frontend UI development separately.

### Scenario A: Start Backend & Database Only
If you are working strictly on the backend API or testing with Postman:

```bash
# Execute in root directory (CRM-IT-Park/)
docker compose up -d backend nginx postgres redis mailpit
```

* **Run Backend Migrations**:
  ```bash
  docker exec -it crm_backend php artisan migrate
  ```
* **Backend API URL**: [http://localhost:8000](http://localhost:8000)

---

### Scenario B: Start Frontend Only (Connecting to an External/Running Backend)
If you are working strictly on frontend components and already have backend services running:

```bash
# Execute in root directory (CRM-IT-Park/)
docker compose up -d frontend
```

* **Frontend UI URL**: [http://localhost:5173](http://localhost:5173)

---

### Scenario C: Start Database & Cache Infrastructure Only (Local Native Dev)
If you prefer running `php artisan serve` and `npm run dev` directly on your host machine without containerizing PHP/Node:

```bash
# Execute in root directory (CRM-IT-Park/)
docker compose up -d postgres redis mailpit
```

Then in separate local terminals:
* **Backend (in `CRM_backend/`)**:
  ```bash
  cd CRM_backend
  php artisan serve --port=8000
  ```
* **Frontend (in `frontend/`)**:
  ```bash
  cd frontend
  npm run dev
  ```

---

## 🛠️ Useful Management & Troubleshooting Commands

All commands below should be run from the root directory (`CRM-IT-Park/`):

### 1. Check Status of All Services
```bash
docker compose ps
```

### 2. View Live Container Logs
* **All Services**: `docker compose logs -f`
* **Backend Logs Only**: `docker compose logs -f backend`
* **Nginx Logs Only**: `docker compose logs -f nginx`
* **Frontend Logs Only**: `docker compose logs -f frontend`

### 3. Stop All Services
```bash
docker compose down
```

### 4. Stop All Services & Remove Saved Volumes (Clean Database Reset)
> [!WARNING]  
> This will wipe local database data in PostgreSQL.

```bash
docker compose down -v
```

### 5. Re-generate Application Encryption Key (If Laravel throws 500 Encryption Key Error)
```bash
docker exec -it crm_backend php artisan key:generate
```
