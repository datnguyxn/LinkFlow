# User Module Design

## Overview

The User module is responsible for managing authenticated users' profile information.

Supported features:

- Get current user profile
- Update profile
- Change password
- Upload avatar
- Get avatar
- Delete account

All endpoints require authentication.

---

# User Flow

## User Sequence

```mermaid
flowchart TD

A[Authenticated User]

A --> B[Get Profile]
A --> C[Update Profile]
A --> D[Change Password]
A --> E[Upload Avatar]
A --> F[Get Avatar]
A --> G[Delete Account]

B --> DB[(Database)]

C --> DB

D --> Hash[bcrypt]
Hash --> DB

E --> Validate[Validate Image]
Validate --> Storage[(MinIO)]
Storage --> DB

F --> DB
DB --> Storage

G --> DB
```

---

# Get My Profile

## Description

Returns the authenticated user's profile information.

The response also includes the authentication provider.

Supported providers:

- LOCAL
- GOOGLE

### Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant API
    participant DB
    participant OAuth

    User->>API: GET /users/me

    API->>DB: Find User

    alt User not found
        API-->>User: 404 User Not Found
    else User exists
        API->>OAuth: Find OAuth Provider
        OAuth-->>API: Provider
        API-->>User: User Profile
    end
```

---

# Update Profile

## Description

Updates the authenticated user's profile information.

Editable fields depend on business requirements.

Email and authentication provider cannot be changed.

### Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant API
    participant DB

    User->>API: PATCH /users/me

    API->>DB: Find User

    alt User not found
        API-->>User: User Not Found
    else User exists
        API->>DB: Update User Profile
        DB-->>API: Updated User
        API-->>User: Profile Updated
    end
```

---

# Change Password

## Description

Allows authenticated users to change their password.

Requirements:

- User must exist.
- Current password must be correct.
- New password must be different from the current password.

### Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant API
    participant DB

    User->>API: POST /users/change-password

    API->>DB: Find User

    alt User not found
        API-->>User: User Not Found

    else User exists

        API->>API: Verify Current Password

        alt Incorrect Password
            API-->>User: Old Password Incorrect

        else Same Password
            API-->>User: New Password Must Be Different

        else Valid Password
            API->>API: Hash New Password
            API->>DB: Update Password
            DB-->>API: Updated
            API-->>User: Password Changed Successfully
        end

    end
```

---

# Upload Avatar

## Description

Uploads a new avatar for the authenticated user.

Business rules:

- Validate image format.
- Validate image size.
- Upload image to MinIO.
- Save object key to database.
- Delete previous avatar if it exists.

### Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant API
    participant DB
    participant Storage

    User->>API: POST /users/avatar

    API->>DB: Find User

    alt User not found
        API-->>User: User Not Found

    else User exists

        API->>API: Validate Avatar

        API->>Storage: Upload Avatar
        Storage-->>API: Object Key

        API->>DB: Update Avatar URL

        alt Old Avatar Exists
            API->>Storage: Delete Old Avatar
        end

        API-->>User: Upload Successful

    end
```

---

# Get Avatar

## Description

Returns the authenticated user's avatar.

If no avatar exists, the API returns Not Found.

### Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant API
    participant DB
    participant Storage

    User->>API: GET /users/avatar

    API->>DB: Find User

    alt User not found
        API-->>User: User Not Found

    else Avatar not found
        API-->>User: Avatar Not Found

    else Avatar exists
        API->>Storage: Get File Stream
        Storage-->>API: Stream + Metadata
        API-->>User: Avatar File
    end
```

---

# Delete My Account

## Description

Deletes the authenticated user's account.

Instead of permanently removing the record, the account is soft deleted.

Changes:

- status = DELETED
- deletedAt = Current Timestamp

### Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant API
    participant DB

    User->>API: DELETE /users/me

    API->>DB: Find User

    alt User not found
        API-->>User: User Not Found

    else User exists
        API->>DB: Update Status = DELETED
        DB-->>API: Updated User
        API-->>User: Account Deleted
    end
```

---

# Avatar Storage Strategy

Uploaded avatars are stored in MinIO.

Folder structure:

```
avatars/{userId}/{uuid}.png
```

The database stores only the object key.

When uploading a new avatar:

- Upload new file
- Update database
- Delete previous avatar

---

# User Information

| Field     | Description       |
| --------- | ----------------- |
| id        | User identifier   |
| email     | Email address     |
| fullName  | User display name |
| avatarUrl | Avatar object key |
| status    | ACTIVE / DELETED  |
| provider  | LOCAL / GOOGLE    |
| createdAt | Creation time     |
| updatedAt | Last updated time |

---

# Security

- JWT Authentication Required
- Password hashed using bcrypt
- Avatar validation
- Soft Delete
- MinIO Object Storage

---

# User Flow Summary

| Feature         | Authentication Required |
| --------------- | ----------------------- |
| Get Profile     | ✅                      |
| Update Profile  | ✅                      |
| Change Password | ✅                      |
| Upload Avatar   | ✅                      |
| Get Avatar      | ✅                      |
| Delete Account  | ✅                      |
