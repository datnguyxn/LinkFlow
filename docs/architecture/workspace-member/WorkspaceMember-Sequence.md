# Workspace Member Sequence Design

## Overview

This document describes the interaction flow between clients, backend services, and the database for the Workspace Member module.

The sequence diagrams illustrate how membership requests are processed from start to finish.

---

# Invite Member

## Description

Invites an existing user to join a workspace.

Only the workspace owner can invite new members.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Owner
    participant API
    participant DB

    Owner->>API: POST /workspaces/:workspaceId/members

    API->>DB: Find Workspace

    alt Workspace Not Found

        API-->>Owner: 404 Workspace Not Found

    else Workspace Exists

        API->>DB: Validate Owner Permission

        alt Forbidden

            API-->>Owner: 403 Forbidden

        else Authorized

            API->>DB: Find User

            alt User Not Found

                API-->>Owner: 404 User Not Found

            else User Exists

                API->>DB: Check Membership

                alt Already Member

                    API-->>Owner: 409 Member Already Exists

                else Member Not Found

                    API->>DB: Create Workspace Member

                    DB-->>API: Member Created

                    API-->>Owner: Member Invited

                end

            end

        end

    end
```

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

    User->>API: GET /workspaces/:workspaceId/members/:memberId

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

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Owner
    participant API
    participant DB

    Owner->>API: PATCH /workspaces/:workspaceId/members/:memberId

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

            API-->>Owner: Role Updated

        end

    end
```

---

# Remove Member

## Description

Removes a member from a workspace.

Only the workspace owner can remove members.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Owner
    participant API
    participant DB

    Owner->>API: DELETE /workspaces/:workspaceId/members/:memberId

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

            API-->>Owner: Member Removed

        end

    end
```

---

# Leave Workspace

## Description

Allows a member to leave a workspace.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Member
    participant API
    participant DB

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

            API-->>Member: Left Workspace

        end

    end
```

---

# Sequence Summary

| Feature | Main Components |
|----------|-----------------|
| Invite Member | API → Database |
| List Members | API → Database |
| Get Member Details | API → Database |
| Update Member Role | API → Database |
| Remove Member | API → Database |
| Leave Workspace | API → Database |