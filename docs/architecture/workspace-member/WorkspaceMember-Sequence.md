# Workspace Member Sequence Design

## Overview

This document describes the interaction flow between clients, backend services, the database, and the mail service for the Workspace Member module.

The sequence diagrams illustrate how membership requests are processed from start to finish.

---

# List Members

## Description

Returns all members in a workspace.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: GET /workspaces/:workspaceId/members

    API->>DB: Find Workspace

    alt Workspace Not Found

        API-->>User: 404 Workspace Not Found

    else Workspace Exists

        API->>DB: Validate Membership

        alt Forbidden

            API-->>User: 403 Forbidden

        else Authorized

            API->>DB: Query Members

            DB-->>API: Member List

            API-->>User: Members

        end

    end
```

---

# Get Member Details

## Description

Returns detailed information about a workspace member.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: GET /workspaces/:workspaceId/members/:userId

    API->>DB: Find Workspace Member

    alt Member Not Found

        API-->>User: 404 Member Not Found

    else Member Exists

        API->>DB: Validate Membership

        alt Forbidden

            API-->>User: 403 Forbidden

        else Authorized

            DB-->>API: Member Information

            API-->>User: Member Details

        end

    end
```

---

# Update Member Role

## Description

Updates a member's role.

Only the workspace owner can update member roles.

The member is notified via email after the role has been updated.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Owner
    participant API
    participant DB
    participant Mail

    Owner->>API: PATCH /workspaces/:workspaceId/members/:userId

    API->>DB: Find Workspace Member

    alt Member Not Found

        API-->>Owner: 404 Member Not Found

    else Member Exists

        API->>DB: Validate Owner Permission

        alt Forbidden

            API-->>Owner: 403 Forbidden

        else Authorized

            API->>API: Validate Role

            API->>DB: Update Member Role

            DB-->>API: Member Updated

            API->>Mail: Send Role Updated Email

            Mail-->>API: Email Sent

            API-->>Owner: Role Updated

        end

    end
```

---

# Remove Member

## Description

Removes a member from a workspace.

Only the workspace owner can remove members.

The removed member receives a notification email.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Owner
    participant API
    participant DB
    participant Mail

    Owner->>API: DELETE /workspaces/:workspaceId/members/:userId

    API->>DB: Find Workspace Member

    alt Member Not Found

        API-->>Owner: 404 Member Not Found

    else Member Exists

        API->>DB: Validate Owner Permission

        alt Forbidden

            API-->>Owner: 403 Forbidden

        else Authorized

            API->>DB: Delete Membership

            DB-->>API: Deleted

            API->>Mail: Send Removal Email

            Mail-->>API: Email Sent

            API-->>Owner: Member Removed

        end

    end
```

---

# Leave Workspace

## Description

Allows a member to leave a workspace.

The workspace owner is notified by email after the member leaves.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Member
    participant API
    participant DB
    participant Mail

    Member->>API: DELETE /workspaces/:workspaceId/leave

    API->>DB: Find Membership

    alt Membership Not Found

        API-->>Member: 404 Membership Not Found

    else Membership Exists

        API->>API: Check Owner

        alt Is Workspace Owner

            API-->>Member: 409 Ownership Transfer Required

        else Not Owner

            API->>DB: Delete Membership

            DB-->>API: Deleted

            API->>Mail: Notify Workspace Owner

            Mail-->>API: Email Sent

            API-->>Member: Left Workspace

        end

    end
```

---

# Transfer Workspace Ownership
## Description

Transfers workspace ownership from the current workspace owner to another existing workspace member.

Only the current workspace owner can transfer ownership.

After the transfer:

The current owner becomes a MEMBER.
The selected member becomes the new OWNER.
The workspace always has exactly one owner.
Both users receive email notifications.
### Sequence Diagram

```mermaid
sequenceDiagram
    actor CurrentOwner
    participant API
    participant DB
    participant RabbitMQ
    participant EmailWorker
    participant NotificationWorker

    CurrentOwner->>API: PATCH /workspaces/:workspaceId/ownership

    API->>DB: Find Workspace

    alt Workspace Not Found
        API-->>CurrentOwner: 404 Workspace Not Found
    else Workspace Exists

        API->>DB: Validate Current Owner

        alt Forbidden
            API-->>CurrentOwner: 403 Forbidden
        else Authorized

            API->>DB: Find Target Workspace Member

            alt Member Not Found
                API-->>CurrentOwner: 404 Member Not Found
            else Member Exists

                API->>API: Validate Target Member

                alt Target Is Current Owner
                    API-->>CurrentOwner: 400 Cannot Transfer Ownership to Yourself
                else Valid Target

                    API->>DB: Begin Transaction

                    API->>DB: Update Current Owner Role to MEMBER
                    API->>DB: Update Target Member Role to OWNER
                    API->>DB: Update Workspace Owner

                    DB-->>API: Ownership Transfer Completed

                    API->>RabbitMQ: Publish OwnershipTransferred Event

                    API-->>CurrentOwner: Ownership Transferred

                    RabbitMQ->>EmailWorker: OwnershipTransferred Event
                    EmailWorker->>EmailWorker: Send Email to New Owner
                    EmailWorker->>EmailWorker: Send Email to Previous Owner

                    RabbitMQ->>NotificationWorker: OwnershipTransferred Event
                    NotificationWorker->>DB: Create Notifications
                    NotificationWorker->>Redis: Publish Realtime Notifications

                end
            end
        end
    end
```
---

# Sequence Summary

| Feature | Main Components |
|----------|-----------------|
| List Members | API → Database |
| Get Member Details | API → Database |
| Update Member Role | API → Database → Mail |
| Remove Member | API → Database → Mail |
| Leave Workspace | API → Database → Mail |
| Transfer Workspace Ownership | API → Database → Mail → Notification|
