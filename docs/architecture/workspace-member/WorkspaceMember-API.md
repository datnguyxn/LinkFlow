# Workspace Member API Design

## Overview

This document defines the REST API endpoints for the Workspace Member module.

The API allows workspace owners to manage members while allowing authenticated members to view workspace membership and leave a workspace.

All responses follow the standard API response format used by the system.

---

# Authentication

All Workspace Member APIs require JWT Authentication.

---

# API Overview

| Method | Endpoint | Authentication | Description |
|---------|----------|----------------|-------------|
| POST | /workspaces/:workspaceId/members | ✅ | Invite Member |
| GET | /workspaces/:workspaceId/members | ✅ | List Members |
| GET | /workspaces/:workspaceId/members/:userId | ✅ | Get Member Details |
| PATCH | /workspaces/:workspaceId/members/:userId | ✅ | Update Member Role |
| DELETE | /workspaces/:workspaceId/members/:userId | ✅ | Remove Member |
| DELETE | /workspaces/:workspaceId/leave | ✅ | Leave Workspace |

---

# Invite Member

## Description

Adds an existing user to the workspace.

Only the workspace owner may invite members.

### Request

```http
POST /workspaces/{workspaceId}/members
```

### Request Body

| Field | Required | Description |
|---------|----------|-------------|
| userId | ✅ | User to invite |
| role | ❌ | Member role (default MEMBER) |

### Success Response

```http
201 Created
```

Returns

- Membership ID
- User information
- Assigned role

---

# List Members

## Description

Returns all members in the workspace.

The requester must belong to the workspace.

### Request

```http
GET /workspaces/{workspaceId}/members
```

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| page | Page number |
| limit | Items per page |
| search | Search by user name or email |
| role | Filter by role |

### Success Response

```http
200 OK
```

Returns

- Member list
- User information
- Member roles

---

# Get Member Details

## Description

Returns information about a workspace member.

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

Updates a member's role.

Only the workspace owner may perform this action.

### Request

```http
PATCH /workspaces/{workspaceId}/members/{userId}
```

### Editable Fields

- role

### Success Response

```http
200 OK
```

Returns

- Updated member

---

# Remove Member

## Description

Removes a member from the workspace.

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

- Owner cannot remove themselves.
- Workspace must always have one owner.

---

# Leave Workspace

## Description

Allows the authenticated member to leave a workspace.

### Request

```http
DELETE /workspaces/{workspaceId}/leave
```

### Success Response

```http
204 No Content
```

Business Rules

- Members may leave at any time.
- Workspace owners must transfer ownership before leaving.

---

# Common Error Responses

| Status | Description |
|---------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Workspace or Member Not Found |
| 409 | Member Already Exists |
| 409 | Ownership Transfer Required |
| 500 | Internal Server Error |

---

# Permission Matrix

| Feature | Member | Owner |
|----------|:------:|:-----:|
| List Members | ✅ | ✅ |
| View Member Details | ✅ | ✅ |
| Invite Member | ❌ | ✅ |
| Update Member Role | ❌ | ✅ |
| Remove Member | ❌ | ✅ |
| Leave Workspace | ✅ | ❌* |

\* The workspace owner must transfer ownership before leaving the workspace.

---

# Validation Rules

## User

Requirements

- User must exist.
- User must not already belong to the workspace.

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

| Endpoint | Recommendation |
|----------|----------------|
| Invite Member | 20 requests/minute |
| List Members | 60 requests/minute |
| Update Member Role | 20 requests/minute |
| Remove Member | 10 requests/minute |
| Leave Workspace | 10 requests/minute |

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