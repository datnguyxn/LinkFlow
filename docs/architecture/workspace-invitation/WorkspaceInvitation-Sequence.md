# Workspace Invitation Sequence Design

## Overview

This document describes the interaction flow between clients, backend services, notification services, and the database for the Workspace Invitation module.

The sequence diagrams illustrate how workspace invitations are created, delivered, accepted, rejected, revoked, and validated.

---

# Send Invitation

## Description

Creates a new workspace invitation.

The workspace owner may invite either an existing LinkFlow user or an external email address.

Existing users receive both an email and an in-app notification.

External users receive an email invitation only.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Owner
    participant API
    participant DB
    participant Mail
    participant Notification

    Owner->>API: POST /workspaces/:workspaceId/invitations

    API->>DB: Find Workspace

    alt Workspace Not Found

        API-->>Owner: 404 Workspace Not Found

    else Workspace Exists

        API->>DB: Validate Owner Permission

        alt Forbidden

            API-->>Owner: 403 Forbidden

        else Authorized

            API->>DB: Check Existing Pending Invitation

            alt Invitation Already Exists

                API-->>Owner: 409 Invitation Already Exists

            else Invitation Available

                API->>DB: Find User By Email

                API->>API: Generate Invitation Token

                API->>DB: Create Invitation

                DB-->>API: Invitation Created

                API->>Mail: Send Invitation Email

                alt Existing User

                    API->>Notification: Create In-App Notification

                end

                API-->>Owner: Invitation Sent

            end

        end

    end
```

---

# List Invitations

## Description

Returns all invitations for a workspace.

Only workspace members can view invitations.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: GET /workspaces/:workspaceId/invitations

    API->>DB: Find Workspace

    alt Workspace Not Found

        API-->>User: 404 Workspace Not Found

    else Workspace Exists

        API->>DB: Validate Membership

        alt Forbidden

            API-->>User: 403 Forbidden

        else Authorized

            API->>DB: Query Invitations

            DB-->>API: Invitation List

            API-->>User: Invitations

        end

    end
```

---

# Get Invitation Details

## Description

Returns details of a workspace invitation.

Only workspace members can access invitation details.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: GET /workspaces/:workspaceId/invitations/:invitationId

    API->>DB: Find Invitation

    alt Invitation Not Found

        API-->>User: 404 Invitation Not Found

    else Invitation Exists

        API->>DB: Validate Membership

        alt Forbidden

            API-->>User: 403 Forbidden

        else Authorized

            DB-->>API: Invitation Details

            API-->>User: Invitation Information

        end

    end
```

---

# Accept Invitation

## Description

Accepts a workspace invitation.

The invitation token must be valid and not expired.

A WorkspaceMember record is created after acceptance.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB
    participant Mail
    participant Notification

    User->>API: POST /workspace-invitations/:token/accept

    API->>DB: Find Invitation

    alt Invitation Not Found

        API-->>User: 404 Invitation Not Found

    else Invitation Exists

        API->>API: Validate Status

        API->>API: Validate Expiration

        alt Invalid Invitation

            API-->>User: 410 Invitation Invalid

        else Valid Invitation

            API->>DB: Check Membership

            alt Already Member

                API-->>User: 409 Member Already Exists

            else Not Member

                API->>DB: Create WorkspaceMember

                API->>DB: Update Invitation Status

                DB-->>API: Accepted

                API->>Mail: Send Acceptance Email

                API->>Notification: Notify Workspace Owner

                API-->>User: Invitation Accepted

            end

        end

    end
```

---

# Reject Invitation

## Description

Rejects a workspace invitation.

The invitation is permanently closed.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB
    participant Mail
    participant Notification

    User->>API: POST /workspace-invitations/:token/reject

    API->>DB: Find Invitation

    alt Invitation Not Found

        API-->>User: 404 Invitation Not Found

    else Invitation Exists

        API->>API: Validate Status

        alt Invalid Invitation

            API-->>User: 410 Invitation Invalid

        else Valid Invitation

            API->>DB: Update Status

            DB-->>API: Rejected

            API->>Mail: Send Rejection Email

            API->>Notification: Notify Workspace Owner

            API-->>User: Invitation Rejected

        end

    end
```

---

# Revoke Invitation

## Description

Cancels a pending invitation.

Only the workspace owner may revoke invitations.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Owner
    participant API
    participant DB
    participant Mail
    participant Notification

    Owner->>API: DELETE /workspaces/:workspaceId/invitations/:invitationId

    API->>DB: Find Invitation

    alt Invitation Not Found

        API-->>Owner: 404 Invitation Not Found

    else Invitation Exists

        API->>DB: Validate Owner Permission

        alt Forbidden

            API-->>Owner: 403 Forbidden

        else Authorized

            API->>DB: Update Status

            DB-->>API: Revoked

            API->>Mail: Send Revocation Email

            alt Existing User

                API->>Notification: Notify User

            end

            API-->>Owner: Invitation Revoked

        end

    end
```

---

# Validate Invitation

## Description

Validates an invitation token before it is accepted.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: GET /workspace-invitations/:token

    API->>DB: Find Invitation By Token

    alt Invitation Not Found

        API-->>User: 404 Invitation Not Found

    else Invitation Exists

        API->>API: Validate Status

        API->>API: Validate Expiration

        alt Invalid

            API-->>User: 410 Invitation Invalid

        else Valid

            DB-->>API: Invitation Information

            API-->>User: Invitation Details

        end

    end
```

---

# Sequence Summary

| Feature | Main Components |
|----------|-----------------|
| Send Invitation | API → Database → Mail → Notification |
| List Invitations | API → Database |
| Get Invitation Details | API → Database |
| Accept Invitation | API → Database → Mail → Notification |
| Reject Invitation | API → Database → Mail → Notification |
| Revoke Invitation | API → Database → Mail → Notification |
| Validate Invitation | API → Database |
