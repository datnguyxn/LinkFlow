# URL Management API Design

## Overview

This document defines the REST API endpoints for the URL Management module.

The API enables workspace members to create, manage, organize, and monitor shortened URLs. All management endpoints require authentication and workspace permissions, while URL redirection is publicly accessible.

All responses follow the standard API response format used throughout the system.

---

# Authentication

Management APIs require JWT Authentication.

The public redirect endpoint does not require authentication.

---

# API Overview

| Method | Endpoint | Authentication | Description |
|---------|----------|----------------|-------------|
| POST | /workspaces/:workspaceId/urls | ✅ | Create Short URL |
| GET | /workspaces/:workspaceId/urls | ✅ | List URLs |
| GET | /workspaces/:workspaceId/urls/:urlId | ✅ | Get URL Details |
| PATCH | /workspaces/:workspaceId/urls/:urlId | ✅ | Update URL |
| DELETE | /workspaces/:workspaceId/urls/:urlId | ✅ | Delete URL |
| GET | /:shortCode | ❌ | Redirect URL |
| POST | /workspaces/:workspaceId/urls/:urlId/qrcode | ✅ | Generate QR Code |
| GET | /workspaces/:workspaceId/urls/:urlId/analytics | ✅ | View Analytics |

---

# Create Short URL

## Description

Creates a new shortened URL inside a workspace.

The requester must have permission to create URLs.

### Request

```http
POST /workspaces/{workspaceId}/urls
```

### Request Body

| Field | Required | Description |
|---------|----------|-------------|
| originalUrl | ✅ | Destination URL |
| shortCode | ❌ | Custom short code |
| title | ❌ | URL title |
| description | ❌ | URL description |
| expiresAt | ❌ | Expiration date |
| maxClicks | ❌ | Maximum click limit |
| password | ❌ | Password protection |
| tags | ❌ | Tag IDs |

### Success Response

```http
201 Created
```

Returns

- URL information
- Short URL
- QR Code availability

---

# List URLs

## Description

Returns all URLs in the workspace.

### Request

```http
GET /workspaces/{workspaceId}/urls
```

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| page | Page number |
| limit | Items per page |
| search | Search title or short code |
| tag | Filter by tag |
| status | Filter by status |

### Success Response

```http
200 OK
```

Returns

- URL list
- Pagination
- Basic statistics

---

# Get URL Details

## Description

Returns detailed information about a URL.

### Request

```http
GET /workspaces/{workspaceId}/urls/{urlId}
```

### Success Response

```http
200 OK
```

Returns

- URL information
- QR Code
- Statistics summary
- Tags

---

# Update URL

## Description

Updates URL information.

### Request

```http
PATCH /workspaces/{workspaceId}/urls/{urlId}
```

### Editable Fields

- title
- description
- originalUrl
- expiresAt
- maxClicks
- password
- status
- tags

### Success Response

```http
200 OK
```

Returns

- Updated URL

---

# Delete URL

## Description

Deletes a shortened URL.

### Request

```http
DELETE /workspaces/{workspaceId}/urls/{urlId}
```

### Success Response

```http
204 No Content
```

Business Rules

- Analytics are deleted through cascade.
- QR Code is removed.
- Cache is invalidated.

---

# Redirect URL

## Description

Redirects visitors to the original destination.

### Request

```http
GET /{shortCode}
```

### Validation

The system verifies:

- URL exists
- URL is active
- URL has not expired
- Click limit has not been reached
- Password (if enabled)

### Success Response

```http
302 Found
```

The visitor is redirected to the original URL.

---

# Generate QR Code

## Description

Generates or regenerates a QR Code for a URL.

### Request

```http
POST /workspaces/{workspaceId}/urls/{urlId}/qrcode
```

### Success Response

```http
201 Created
```

Returns

- QR Code image
- Download URL

---

# View Analytics

## Description

Returns analytics for a URL.

### Request

```http
GET /workspaces/{workspaceId}/urls/{urlId}/analytics
```

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| from | Start date |
| to | End date |

### Success Response

```http
200 OK
```

Returns

- Total clicks
- Daily statistics
- Browser statistics
- Device statistics
- Country statistics

---

# Common Error Responses

| Status | Description |
|---------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | URL Not Found |
| 409 | Short Code Already Exists |
| 410 | URL Expired |
| 423 | Click Limit Reached |
| 500 | Internal Server Error |

---

# Permission Matrix

| Feature | Member | Owner |
|----------|:------:|:-----:|
| Create URL | ✅ | ✅ |
| List URLs | ✅ | ✅ |
| View URL | ✅ | ✅ |
| Update URL | ✅* | ✅ |
| Delete URL | ✅* | ✅ |
| Generate QR Code | ✅ | ✅ |
| View Analytics | ✅ | ✅ |

\* Depending on workspace permissions.

---

# Validation Rules

## Original URL

Requirements

- Required
- Valid HTTP or HTTPS URL

---

## Short Code

Requirements

- Unique
- URL-safe
- Maximum length defined by system

---

## Expiration

Requirements

- Must be a future date

---

## Maximum Clicks

Requirements

- Greater than zero

---

# Rate Limiting

| Endpoint | Recommendation |
|----------|----------------|
| Create URL | 30 requests/minute |
| Update URL | 60 requests/minute |
| Delete URL | 20 requests/minute |
| Generate QR Code | 20 requests/minute |
| Redirect URL | Unlimited (handled by Redis + CDN) |

---

# API Versioning

Current Version

```
v1
```

Example

```
/api/v1/workspaces/{workspaceId}/urls
```

Future API versions should remain backward compatible whenever possible.