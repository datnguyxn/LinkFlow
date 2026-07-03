# LinkFlow Backend

Backend service for LinkFlow built with **Node.js**, **Express.js**, **TypeScript**, and **PostgreSQL**.

---

## 🚀 Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Redis
- RabbitMQ
- MinIO
- Docker & Docker Compose
- ESLint
- Prettier

---

## 📁 Project Structure

```text
api/                                # Fastify REST API
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── jwt.ts
│   │   ├── mail.ts
│   │   └── index.ts
│   │
│   ├── common/
│   │   ├── constants/
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── enums/
│   │   ├── errors/
│   │   ├── guards/
│   │   ├── hooks/
│   │   ├── interceptors/
│   │   ├── interfaces/
│   │   ├── middleware/
│   │   ├── serializers/
│   │   ├── validators/
│   │   └── utils/
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── cache/
│   │   ├── queue/
│   │   ├── mail/
│   │   ├── storage/
│   │   └── monitoring/
│   │
│   ├── plugins/
│   │   ├── cors.ts
│   │   ├── helmet.ts
│   │   ├── swagger.ts
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── auth.ts
│   │
│   ├── socket/
│   │   ├── gateway.ts
│   │   ├── publisher.ts
│   │   ├── subscriber.ts
│   │   ├── manager.ts
│   │   ├── events.ts
│   │   └── index.ts
│   │
│   ├── events/
│   │
│   ├── queues/
│   │
│   ├── jobs/
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   ├── users/
│   │   ├── urls/
│   │   ├── redirects/
│   │   ├── analytics/
│   │   ├── dashboard/
│   │   ├── search/
│   │   ├── notifications/
│   │   ├── api-keys/
│   │   ├── workspaces/
│   │   ├── admin/
│   │   └── health/
│   │
│   └── types/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── tsconfig.json
├── eslint.config.ts
├── package.json
├── .env.example
└── Dockerfile

```

---

## 📦 Prerequisites

Before getting started, ensure you have installed:

- Node.js >= 20
- pnpm
- Docker Desktop

---

## ⚙️ Installation

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
pnpm install
```

Copy environment variables

```bash
cp .env.example .env
```

---

## 🐳 Start Infrastructure

Start PostgreSQL, Redis, RabbitMQ, and MinIO

```bash
docker compose up -d
```

Or using the helper script

```bash
./server.sh
```

Verify containers

```bash
docker compose ps
```

---

## ▶️ Run Development Server

```bash
pnpm dev
```

Production

```bash
pnpm build
pnpm start
```

---

## 🛠 Available Scripts

```bash
pnpm dev          # Start development server

pnpm build        # Build project

pnpm start        # Start production server

pnpm lint         # Run ESLint

pnpm format       # Format source code

pnpm test         # Run tests
```

---

## 🔑 Environment Variables

Example

```env
PORT=3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/linkflow

REDIS_URL=redis://localhost:6379

RABBITMQ_URL=amqp://guest:guest@localhost:5672

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password123
MINIO_BUCKET=linkflow
```

---

## 🗄 Services

| Service | Port | Description |
|----------|------|-------------|
| PostgreSQL | 5432 | Main database |
| Redis | 6379 | Cache & Session |
| RabbitMQ | 5672 | Message Queue |
| RabbitMQ Management | 15672 | Management UI |
| MinIO API | 9000 | Object Storage API |
| MinIO Console | 9001 | Web Console |

---

## 🔗 Service Credentials

### PostgreSQL

```
Host: localhost
Port: 5432
Database: linkflow
Username: postgres
Password: postgres
```

### Redis

```
Host: localhost
Port: 6379
```

### RabbitMQ

Management UI

```
http://localhost:15672
```

Default credentials

```
Username: admin
Password: password123
```

### MinIO

Console

```
http://localhost:9001
```

Credentials

```
Username: admin
Password: password123
```

---

## 📌 API Base URL

```
http://localhost:3000/api/v1
```

Example

```
GET /api/v1/health
```

---

## 🧹 Stop Services

```bash
docker compose down
```

Remove volumes

```bash
docker compose down -v
```

---

## 📄 License

MIT