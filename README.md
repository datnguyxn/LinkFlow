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
│   ├── api/                    # REST API (Express/Fastify + TypeScript)
│   ├── worker/                 # Background jobs (BullMQ/RabbitMQ consumers)
│   ├── web/                    # Frontend (Next.js)
│   └── docs/                   # Swagger UI (optional)
│
├── packages/
│   ├── database/               # Prisma schema & migrations
│   ├── config/                 # Shared configuration
│   ├── logger/                 # Pino/Winston logger
│   ├── types/                  # Shared TypeScript types
│   ├── validation/             # Zod/Joi schemas
│   ├── utils/                  # Shared utilities
│   ├── auth/                   # Shared auth helpers
│   └── ui/                     # Shared React components (if needed)
│
├── infra/
│   ├── docker/
│   ├── nginx/
│   ├── github-actions/
│   ├── prometheus/
│   ├── grafana/
│   ├── loki/
│   └── terraform/              # Cloud Infrastructure (AWS)
│
├── scripts/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   └── sprint/
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json                  # nếu dùng Turborepo
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

* Sprint 1 — Project Setup & Authentication
* Sprint 2 — URL Shortening Core Features
* Sprint 3 — Analytics & QR Code
* Sprint 4 — Background Jobs & Notifications
* Sprint 5 — Search, File Storage & Realtime
* Sprint 6 — Monitoring, Testing & CI/CD
* Sprint 7 — Cloud Deployment & Production Hardening

---

# License

This project is licensed under the MIT License.
