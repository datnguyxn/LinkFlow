# Workspace Sequence Design

## Overview

This document describes the interaction flow between clients, backend services, email services, notification services, and the database for the Workspace module.

The sequence diagrams illustrate how workspace requests are processed throughout the workspace lifecycle.

---

# Create Workspace

## Description

Creates a new workspace for the authenticated user.

The creator automatically becomes the workspace owner and the first active workspace member.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: POST /workspaces

    API->>API: Validate Request

    API->>DB: Check Workspace Slug

    alt Slug Already Exists

        API-->>User: 409 Workspace Slug Already Exists

    else Slug Available

        API->>DB: Create Workspace

        API->>DB: Create Workspace Member (OWNER)

        DB-->>API: Workspace Created

        API-->>User: Workspace Created

    end
```

---

# List My Workspaces

## Description

Returns all workspaces where the authenticated user is an active member.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: GET /workspaces

    API->>DB: Query User Memberships

    DB-->>API: Workspace List

    API-->>User: Workspaces
```

---

# Get Workspace Details

## Description

Returns detailed information about a workspace.

Only active workspace members can access workspace details.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: GET /workspaces/:workspaceId

    API->>DB: Find Workspace

    alt Workspace Not Found

        API-->>User: 404 Workspace Not Found

    else Workspace Exists

        API->>DB: Validate Membership

        alt Not Workspace Member

            API-->>User: 403 Forbidden

        else Authorized

            API->>DB: Load Workspace Details

            DB-->>API: Workspace Information

            API-->>User: Workspace Details

        end

    end
```

---

# Update Workspace

## Description

Updates workspace information.

Only the workspace owner can update workspace settings.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Owner
    participant API
    participant DB

    Owner->>API: PATCH /workspaces/:workspaceId

    API->>DB: Find Workspace

    alt Workspace Not Found

        API-->>Owner: 404 Workspace Not Found

    else Workspace Exists

        API->>DB: Validate Owner Permission

        alt Forbidden

            API-->>Owner: 403 Forbidden

        else Authorized

            API->>API: Validate Request

            API->>DB: Check Workspace Slug

            alt Slug Already Exists

                API-->>Owner: 409 Workspace Slug Already Exists

            else Slug Available

                API->>DB: Update Workspace

                DB-->>API: Workspace Updated

                API-->>Owner: Workspace Updated

            end

        end

    end
```

---

# Delete Workspace

## Description

Deletes a workspace and all associated resources.

Only the workspace owner can perform this operation.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Owner
    participant API
    participant DB

    Owner->>API: DELETE /workspaces/:workspaceId

    API->>DB: Find Workspace

    alt Workspace Not Found

        API-->>Owner: 404 Workspace Not Found

    else Workspace Exists

        API->>DB: Validate Owner Permission

        alt Forbidden

            API-->>Owner: 403 Forbidden

        else Authorized

            API->>DB: Delete Workspace

            Note over DB: Cascade deletes Members,\nInvitations, URLs,\nTags, API Keys and related resources

            DB-->>API: Workspace Deleted

            API-->>Owner: 204 No Content

        end

    end
```

---

# Workspace Initialization

## Description

Initializes a newly created workspace.

### Sequence Diagram

```mermaid
sequenceDiagram

    participant API
    participant DB

    API->>DB: Create Workspace

    DB-->>API: Workspace ID

    API->>DB: Create OWNER Membership

    DB-->>API: Membership Created

    API-->>API: Workspace Ready
```

---

# Workspace Authorization

## Description

Validates whether the authenticated user can access workspace resources.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: Workspace Request

    API->>DB: Find Active Membership

    alt Membership Not Found

        API-->>User: 403 Forbidden

    else Membership Exists

        DB-->>API: Member Role

        API-->>User: Continue Request

    end
```

---

# Workspace Ownership Validation

## Description

Validates whether the authenticated user is the workspace owner before executing administrative operations.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Owner
    participant API
    participant DB

    Owner->>API: Owner Action

    API->>DB: Find Workspace

    alt Workspace Not Found

        API-->>Owner: 404 Workspace Not Found

    else Workspace Exists

        API->>DB: Compare ownerId

        alt Not Owner

            API-->>Owner: 403 Forbidden

        else Owner Verified

            API-->>Owner: Continue Request

        end

    end
```

---

# Sequence Summary

| Feature | Main Components |
|----------|-----------------|
| Create Workspace | API → Database |
| List My Workspaces | API → Database |
| Get Workspace Details | API → Database |
| Update Workspace | API → Database |
| Delete Workspace | API → Database |
| Workspace Initialization | API → Database |
| Workspace Authorization | API → Database |
| Workspace Ownership Validation | API → Database |