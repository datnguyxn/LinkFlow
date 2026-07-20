# Workspace Member Sequence Design

## Overview

This document describes the interaction flow between clients, backend services, the database, and the mail service for the Workspace Member module.

The sequence diagrams illustrate how membership requests are processed from start to finish.

---

# Invite Member

## Description

Invites an existing user to join a workspace.

Only the workspace owner can invite new members.

The invited user receives an invitation email and becomes a workspace member only after accepting the invitation.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Owner
    participant API
    participant DB
    participant Mail

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

                else Not Member

                    API->>DB: Create Invitation

                    DB-->>API: Invitation Created

                    API->>Mail: Send Invitation Email

                    Mail-->>API: Email Sent

                    API-->>Owner: Invitation Sent

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

# Accept Invitation

## Description

Accepts a workspace invitation.

The invitation is validated before creating the workspace membership.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: POST /workspace-invitations/:token/accept

    API->>DB: Find Invitation

    alt Invitation Not Found

        API-->>User: 404 Invitation Not Found

    else Invitation Exists

        API->>API: Validate Invitation

        alt Invitation Expired

            API-->>User: 410 Invitation Expired

        else Invitation Valid

            API->>DB: Create Workspace Member

            API->>DB: Mark Invitation Accepted

            DB-->>API: Membership Created

            API-->>User: Joined Workspace

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

# Sequence Summary

| Feature | Main Components |
|----------|-----------------|
| Invite Member | API → Database → Mail |
| List Members | API → Database |
| Accept Invitation | API → Database |
| Get Member Details | API → Database |
| Update Member Role | API → Database → Mail |
| Remove Member | API → Database → Mail |
| Leave Workspace | API → Database → Mail |