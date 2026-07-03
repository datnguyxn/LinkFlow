# URL Shortener Platform

A production-ready URL Shortener platform inspired by Bitly, built with **Node.js** and modern cloud-native technologies. The project focuses on scalable backend architecture, security, observability, and DevOps best practices.

## Overview

This application allows users to create and manage shortened URLs while providing analytics, security, and high availability. The project is designed as a portfolio demonstrating real-world backend engineering skills rather than a simple CRUD application.

## Core Features

### Authentication & Authorization

* User registration and login
* JWT Authentication
* OAuth2 Login (Google/GitHub)
* Refresh Token
* Role-Based Access Control (RBAC)

### URL Management

* Create shortened URLs
* Custom URL slug
* Automatic slug generation
* URL expiration
* Password-protected URLs
* Bulk URL creation
* URL management dashboard

### Analytics

* Click tracking
* Total clicks
* Unique visitors
* Browser statistics
* Operating system statistics
* Device statistics
* Country and region analytics
* Referrer tracking
* Time-based analytics
* QR Code generation

### Search

* Full-text search using PostgreSQL
* Optional Elasticsearch integration

### Notifications

* Email verification
* Password reset
* URL expiration reminders
* WebSocket notifications

### Administration

* User management
* URL moderation
* Analytics dashboard
* System monitoring

---

# System Architecture

Client

↓

Nginx

↓

Node.js API

↓

Redis Cache

↓

PostgreSQL

↓

RabbitMQ / Kafka

↓

Background Workers

↓

AWS S3 / MinIO

↓

Prometheus + Grafana

↓

Cloud Deployment

---

# Technology Stack

## Frontend

Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query (React Query)
React Hook Form
Zod
Axios
Socket.IO Client
Recharts (Analytics Dashboard)

## Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM

## Database

* PostgreSQL

## Cache

* Redis

## Message Queue

* RabbitMQ

## Authentication

* JWT
* OAuth2
* Passport.js
* RBAC

## Realtime

* WebSocket (Socket.IO)

## File Storage

* AWS S3
* MinIO (local development)

## Search

* PostgreSQL Full-text Search
* Elasticsearch (optional)

## API Documentation

* Swagger / OpenAPI

## Testing

* Jest
* Supertest
* Unit Testing
* Integration Testing

## DevOps

* Docker
* Docker Compose
* GitHub Actions
* Nginx

## Monitoring

* Prometheus
* Grafana
* ELK Stack (Elasticsearch, Logstash, Kibana)

## Cloud

Designed to be deployed on cloud infrastructure such as:

* AWS
* Google Cloud Platform
* Microsoft Azure
* DigitalOcean
* Railway
* Render

Infrastructure can be provisioned using Docker containers and deployed through CI/CD pipelines.

---

# Project Structure

```
LinkFlow/
│
├── apps/
│   │
│   ├── api/                                # Fastify REST API
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── server.ts
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── env.ts
│   │   │   │   ├── database.ts
│   │   │   │   ├── redis.ts
│   │   │   │   ├── jwt.ts
│   │   │   │   ├── mail.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── common/
│   │   │   │   ├── constants/
│   │   │   │   ├── decorators/
│   │   │   │   ├── dto/
│   │   │   │   ├── enums/
│   │   │   │   ├── errors/
│   │   │   │   ├── guards/
│   │   │   │   ├── hooks/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── interfaces/
│   │   │   │   ├── middleware/
│   │   │   │   ├── serializers/
│   │   │   │   ├── validators/
│   │   │   │   └── utils/
│   │   │   │
│   │   │   ├── infrastructure/
│   │   │   │   ├── database/
│   │   │   │   ├── cache/
│   │   │   │   ├── queue/
│   │   │   │   ├── mail/
│   │   │   │   ├── storage/
│   │   │   │   └── monitoring/
│   │   │   │
│   │   │   ├── plugins/
│   │   │   │   ├── cors.ts
│   │   │   │   ├── helmet.ts
│   │   │   │   ├── swagger.ts
│   │   │   │   ├── prisma.ts
│   │   │   │   ├── redis.ts
│   │   │   │   └── auth.ts
│   │   │   │
│   │   │   ├── socket/
│   │   │   │   ├── gateway.ts
│   │   │   │   ├── publisher.ts
│   │   │   │   ├── subscriber.ts
│   │   │   │   ├── manager.ts
│   │   │   │   ├── events.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── events/
│   │   │   │
│   │   │   ├── queues/
│   │   │   │
│   │   │   ├── jobs/
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   │
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── urls/
│   │   │   │   ├── redirects/
│   │   │   │   ├── analytics/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── search/
│   │   │   │   ├── notifications/
│   │   │   │   ├── api-keys/
│   │   │   │   ├── workspaces/
│   │   │   │   ├── admin/
│   │   │   │   └── health/
│   │   │   │
│   │   │   └── types/
│   │   │
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   │
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   ├── vitest.config.ts
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── web/                               # Next.js
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── common/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── url/
│   │   │   │   ├── auth/
│   │   │   │   └── search/
│   │   │   │
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── providers/
│   │   │   ├── layouts/
│   │   │   ├── lib/
│   │   │   ├── utils/
│   │   │   ├── styles/
│   │   │   ├── types/
│   │   │   └── middleware.ts
│   │   │
│   │   ├── public/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── worker/
│   │   ├── src/
│   │   │   ├── jobs/
│   │   │   ├── queues/
│   │   │   ├── consumers/
│   │   │   ├── producers/
│   │   │   └── server.ts
│   │   └── package.json
│   │
│   └── docs/
│       └── Swagger UI
│
├── packages/
│   │
│   ├── config/
│   ├── logger/
│   ├── types/
│   ├── validation/
│   ├── utils/
│   ├── shared/
│   ├── ui/
│   ├── database/
│   ├── eslint-config/
│   └── tsconfig/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── infra/
│   ├── docker/
│   ├── nginx/
│   ├── github-actions/
│   ├── prometheus/
│   ├── grafana/
│   ├── loki/
│   ├── tempo/
│   └── terraform/
│
├── scripts/
│
├── docs/
│   ├── architecture/
│   │   ├── system-design.md
│   │   ├── database.md
│   │   ├── sequence-diagrams/
│   │   ├── deployment.md
│   │   └── event-driven.md
│   │
│   ├── api/
│   ├── database/
│   ├── sprint/
│   └── postman/
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .env.example
├── .gitignore
├── LICENSE
└── README.md

```
---

# Planned Infrastructure

* RESTful API
* Event-driven architecture
* Background job processing
* Redis caching layer
* Cloud object storage
* Containerized deployment
* CI/CD pipeline
* API documentation
* Centralized logging
* Metrics collection
* Distributed monitoring

---

# Non-functional Requirements

* Scalable architecture
* Secure authentication
* High availability
* Horizontal scalability
* Rate limiting
* Caching
* Logging
* Monitoring
* Automated testing
* API versioning
* Cloud-ready deployment

---

# Future Enhancements

* URL preview
* Team workspaces
* Organization support
* Custom domains
* Link scheduling
* A/B testing
* Campaign tracking (UTM)
* Webhook integrations
* Mobile application
* GraphQL API
* Kubernetes deployment
* Multi-region deployment
* CDN integration
* Event sourcing
* Distributed tracing (OpenTelemetry)

---

# Development Roadmap

* Sprint 1 - Auth	
* Sprint 2 - Users	
* Sprint 3 - URLs	
* Sprint 4 - Redirect	
* Sprint 5 - Analytics	
* Sprint 6 - Dashboard	
* Sprint 7 - Search	
* Sprint 8 - Notifications	
* Sprint 9 - API Keys	
* Sprint 10 - Workspace	
* Sprint 11 - Admin	
* Sprint 12 - Cloud Deployment	
* Sprint 13 - Documentation	
* Sprint 14 - Testing & Performance	
* Sprint 15 - Future Features	

---

# License

This project is licensed under the MIT License.
