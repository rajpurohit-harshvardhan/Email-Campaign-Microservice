# 📧 Email Campaign Microservice

A backend-only email campaign service — build, schedule, and deliver email campaigns in batches. No frontend, no fluff — just real backend engineering: APIs, database integration, background jobs, async delivery, and cloud-native deployment.

---

## 🚀 Features

- Create & schedule email campaigns
- Add multiple recipients per campaign
- Batch-based email delivery via SMTP
- Retry failed deliveries with cron-based workers
- Track success/failure per recipient
- Clean architecture: usecases, controllers, repositories
- Deployable with Docker + Kubernetes

---

## 🛠 Tech Stack

| Layer       | Tool                         |
|-------------|------------------------------|
| Language    | Node.js (JavaScript)         |
| Framework   | Express                      |
| Database    | CockroachDB (PostgreSQL-compatible) |
| Email       | Nodemailer (SMTP)            |
| Queue       | BullMQ + Redis               |
| Scheduler   | node-cron                    |
| Deployment  | Docker + Kubernetes          |
| Optional    | MongoDB backend support      |

---

## 📁 Folder Structure

```
.
├── src/
│   ├── api/              # Express route handlers
│   ├── controllers/      # Input validation, API controllers
│   ├── usecases/         # Business logic
│   ├── db/               # DB access (Cockroach or Mongo)
│   ├── jobs/             # Background workers
│   ├── config/           # DB, Redis, Email, Env
│   └── utils/            # Helper functions, constants
├── .env.example          # Environment variable template
├── docker-compose.yml    # For local dev
├── k8s/                  # Kubernetes manifests
└── README.md             # This file
```

---

## 📦 API Endpoints

### 📮 Campaigns
- `POST /campaigns` – Create a new campaign
- `GET /campaigns` – List all campaigns
- `POST /recipients` – Add recipients to campaign
- `POST /campaigns/:id/schedule` – Schedule for delivery
- `GET /campaigns/:id/status` – Status report

---

## 🔁 Background Jobs

- **cron/batch email worker**: runs every minute, picks scheduled campaigns
- **retry worker**: re-attempts failed emails (max 3 tries)
- **status updater**: updates campaign state post-delivery

---

## ⚙️ Environment Variables

```
PORT=3000
DB_TYPE=cockroach
COCKROACH_URL=postgresql://user:pass@localhost:26257/db
MONGO_URI=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
```

---

## 🚀 Deployment

### ▶ Local (Docker Compose)
```bash
docker-compose up --build
```

### ▶ Kubernetes
```bash
kubectl apply -f k8s/
```

---

## ✅ Todo / Future Enhancements

- [ ] Add MongoDB adapter
- [ ] Rate-limiting per user
- [ ] API authentication (JWT or OAuth)
- [ ] Delivery analytics dashboard

---

## 👨‍💻 Author

Made by Harshvardhan Rajpurohit – Backend Developer • Go / Node.js • GCP • Kubernetes • Clean Architecture

---
