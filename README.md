# 📧 Email Campaign Microservice

A backend-only email campaign service — build, schedule, and deliver email campaigns in batches. No frontend, no fluff — just real backend engineering: APIs, DB integration, background jobs, async delivery, and cloud‑native friendly setup.

---

## 🚀 Features

- Create & schedule email campaigns
- Add multiple recipients per campaign
- Batch-based email delivery via SMTP
- Clean architecture: usecases, controllers, repositories
- Job queues with BullMQ + ioredis
- Gmail OAuth2 and Brevo SMTPs supported via Nodemailer helpers
- Deployable with Docker + Kubernetes

---

## 🛠 Tech Stack

| Layer       | Tool / Library                                |
|-------------|-----------------------------------------------|
| Language    | Node.js (JavaScript)                          |
| Framework   | Express                                        |
| Validation  | @hapi/joi                                      |
| Time/Utils  | moment-timezone, lodash                        |
| Database    | CockroachDB (PostgreSQL‑compatible)            |
| Email       | Nodemailer (Gmail OAuth2, Brevo SMTP helpers)  |
| Queue       | BullMQ + ioredis                               |
| Scheduler   | BullMQ workers (can be run as separate procs)  |


> Node starts at **`src/index.js`**, which wires the **`RestService`** router and mounts controllers.

---

## 📁 Folder Structure (key paths)

```
src/
├── index.js                     # Express bootstrap
├── rest-service.js              # Registers routes (users, emails, campaigns)
├── response-enhancer.js         # Adds res.success/res.fail helpers
├── http-server-callback/        # HTTP adapter for controllers
├── controllers/                 # Thin controllers + validation
│   ├── users/                   # create/update/delete/get
│   ├── emails/                  # send/list/delete
│   └── campaigns/               # create/recipients/send/status/update
├── usecases/                    # Business logic (users, emails, campaigns)
├── data-access/                 # DB accessors (campaigns, emails, users, etc.)
├── jobs/                        # BullMQ workers + queue initializers
│   ├── initialize-queues.js     # Queue + Redis connection & logging
│   ├── send-campaign-job.js     # Enqueue per‑recipient email jobs
│   ├── send-email-via-node-mailer-job.js  # Deliver single email
│   └── campaign-email-sent-job.js         # Post‑send updates
├── config/
│   └── environments/
│       ├── development.js       # Base config (Cockroach, Redis, SMTP, topics)
│       └── index.js             # Loads {env} + .env overrides
├── utils/
│   ├── node-mailer-util.js      # Creates OAuth2/SMTP transport
│   └── build-email-from-template.js
├── exceptions/                  # Typed errors
├── .env.example                 # Minimal env template (OAuth2, DB)
└── ...
```

---

## 📦 API Endpoints

### 👤 Users
- `GET /users` – List users by `linkname` (query param).
- `POST /users` – Create user.
- `PUT /users/:id` – Update user.
- `DELETE /users/:id` – Delete user.

### ✉️ Emails
- `POST /emails/send` – Send a single email (immediate).
- `GET /emails` – List emails by `linkname` and `userId` (query params).
- `DELETE /emails/:id` – Delete an email.

### 📮 Campaigns
- `POST /campaigns` – Create a new campaign.
- `POST /campaigns/:id/recipients` – Add recipients in bulk to a campaign.
- `POST /campaigns/:id/send` – Queue a campaign for delivery (BullMQ).
- `GET /campaigns/:id/status` – Fetch campaign status/progress.
- `PUT /campaigns/:id/:status` – Update campaign status (e.g., pause/resume).

> The Express router is registered in `src/rest-service.js` and mounted in `src/index.js`.

---

## 🔁 Background Workers

- **send-campaign-job**: reads a campaign and enqueues per‑recipient **send-email** jobs.
- **send-email-via-node-mailer-job**: builds the message (HTML parsing with `cheerio`) and sends via Nodemailer transporter (Gmail OAuth2 or Brevo).
- **campaign-email-sent-job**: updates delivery state and aggregates campaign metrics.
- **initialize-queues**: centralizes BullMQ queues + Redis connection and logs lifecycle events.

> Run workers as separate node processes for scale; see examples below.

---

## ⚙️ Configuration & Environment

Environment loading order:
1. `NODE_ENV` selects `src/config/environments/{NODE_ENV}.js` (defaults to `development`).
2. `.env` (or container secrets) override select fields in `config/environments/index.js`.

**`.env.example` keys (see `src/.env.example`):**
```
# Gmail OAuth2
GMAIL_USER=someone@domain.com
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...

# Brevo
BREVO_PASS=...

# Database
DB_NAME=mydb
DB_USERNAME=myuser
DB_PASSWORD=...
```

**Redis & SMTP** are configured in `config/environments/development.js` and can be overridden with environment variables if desired.

---

## ▶ Running Locally

### 1) Start API
```bash
# from project root
node src/index.js
# server listens on PORT 3000 (see src/index.js)
```

### 2) Start Workers (in separate terminals)
```bash
node src/jobs/send-campaign-job.js
node src/jobs/send-email-via-node-mailer-job.js
node src/jobs/campaign-email-sent-job.js
```

### 3) Services you need running
- CockroachDB (Postgres‑compatible) reachable to the app.
- Redis for BullMQ queues.
- SMTP provider: Gmail OAuth2 or Brevo (via Nodemailer).

> Docker/Kubernetes manifests are not included in this `src` bundle. If you use them, ensure Redis, DB, and workers are declared as separate deployables.

---

## 🧪 Quick Smoke Test

```bash
# Create a campaign
curl -X POST http://localhost:3000/campaigns   -H "Content-Type: application/json"   -d '{"name":"Sept Launch","subject":"Hello!","from":"Me <me@domain.com>"}'

# Add recipients
curl -X POST http://localhost:3000/campaigns/<id>/recipients   -H "Content-Type: application/json"   -d '{"recipients":[{"email":"a@x.com"},{"email":"b@y.com"}]}'

# Send it
curl -X POST http://localhost:3000/campaigns/<id>/send

# Check status
curl http://localhost:3000/campaigns/<id>/status
```

---

## ✅ Roadmap / Ideas

- Rate‑limiting per user and per domain
- Webhook receivers for bounces/complaints
- API auth (JWT/OAuth) and per‑tenant quotas
- Provider failover & warmup strategies
- Delivery analytics & dashboards

---

## 👨‍💻 Author

Made by Harshvardhan Rajpurohit – Backend Developer • Go / Node.js • GCP • Kubernetes • Clean Architecture
