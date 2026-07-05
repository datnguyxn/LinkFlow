# Authentication Module Design

## Overview

LinkFlow supports two authentication methods:

- Email (Username) & Password
- Google OAuth
- GitHub OAuth

The authentication module is designed with the following goals:

- Secure authentication
- JWT-based authorization
- Refresh Token Rotation
- Email Verification
- OAuth Integration
- Role-Based Access Control (RBAC)
- Scalable architecture

---

# Authentication Flow

## Authentication Sequence

![Authentication Sequence](./diagrams/auth.png)

## Email Registration

### Description

Users register using their email and password.

New accounts are created with:

- emailVerified = false
- status = ACTIVE

A verification email will be sent immediately after registration.

Users cannot log in until their email has been verified.

### Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant API as Auth API
    participant DB as Database
    participant Mail as Email Service

    User->>API: POST /auth/register
    API->>API: Validate request
    API->>DB: Check email exists

    alt Email already exists
        DB-->>API: Exists
        API-->>User: 409 Email already exists
    else Email available
        API->>API: Hash password
        API->>DB: Create User(emailVerified=false)
        API->>API: Generate verification token
        API->>DB: Save verification token
        API->>Mail: Send Verification Email
        Mail-->>User: Verification Email
        API-->>User: Registration Successful
    end
```

---

## Email Verification

### Description

The user clicks the verification link sent via email.

If the token is valid:

- emailVerified becomes true
- verification token is removed
- Welcome Email is sent

### Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant API
    participant DB
    participant Mail

    User->>API: GET /auth/verify-email?token=...

    API->>DB: Find verification token

    alt Invalid token
        API-->>User: Invalid or expired token
    else Valid token
        API->>DB: Update emailVerified=true
        API->>DB: Delete verification token
        API->>Mail: Send Welcome Email
        Mail-->>User: Welcome Email
        API-->>User: Email verified
    end
```

---

## Email Login

### Description

Users can log in only after verifying their email.

### Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant API
    participant DB

    User->>API: POST /auth/login

    API->>DB: Find user

    alt User not found
        API-->>User: User not found
    else User found

        alt Email not verified
            API-->>User: Please verify email
        else Verified
            API->>API: Compare password

            alt Invalid password
                API-->>User: Invalid credentials
            else Success
                API->>API: Generate Access Token
                API->>API: Generate Refresh Token
                API->>DB: Save Refresh Token
                API-->>User: Tokens
            end
        end

    end
```

---

# OAuth Authentication

OAuth registration does not require email verification because identity has already been verified by the provider.

A Welcome Email is sent only for newly created users.

---

## Google OAuth

```mermaid
sequenceDiagram
    actor User
    participant Google
    participant API
    participant DB
    participant Mail

    User->>Google: Continue with Google

    Google-->>API: OAuth Callback

    API->>DB: Find OAuth Account

    alt Existing User
        DB-->>API: Found
    else New User
        API->>DB: Create User(emailVerified=true)
        API->>DB: Create OAuth Account
        API->>Mail: Send Welcome Email
        Mail-->>User: Welcome
    end

    API->>API: Generate JWT
    API->>API: Generate Refresh Token
    API->>DB: Save Refresh Token

    API-->>User: Login Success
```

---

## GitHub OAuth

```mermaid
sequenceDiagram
    actor User
    participant Github
    participant API
    participant DB
    participant Mail

    User->>Github: Continue with GitHub

    Github-->>API: OAuth Callback

    API->>DB: Find OAuth Account

    alt Existing User
        DB-->>API: Found
    else New User
        API->>DB: Create User(emailVerified=true)
        API->>DB: Create OAuth Account
        API->>Mail: Send Welcome Email
        Mail-->>User: Welcome
    end

    API->>API: Generate JWT
    API->>API: Generate Refresh Token
    API->>DB: Save Refresh Token

    API-->>User: Login Success
```

---

# Refresh Token

## Description

Refresh Tokens are stored in the database.

Every refresh request rotates the refresh token.

Old refresh tokens are revoked immediately.

```mermaid
sequenceDiagram
    actor User
    participant API
    participant DB

    User->>API: POST /auth/refresh

    API->>DB: Find Refresh Token

    alt Invalid Token
        API-->>User: Unauthorized
    else Valid Token
        API->>API: Generate Access Token
        API->>API: Generate Refresh Token
        API->>DB: Replace Refresh Token
        API-->>User: New Tokens
    end
```

---

# Logout

## Description

Logout revokes the current refresh token.

```mermaid
sequenceDiagram
    actor User
    participant API
    participant DB

    User->>API: POST /auth/logout

    API->>DB: Revoke Refresh Token

    API-->>User: Logout Success
```

---

# JWT Strategy

## Access Token

| Property | Value |
|----------|-------|
| Algorithm | HS256 |
| Expiration | 15 Minutes |
| Storage | Memory |
| Purpose | API Authorization |

### Payload

```json
{
    "sub": "userId",
    "email": "user@email.com",
    "workspaceId": "uuid",
    "role": "OWNER"
}
```

---

## Refresh Token

| Property | Value |
|----------|-------|
| Expiration | 30 Days |
| Storage | HttpOnly Cookie |
| Database | refresh_tokens |
| Rotation | Enabled |

---

# Email Strategy

## Verification Email

Sent when:

- Register via Email

Purpose:

Verify ownership of email address.

---

## Welcome Email

Sent when:

- Email verification succeeds
- Google registration
- GitHub registration

Purpose:

Welcome users to LinkFlow.

---

# RBAC

## Roles

- OWNER
- ADMIN
- MEMBER

---

## OWNER

Permissions

- Manage Workspace
- Invite Members
- Delete Workspace
- Manage Billing
- Manage API Keys

---

## ADMIN

Permissions

- Manage Links
- Manage Tags
- Manage Members
- View Analytics

---

## MEMBER

Permissions

- Create Links
- Edit Own Links
- View Analytics

---

# Security

- Password hashed using bcrypt
- JWT authentication
- Refresh Token Rotation
- Email Verification
- OAuth 2.0
- HttpOnly Refresh Token
- HTTPS Only Cookies
- CSRF Protection
- Rate Limiting
- Audit Logging

---

# Authentication Flow Summary

| Flow | Verify Email | Welcome Email |
|------|--------------|---------------|
| Email Registration | ✅ | ✅ After Verification |
| Google OAuth | ❌ | ✅ |
| GitHub OAuth | ❌ | ✅ |
