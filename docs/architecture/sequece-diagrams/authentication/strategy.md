# Design Authentication Module

Mục tiêu của story:

> _As a developer, I want to design the authentication architecture so that the system is scalable and secure._

---

# 1. LIN-87 Research authentication flow

Research xem hệ thống sẽ login như thế nào.

Ví dụ với LinkFlow:

```
User
   │
   ▼
POST /auth/register
   │
   ▼
Email + Password
   │
   ▼
Hash password (bcrypt)
   │
   ▼
Save User
   │
   ▼
Return Access Token + Refresh Token
```

Đối với Login

```
User
   │
POST /auth/login
   │
Find user
   │
Compare password
   │
Generate JWT
   │
Generate Refresh Token
   │
Return
```

OAuth

```
Google
   │
OAuth callback
   │
Find/Create User
   │
Issue JWT
```

Nội dung cần research

- JWT hay Session?
- OAuth Google
- OAuth Github
- Refresh Token
- Cookie hay LocalStorage
- Password hashing

---

# 2. LIN-88 Design JWT strategy

Đây là phần quan trọng nhất.

Ví dụ

Access Token

```
expires: 15m
algorithm: HS256
secret: JWT_SECRET
```

Payload

```json
{
  "sub": "user_id",
  "email": "abc@gmail.com",
  "workspaceId": "...",
  "role": "OWNER"
}
```

Refresh Token

```
expires: 30d
```

Không lưu password.

Không lưu thông tin nhạy cảm.

---

# 3. LIN-89 Design Refresh Token strategy

Refresh Token lưu ở đâu?

Ví dụ

```
Browser
     │
HttpOnly Cookie
     │
Refresh Token
     │
Database
```

Flow

```
Login

↓

Access Token (15m)

↓

Refresh Token (30d)

↓

Access Token hết hạn

↓

POST /auth/refresh

↓

Check Refresh Token

↓

Generate Access Token mới
```

Trong DB bạn đã có

```
refresh_tokens
```

table này chính là để làm việc đó.

Nên quyết định

- lưu hash refresh token
- revoke token
- rotate refresh token
- logout all devices

---

# 4. LIN-90 Define RBAC roles

RBAC = Role Based Access Control.

Bạn đã có

```
roles
permissions
role_permissions
workspace_members
```

Nên cần định nghĩa.

Ví dụ

OWNER

```
create workspace
delete workspace
invite user
create api key
manage billing
```

ADMIN

```
manage links
manage tags
invite members
```

MEMBER

```
create link
edit own link
view analytics
```

Sau đó map

```
OWNER
    ↓
permissions
```

---

# 5. LIN-91 Authentication Sequence Diagram

- [Authentication](./auth.md)

# Với LinkFlow của bạn mình sẽ thiết kế như sau

```
Authentication

├── Email/Password
├── Google OAuth
├── GitHub OAuth
├── JWT Access Token (15m)
├── Refresh Token (30d)
├── HttpOnly Cookie
├── Refresh Token Rotation
├── bcrypt Password Hash
├── RBAC
│      ├── Owner
│      ├── Admin
│      └── Member
└── Prisma + PostgreSQL
```

## Deliverable của story

Story này thường **không cần code nhiều**, mà cần tạo tài liệu thiết kế để cả team thống nhất trước khi implement:

- ✅ Authentication Flow (đăng ký, đăng nhập, OAuth, logout, refresh)
- ✅ JWT Strategy (payload, thời hạn, secret, thuật toán)
- ✅ Refresh Token Strategy (lưu DB, rotate, revoke)
- ✅ RBAC Design (Role & Permission)
- ✅ Authentication Sequence Diagram (Mermaid hoặc draw.io)

Sau khi hoàn thành các tài liệu trên, team mới bắt đầu code các API như `/auth/register`, `/auth/login`, `/auth/refresh`, middleware JWT và phân quyền.
