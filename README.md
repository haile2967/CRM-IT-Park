# Ethiopian IT Park - CRM System

A full-stack Customer Relationship Management (CRM) system for Ethiopian IT Park to manage relationships with startups, investors, partners, and corporate clients.

Built based on **SRS v1.0** and **CRM Database Design v2.0**.

---

## Architecture Stack

- **Backend**: Laravel 11 (PHP 8.3-FPM)
- **Frontend**: React 19 + TypeScript + Vite
- **Database**: PostgreSQL 16
- **Cache & Queue**: Redis 7
- **Web Server**: Nginx
- **Mail Testing**: Mailpit
- **Containerization**: Docker & Docker Compose

---

## Services & Ports

| Service | Container Name | Port (Host:Container) | Description |
|---|---|---|---|
| **Nginx (Laravel API)** | `crm_nginx` | `8000:80` | Reverse proxy to PHP-FPM backend |
| **React Frontend (Vite)** | `crm_frontend` | `5173:5173` | Hot-reloading dev server |
| **PostgreSQL 16** | `crm_postgres` | `5432:5432` | Relational database (`crm_db`) |
| **Redis 7** | `crm_redis` | `6379:6379` | Cache, queues & rate limiting |
| **Mailpit Dashboard** | `crm_mailpit` | `8025:8025` | Local email testing web interface |
| **Mailpit SMTP** | `crm_mailpit` | `1025:1025` | SMTP port for notifications |
| **Queue Worker** | `crm_queue` | - | Background job processor |
| **Task Scheduler** | `crm_scheduler` | - | Inactivity monitoring & SLA escalations |

---

## Quick Start (Docker)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/haile2967/CRM-IT-Park.git
   cd CRM-IT-Park
   ```

2. **Setup environment files:**
   ```bash
   cp .env.example .env
   cp CRM_backend/.env.example CRM_backend/.env
   ```

3. **Start all services with Docker Compose:**
   ```bash
   docker compose up -d --build
   ```

4. **Run migrations and seeders:**
   ```bash
   docker exec -it crm_backend php artisan migrate --seed
   ```

5. **Access the applications:**
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)
   - **Mailpit Web UI**: [http://localhost:8025](http://localhost:8025)

---

## Specification Documents

- [SRS v1.0](Document/SRS_v1.0.pdf) - System Requirements Specification
- [Database Design v2.0](Document/CRM_Database_Design_v2.0.pdf) - 29 Table PostgreSQL Schema Design
