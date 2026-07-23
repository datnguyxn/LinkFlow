# Workspace Invitation API Design

## Overview

This document defines the REST API endpoints for the Workspace Invitation module.

The API enables workspace owners to invite users into a workspace while allowing recipients to view, accept, reject, or validate invitations.

The module supports two invitation methods:

- Invite an existing LinkFlow user
- Invite an external email address

Existing users receive both an email and an in-app notification.

External users receive an email invitation only.

All responses follow the standard API response format used throughout the system.

---

# Authentication

Workspace management endpoints require JWT Authentication.

Invitation validation and acceptance endpoints use an invitation token and do not require authentication unless the recipient already has an account.

---

# API Overview

| Method | Endpoint                                 | Authentication | Description            |
| ------ | ---------------------------------------- | -------------- | ---------------------- |
| POST   | /workspaces/:workspaceId/invitations     | ✅             | Send Invitation        |
| GET    | /workspaces/:workspaceId/invitations     | ✅             | List Invitations       |
| GET    | /workspaces/:workspaceId/invitations/:id | ✅             | Get Invitation Details |
| DELETE | /workspaces/:workspaceId/invitations/:id | ✅             | Revoke Invitation      |
| GET    | /workspace-invitations/:token            | ❌             | Validate Invitation    |
| POST   | /workspace-invitations/:token/accept     | Conditional    | Accept Invitation      |
| POST   | /workspace-invitations/:token/reject     | Conditional    | Reject Invitation      |

---

# Send Invitation

## Description

Creates a new workspace invitation.

The recipient may be an existing LinkFlow user or an external email address.

### Request

```http
POST /workspaces/{workspaceId}/invitations
```

### Request Body

| Field | Required | Description                  |
| ----- | -------- | ---------------------------- |
| email | ✅       | Recipient email              |
| role  | ❌       | Member role (default MEMBER) |

### Business Rules

- Only workspace owners may invite users.
- Only one pending invitation may exist for the same email.
- Existing users receive both email and in-app notifications.
- External users receive email only.

### Success Response

```http
201 Created
```

Returns

- Invitation ID
- Invitation status
- Recipient email
- Expiration time

---

# List Invitations

## Description

Returns all invitations for a workspace.

The requester must belong to the workspace.

### Request

```http
GET /workspaces/{workspaceId}/invitations
```

### Query Parameters

| Parameter | Description       |
| --------- | ----------------- |
| page      | Page number       |
| limit     | Items per page    |
| status    | Invitation status |
| search    | Search by email   |

### Success Response

```http
200 OK
```

Returns

- Invitation list
- Recipient email
- Status
- Expiration date

---

# Get Invitation Details

## Description

Returns detailed information about a workspace invitation.

The requester must belong to the workspace.

### Request

```http
GET /workspaces/{workspaceId}/invitations/{id}
```

### Success Response

```http
200 OK
```

Returns

- Invitation information
- Inviter
- Recipient
- Status
- Created date
- Expiration date

---

# Revoke Invitation

## Description

Cancels a pending invitation.

Only the workspace owner may perform this action.

### Request

```http
DELETE /workspaces/{workspaceId}/invitations/{id}
```

### Business Rules

- Only pending invitations can be revoked.
- Revoked invitations cannot be reused.
- Existing users receive an in-app notification.
- A notification email is sent to the recipient.

### Success Response

```http
204 No Content
```

---

# Validate Invitation

## Description

Validates an invitation token before it is accepted.

### Request

```http
GET /workspace-invitations/{token}
```

### Success Response

```http
200 OK
```

Returns

- Workspace information
- Inviter
- Assigned role
- Invitation status
- Expiration date

---

# Accept Invitation

## Description

Accepts a workspace invitation.

If the recipient does not yet have an account, they must register before accepting.

Accepting the invitation creates a WorkspaceMember record.

### Request

```http
POST /workspace-invitations/{token}/accept
```

### Business Rules

- Invitation must be pending.
- Invitation must not be expired.
- Recipient cannot already be a workspace member.
- Creates a WorkspaceMember record.
- Updates invitation status to ACCEPTED.
- Sends confirmation email.
- Notifies the workspace owner.

### Success Response

```http
200 OK
```

Returns

- Workspace information
- Member role

---

# Reject Invitation

## Description

Rejects a workspace invitation.

### Request

```http
POST /workspace-invitations/{token}/reject
```

### Business Rules

- Invitation must be pending.
- Updates invitation status to REJECTED.
- Sends notification email.
- Notifies the workspace owner.

### Success Response

```http
200 OK
```

---

# Common Error Responses

| Status | Description                       |
| ------ | --------------------------------- |
| 400    | Bad Request                       |
| 401    | Unauthorized                      |
| 403    | Forbidden                         |
| 404    | Workspace or Invitation Not Found |
| 409    | Pending Invitation Already Exists |
| 409    | User Already Member               |
| 410    | Invitation Expired                |
| 410    | Invitation Revoked                |
| 410    | Invitation Already Accepted       |
| 500    | Internal Server Error             |

---

# Permission Matrix

| Feature                 | Member | Owner | Invitee |
| ----------------------- | :----: | :---: | :-----: |
| List Invitations        |   ✅   |  ✅   |   ❌    |
| View Invitation Details |   ✅   |  ✅   |   ❌    |
| Send Invitation         |   ❌   |  ✅   |   ❌    |
| Revoke Invitation       |   ❌   |  ✅   |   ❌    |
| Validate Invitation     |   ❌   |  ❌   |   ✅    |
| Accept Invitation       |   ❌   |  ❌   |   ✅    |
| Reject Invitation       |   ❌   |  ❌   |   ✅    |

---

# Validation Rules

## Email

Requirements

- Required
- Valid email format

---

## Role

Supported values

```text
MEMBER
```

Future versions may support

```text
ADMIN

EDITOR

VIEWER
```

---

## Invitation

Requirements

- Status must be PENDING.
- Token must be valid.
- Invitation must not be expired.

---

# Rate Limiting

To prevent abuse, the following limits should be applied.

| Endpoint            | Recommendation     |
| ------------------- | ------------------ |
| Send Invitation     | 20 requests/minute |
| Accept Invitation   | 10 requests/minute |
| Reject Invitation   | 10 requests/minute |
| Validate Invitation | 60 requests/minute |
| List Invitations    | 60 requests/minute |
| Revoke Invitation   | 20 requests/minute |

---

# API Versioning

Current Version

```text
v1
```

Example

```text
/ api/v1/workspaces/{workspaceId}/invitations
```

Future versions should maintain backward compatibility whenever possible.
