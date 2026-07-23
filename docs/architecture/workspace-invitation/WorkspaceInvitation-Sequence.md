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
    participant RabbitMQ
    participant EmailWorker
    participant NotificationWorker
    participant Redis
    participant WebSocket
    actor Invitee

    Owner->>API: POST /workspaces/:workspaceId/invitations

    API->>DB: Find Workspace

    alt Workspace Not Found

        API-->>Owner: 404 Workspace Not Found

    else Workspace Exists

        API->>DB: Validate Permission: workspace.invite

        alt Forbidden

            API-->>Owner: 403 Forbidden

        else Authorized

            API->>DB: Find User By Email

            alt User Already Active Member

                API-->>Owner: 409 User Already Member

            else User Not Member

                API->>DB: Check Existing Pending Invitation

                alt Invitation Already Exists

                    API-->>Owner: 409 Invitation Already Exists

                else Invitation Available

                    API->>DB: Find Role

                    alt Role Not Found

                        API-->>Owner: 404 Role Not Found

                    else Role Exists

                        API->>API: Generate Invitation Token

                        API->>DB: Create Invitation

                        DB-->>API: Invitation Created

                        API->>RabbitMQ: Publish InvitationCreated Event

                        API-->>Owner: 201 Invitation Created

                        RabbitMQ->>EmailWorker: Consume InvitationCreated Event

                        EmailWorker->>EmailWorker: Build Invitation URL

                        EmailWorker->>EmailWorker: Send Invitation Email

                        alt Existing User

                            RabbitMQ->>NotificationWorker: Consume InvitationCreated Event

                            NotificationWorker->>DB: Create Notification

                            DB-->>NotificationWorker: Notification Created

                            NotificationWorker->>Redis: Publish NotificationCreated

                            Redis->>WebSocket: NotificationCreated

                            WebSocket->>Invitee: Push Realtime Notification

                        end

                    end

                end

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
    participant RabbitMQ
    participant EmailWorker
    participant NotificationWorker
    participant Redis

    User->>API: GET /workspaces/:workspaceId/invitations/accept?token=

    API->>DB: Find Invitation By Token

    alt Invitation Not Found

        API-->>User: 404 Invitation Not Found

    else Invitation Exists

        API->>API: Validate Invitation Status

        alt Invitation Not Pending

            API-->>User: 410 Invitation Invalid

        else Pending

            API->>API: Validate Expiration

            alt Invitation Expired

                API-->>User: 410 Invitation Expired

            else Valid

                API->>API: Validate Authenticated User

                alt User Does Not Match Invitation

                    API-->>User: 403 Forbidden

                else Authorized

                    API->>DB: Check Existing Workspace Membership

                    alt Already Member

                        API-->>User: 409 Member Already Exists

                    else Not Member

                        API->>DB: Begin Transaction

                        API->>DB: Create WorkspaceMember

                        API->>DB: Update Invitation Status to ACCEPTED

                        DB-->>API: Transaction Committed

                        API->>RabbitMQ: Publish InvitationAccepted Event

                        API-->>User: Invitation Accepted

                        RabbitMQ->>EmailWorker: InvitationAccepted Event
                        EmailWorker->>EmailWorker: Send Acceptance Email

                        RabbitMQ->>NotificationWorker: InvitationAccepted Event
                        NotificationWorker->>DB: Create Notification for Workspace Owner
                        NotificationWorker->>Redis: Publish Realtime Notification

                    end

                end

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
    participant RabbitMQ
    participant EmailWorker
    participant NotificationWorker
    participant Redis

    User->>API: POST /workspace-invitations/:token/reject

    API->>DB: Find Invitation By Token

    alt Invitation Not Found

        API-->>User: 404 Invitation Not Found

    else Invitation Exists

        API->>API: Validate Invitation Status

        alt Invitation Not Pending

            API-->>User: 410 Invitation Invalid

        else Pending

            API->>API: Validate Expiration

            alt Invitation Expired

                API-->>User: 410 Invitation Expired

            else Valid

                API->>API: Validate Authenticated User

                alt User Does Not Match Invitation

                    API-->>User: 403 Forbidden

                else Authorized

                    API->>DB: Update Invitation Status to REJECTED

                    DB-->>API: Invitation Rejected

                    API->>RabbitMQ: Publish InvitationRejected Event

                    API-->>User: Invitation Rejected

                    RabbitMQ->>EmailWorker: InvitationRejected Event
                    EmailWorker->>EmailWorker: Send Rejection Email

                    RabbitMQ->>NotificationWorker: InvitationRejected Event
                    NotificationWorker->>DB: Create Notification for Workspace Owner
                    NotificationWorker->>Redis: Publish Realtime Notification

                end

            end

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
    participant RabbitMQ
    participant EmailWorker
    participant NotificationWorker
    participant Redis

    Owner->>API: DELETE /workspaces/:workspaceId/invitations/:invitationId

    API->>DB: Find Invitation

    alt Invitation Not Found

        API-->>Owner: 404 Invitation Not Found

    else Invitation Exists

        API->>DB: Validate Invitation Belongs to Workspace

        alt Workspace Mismatch

            API-->>Owner: 404 Invitation Not Found

        else Valid Workspace

            API->>DB: Validate Revoke Permission

            alt Forbidden

                API-->>Owner: 403 Forbidden

            else Authorized

                API->>API: Validate Invitation Status

                alt Invitation Not Pending

                    API-->>Owner: 409 Invitation Cannot Be Revoked

                else Pending

                    API->>DB: Update Invitation Status to REVOKED

                    DB-->>API: Invitation Revoked

                    API->>RabbitMQ: Publish InvitationRevoked Event

                    API-->>Owner: Invitation Revoked

                    RabbitMQ->>EmailWorker: InvitationRevoked Event
                    EmailWorker->>EmailWorker: Send Revocation Email

                    alt Existing Invitee

                        RabbitMQ->>NotificationWorker: InvitationRevoked Event
                        NotificationWorker->>DB: Create Notification for Invitee
                        NotificationWorker->>Redis: Publish Realtime Notification

                    end

                end

            end

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

    User->>API: GET /workspaces/:id/invitations/validate?token=

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
