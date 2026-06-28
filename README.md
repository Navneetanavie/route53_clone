# AWS Route53 Clone

A production-quality clone of the AWS Route53 web application. This project recreates the Route53 console experience with persistent storage and REST APIs — it is **not** a DNS server and does not perform actual DNS resolution.

## Tech Stack

| Layer    | Technology        |
|----------|-------------------|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend  | FastAPI, Pydantic |
| Database | SQLite            |

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API runs at `http://localhost:8000`. SQLite database file `route53.db` is created automatically on first run.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

### Demo Credentials

| Username | Password |
|----------|----------|
| admin    | admin    |

## Demo Link

[TBD — deploy and add URL here]

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Next.js)                                     │
│  Pages → Components → Hooks → lib/api (fetch + cookies) │
└──────────────────────────┬──────────────────────────────┘
                           │ REST + session cookie
┌──────────────────────────▼──────────────────────────────┐
│  Backend (FastAPI)                                      │
│  Routers → Services → Repositories → SQLAlchemy Models  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  SQLite (route53.db)                                    │
│  users | hosted_zones | dns_records                     │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

- **Routers** — HTTP endpoints, status codes, auth dependency injection
- **Services** — Business logic, validation, name normalization
- **Repositories** — Database queries, pagination, search, sorting
- **Models** — SQLAlchemy ORM table definitions with foreign keys

---

## Project Structure

```
route53_clone/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Settings (DB, CORS, session)
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── auth_utils.py        # Password hashing (bcrypt)
│   │   ├── seed.py              # Default user seeding
│   │   ├── models/              # ORM models
│   │   ├── schemas/             # Pydantic request/response models
│   │   ├── repositories/        # Data access layer
│   │   ├── services/            # Business logic layer
│   │   └── routers/             # API route handlers
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── app/                 # Next.js App Router pages
│       ├── components/          # UI + layout + feature components
│       ├── lib/api/             # Typed API client
│       └── types/               # Shared TypeScript interfaces
└── README.md
```

---

## Database Schema

### users

| Column        | Type    | Notes              |
|---------------|---------|--------------------|
| id            | INTEGER | Primary key        |
| username      | TEXT    | Unique             |
| password_hash | TEXT    | bcrypt hash        |

### hosted_zones

| Column     | Type     | Notes              |
|------------|----------|--------------------|
| id         | INTEGER  | Primary key        |
| name       | TEXT     | e.g. `example.com.`|
| comment    | TEXT     | Nullable           |
| created_at | DATETIME | Auto-set           |
| updated_at | DATETIME | Auto-updated       |

### dns_records

| Column         | Type     | Notes                              |
|----------------|----------|------------------------------------|
| id             | INTEGER  | Primary key                        |
| hosted_zone_id | INTEGER  | FK → hosted_zones.id (CASCADE)     |
| name           | TEXT     | Record name                        |
| type           | TEXT     | A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA |
| ttl            | INTEGER  | Default 300                        |
| value          | TEXT     | Record value                       |
| routing_policy | TEXT     | Mock, default "Simple"             |
| comment        | TEXT     | Nullable                           |
| created_at     | DATETIME | Auto-set                           |
| updated_at     | DATETIME | Auto-updated                       |

**Relationship:** One hosted zone has many DNS records. Deleting a hosted zone cascades and removes all associated records.

---

## API Overview

All endpoints except `/login` and `/health` require an authenticated session cookie.

### Authentication

| Method | Path       | Description              |
|--------|------------|--------------------------|
| POST   | `/login`   | Sign in, set session cookie |
| POST   | `/logout`  | Clear session (204)      |
| GET    | `/session` | Get current user (401 if not logged in) |

### Hosted Zones

| Method | Path                  | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | `/hosted-zones`       | List (paginated, searchable)   |
| GET    | `/hosted-zones/{id}`  | Get single zone with record count |
| POST   | `/hosted-zones`       | Create (201)                   |
| PUT    | `/hosted-zones/{id}`  | Update                         |
| DELETE | `/hosted-zones/{id}`  | Delete + cascade records (204) |

**Query params:** `page`, `page_size`, `search`, `sort_by`, `sort_order`

### DNS Records

| Method | Path                                | Description              |
|--------|-------------------------------------|--------------------------|
| GET    | `/hosted-zones/{id}/records`        | List records (paginated) |
| POST   | `/hosted-zones/{id}/records`        | Create record (201)      |
| PUT    | `/records/{id}`                     | Update record            |
| DELETE | `/records/{id}`                     | Delete record (204)      |

**Query params:** `page`, `page_size`, `search`, `type` (filter), `sort_by`, `sort_order`

### Example

```bash
# Login
curl -c cookies.txt -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Create hosted zone
curl -b cookies.txt -X POST http://localhost:8000/hosted-zones \
  -H "Content-Type: application/json" \
  -d '{"name":"example.com","comment":"My zone"}'

# Create DNS record
curl -b cookies.txt -X POST http://localhost:8000/hosted-zones/1/records \
  -H "Content-Type: application/json" \
  -d '{"name":"www.example.com","type":"A","ttl":300,"value":"192.0.2.1"}'
```

---

## How Authentication Works

Authentication is **mocked** — no real AWS IAM integration.

1. Default user `admin` / `admin` is seeded on first startup (password stored as bcrypt hash).
2. `POST /login` validates credentials and stores `username` in a signed HTTP-only session cookie.
3. Protected routes check the session via `get_current_user` dependency (returns 401 if missing).
4. `GET /session` lets the frontend verify login state on page load.
5. `POST /logout` clears the session cookie.

The frontend uses `credentials: 'include'` on all API requests to send cookies cross-origin (CORS configured for `localhost:3000`).

---

## How Hosted Zones Work

1. Navigate to **Hosted zones** in the sidebar.
2. View paginated list with search by name.
3. **Create hosted zone** — enter domain name and optional comment.
4. Click a zone name to open the detail page with metadata and DNS records table.
5. **Edit** or **Delete** via the row action menu (⋮).
6. Deleting a zone removes all its DNS records (cascade delete).

Zone names are normalized to include a trailing dot (Route53 convention).

---

## How DNS Records Work

1. Open a hosted zone detail page.
2. View paginated records table with search by name and filter by type.
3. **Create record** — specify name, type (A/AAAA/CNAME/TXT/MX/NS/PTR/SRV/CAA), TTL, value, and optional comment.
4. Routing policy is mocked as "Simple" (read-only).
5. **Edit** or **Delete** records via the action menu.
6. Toast notifications confirm success or show errors.

---

## UI Features

- AWS console-style dark sidebar and top navigation
- Breadcrumbs, tables, modals, confirmation dialogs
- Search, pagination, type filters
- Loading spinners and empty states
- Toast notifications (create/update/delete/errors)
- Coming Soon pages: Dashboard, Traffic Policies, Health Checks, Resolver, Profiles
- **Dark mode** — toggle in the top navigation bar (persisted in localStorage)
- **Keyboard shortcuts** — `/` to focus search, `?` to show shortcuts help

---

## Phase 9 — Optional Features

### Import / Export

On a hosted zone detail page:

- **Import BIND** — upload or paste a BIND zone file to add records
- **Export JSON** — download zone metadata + all records as JSON
- **Export BIND** — download a standard BIND zone file

**API:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/hosted-zones/{id}/export?format=json` | Export as JSON |
| GET | `/hosted-zones/{id}/export?format=bind` | Export as BIND (text/plain) |
| POST | `/hosted-zones/{id}/import/bind` | Import BIND records `{ "content": "..." }` |

### Bulk Record Delete

Select records via checkboxes on the records table, then click **Delete selected**. Confirms before deleting.

**API:** `POST /hosted-zones/{id}/records/bulk-delete` with `{ "record_ids": [1, 2, 3] }`

### Dark Mode

Click **Dark** / **Light** in the top nav. Preference is saved to `localStorage`.

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus the search bar |
| `?` | Show keyboard shortcuts dialog |
| `Esc` | Close open dialog |

---

## Environment Variables

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (optional `.env` in `backend/`)

```
DATABASE_URL=sqlite:///./route53.db
SECRET_KEY=your-secret-key
CORS_ORIGINS=["http://localhost:3000"]
```
