# Workspace Member API Design

## Overview

This document defines the REST API endpoints for the Workspace Member module.

The API allows authenticated workspace members to view membership information while allowing workspace owners to manage member roles and remove members.

Invitation management is handled by the Workspace Invitation module.

All responses follow the standard API response format used by the system.

---

# Authentication

All Workspace Member APIs require JWT Authentication.

---

# API Overview

| Method | Endpoint                                 | Authentication | Description        |
| ------ | ---------------------------------------- | -------------- | ------------------ |
| GET    | /workspaces/:workspaceId/members         | ✅             | List Members       |
| GET    | /workspaces/:workspaceId/members/:userId | ✅             | Get Member Details |
| PATCH  | /workspaces/:workspaceId/members/:userId | ✅             | Update Member Role |
| DELETE | /workspaces/:workspaceId/members/:userId | ✅             | Remove Member      |
| DELETE | /workspaces/:workspaceId/leave           | ✅             | Leave Workspace    |

---

# List Members

## Description

Returns all active members in the workspace.

The requester must belong to the workspace.

### Request

```http
GET /workspaces/{workspaceId}/members
```

### Query Parameters

| Parameter | Description             |
| --------- | ----------------------- |
| page      | Page number             |
| limit     | Items per page          |
| search    | Search by name or email |
| role      | Filter by member role   |

### Success Response

```http
200 OK
```

Returns

- Member list
- User information
- Member roles
- Joined date

---

# Get Member Details

## Description

Returns detailed information about a workspace member.

The requester must belong to the workspace.

### Request

```http
GET /workspaces/{workspaceId}/members/{userId}
```

### Success Response

```http
200 OK
```

Returns

- User information
- Member role
- Joined date

---

# Update Member Role

## Description

Updates the role of a workspace member.

Only the workspace owner may perform this action.

### Request

```http
PATCH /workspaces/{workspaceId}/members/{userId}
```

### Request Body

| Field | Required | Description     |
| ----- | -------- | --------------- |
| role  | ✅       | New member role |

Supported roles

```
OWNER

MEMBER
```

### Success Response

```http
200 OK
```

Returns

- Updated member information

Business Rules

- Member must exist.
- Target member must belong to the workspace.
- The new role must be valid.
- Ownership transfer must follow system rules.

---

# Remove Member

## Description

Removes an active member from the workspace.

Only the workspace owner may perform this action.

### Request

```http
DELETE /workspaces/{workspaceId}/members/{userId}
```

### Success Response

```http
204 No Content
```

Business Rules

- Member must exist.
- Workspace owner cannot remove themselves.
- The workspace must always have one owner.

---

# Leave Workspace

## Description

Allows the authenticated member to leave the workspace.

### Request

```http
DELETE /workspaces/{workspaceId}/leave
```

### Success Response

```http
204 No Content
```

Business Rules

- Only active members may leave.
- Workspace owners must transfer ownership before leaving.

---

# Common Error Responses

| Status | Description                   |
| ------ | ----------------------------- |
| 400    | Bad Request                   |
| 401    | Unauthorized                  |
| 403    | Forbidden                     |
| 404    | Workspace or Member Not Found |
| 409    | Ownership Transfer Required   |
| 500    | Internal Server Error         |

---

# Permission Matrix

| Feature             | Member | Owner |
| ------------------- | :----: | :---: |
| List Members        |   ✅   |  ✅   |
| View Member Details |   ✅   |  ✅   |
| Update Member Role  |   ❌   |  ✅   |
| Remove Member       |   ❌   |  ✅   |
| Leave Workspace     |   ✅   |  ❌*  |

\* The workspace owner must transfer ownership before leaving.

---

# Validation Rules

## Workspace

Requirements

- Workspace must exist.
- Requester must be an active member.

---

## Member

Requirements

- Member must exist.
- Member must belong to the specified workspace.

---

## Role

Supported values

```
OWNER

MEMBER
```

---

# Rate Limiting

To prevent abuse, the following limits should be applied.

| Endpoint           | Recommendation     |
| ------------------ | ------------------ |
| List Members       | 60 requests/minute |
| Update Member Role | 20 requests/minute |
| Remove Member      | 10 requests/minute |
| Leave Workspace    | 10 requests/minute |

---

# API Versioning

Current Version

```
v1
```

Example

```
/api/v1/workspaces/{workspaceId}/members
```

Future versions should maintain backward compatibility whenever possible.
