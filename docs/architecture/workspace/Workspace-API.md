# Workspace API Design

## Overview

This document defines the REST API endpoints for the Workspace module.

The API allows authenticated users to create and manage workspaces. Each workspace acts as an isolated container for resources such as members, invitations, URLs, tags, API keys, and future modules.

Workspace membership and invitation management are handled by their respective modules.

All responses follow the standard API response format used by the system.

---

# Authentication

All Workspace APIs require JWT Authentication.

---

# API Overview

| Method | Endpoint                 | Authentication | Description           |
| ------ | ------------------------ | -------------- | --------------------- |
| POST   | /workspaces              | ✅             | Create Workspace      |
| GET    | /workspaces              | ✅             | List My Workspaces    |
| GET    | /workspaces/:workspaceId | ✅             | Get Workspace Details |
| PATCH  | /workspaces/:workspaceId | ✅             | Update Workspace      |
| DELETE | /workspaces/:workspaceId | ✅             | Delete Workspace      |

---

# Create Workspace

## Description

Creates a new workspace.

The authenticated user automatically becomes the workspace owner and is added as the first workspace member with the **OWNER** role.

### Request

```http
POST /workspaces
```

### Request Body

| Field   | Required | Description           |
| ------- | -------- | --------------------- |
| name    | ✅       | Workspace name        |
| slug    | ✅       | Unique workspace slug |
| logoUrl | ❌       | Workspace logo        |

### Success Response

```http
201 Created
```

Returns

- Workspace information
- Owner information

Business Rules

- Slug must be unique.
- Reserved slugs are not allowed.
- Workspace creation automatically creates an OWNER membership.
- The workspace owner is also stored in `Workspace.ownerId`.

---

# List My Workspaces

## Description

Returns all workspaces that the authenticated user owns or has joined.

### Request

```http
GET /workspaces
```

### Success Response

```http
200 OK
```

Returns

- Workspace list
- Current user role
- Owner information

---

# Get Workspace Details

## Description

Returns detailed information about a workspace.

The requester must be an active workspace member.

### Request

```http
GET /workspaces/{workspaceId}
```

### Success Response

```http
200 OK
```

Returns

- Workspace information
- Owner information
- Member count
- Created date

---

# Update Workspace

## Description

Updates workspace information.

Only the workspace owner may perform this action.

### Request

```http
PATCH /workspaces/{workspaceId}
```

### Editable Fields

- name
- slug
- logoUrl

### Success Response

```http
200 OK
```

Returns

- Updated workspace information

Business Rules

- Slug must remain unique.
- Reserved slugs cannot be used.

---

# Delete Workspace

## Description

Permanently deletes a workspace.

Only the workspace owner may perform this operation.

### Request

```http
DELETE /workspaces/{workspaceId}
```

### Success Response

```http
204 No Content
```

Business Rules

Deleting a workspace also removes:

- Workspace Members
- Pending Invitations
- URLs
- Tags
- API Keys

Deletion is handled through database cascade rules.

---

# Common Error Responses

| Status | Description                   |
| ------ | ----------------------------- |
| 400    | Bad Request                   |
| 401    | Unauthorized                  |
| 403    | Forbidden                     |
| 404    | Workspace Not Found           |
| 409    | Workspace Slug Already Exists |
| 500    | Internal Server Error         |

---

# Permission Matrix

| Feature            | Member | Owner |
| ------------------ | :----: | :---: |
| List My Workspaces |   ✅   |  ✅   |
| View Workspace     |   ✅   |  ✅   |
| Create Workspace   |   ✅   |  ✅   |
| Update Workspace   |   ❌   |  ✅   |
| Delete Workspace   |   ❌   |  ✅   |

---

# Validation Rules

## Workspace Name

Requirements

- Required
- 3–50 characters
- Trim leading and trailing whitespace

---

## Workspace Slug

Requirements

- Required
- Globally unique
- Lowercase only
- Supports

```
a-z

0-9

-
```

Reserved slugs cannot be used.

Examples

```
admin

api

login

system

root
```

---

# Rate Limiting

To prevent abuse, the following limits are recommended.

| Endpoint         | Recommendation     |
| ---------------- | ------------------ |
| Create Workspace | 10 requests/minute |
| Update Workspace | 20 requests/minute |
| Delete Workspace | 5 requests/minute  |
| List Workspaces  | 60 requests/minute |

---

# API Versioning

Current Version

```
v1
```

Example

```
/api/v1/workspaces
```

Future versions should maintain backward compatibility whenever possible.
