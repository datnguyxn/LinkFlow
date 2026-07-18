# URL API Design

## Overview

This document defines the REST API endpoints for the URL module.

The API allows authenticated users to manage shortened URLs within their workspaces while providing a public endpoint for URL redirection.

All responses follow the standard API response format used by the system.

---

# Authentication

Management APIs require JWT Authentication.

Public redirect endpoints do not require authentication.

---

# API Overview

| Method | Endpoint | Authentication | Description |
|---------|----------|----------------|-------------|
| POST | /workspaces/:workspaceId/urls | ✅ | Create URL |
| GET | /workspaces/:workspaceId/urls | ✅ | List URLs |
| GET | /urls/:id | ✅ | Get URL Details |
| PATCH | /urls/:id | ✅ | Update URL |
| DELETE | /urls/:id | ✅ | Delete URL |
| GET | /r/:shortCode | ❌ | Redirect URL |
| POST | /urls/:id/qrcode | ✅ | Generate QR Code |
| GET | /urls/:id/qrcode | ✅ | Get QR Code |
| GET | /urls/:id/analytics | ✅ | Get Analytics |

---

# Create URL

## Description

Creates a shortened URL inside a workspace.

### Request

```
POST /workspaces/{workspaceId}/urls
```

### Request Body

| Field | Required | Description |
|---------|----------|-------------|
| originalUrl | ✅ | Original destination |
| shortCode | ❌ | Custom short code |
| title | ❌ | URL title |
| description | ❌ | Description |
| password | ❌ | Password protection |
| expiresAt | ❌ | Expiration date |
| maxClicks | ❌ | Maximum redirects |
| tags | ❌ | Tag IDs |

### Success Response

```
201 Created
```

Returns

- URL ID
- Short URL
- URL Information

---

# List URLs

## Description

Returns all URLs in a workspace.

### Request

```
GET /workspaces/{workspaceId}/urls
```

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| page | Page number |
| limit | Items per page |
| search | Search keyword |
| status | URL status |
| tag | Tag ID |

### Success Response

```
200 OK
```

---

# Get URL Details

## Description

Returns information about a URL.

### Request

```
GET /urls/{id}
```

### Success Response

```
200 OK
```

---

# Update URL

## Description

Updates URL information.

### Request

```
PATCH /urls/{id}
```

### Editable Fields

- originalUrl
- title
- description
- password
- expiresAt
- maxClicks
- status
- tags

### Success Response

```
200 OK
```

---

# Delete URL

## Description

Soft deletes a URL.

### Request

```
DELETE /urls/{id}
```

### Success Response

```
204 No Content
```

Business Rule

The URL is soft deleted by setting:

```
deletedAt
```

---

# Redirect URL

## Description

Redirects visitors to the original URL.

### Request

```
GET /r/{shortCode}
```

Validation Order

1. Find URL
2. Check Soft Delete
3. Check Status
4. Check Expiration
5. Check Maximum Clicks
6. Verify Password (Optional)
7. Increase Click Count
8. Record Analytics
9. Redirect

### Success Response

```
301 Moved Permanently
```

or

```
302 Found
```

---

# Generate QR Code

## Description

Generates a QR Code for a URL.

### Request

```
POST /urls/{id}/qrcode
```

### Success Response

```
201 Created
```

Returns

- QR Code URL

---

# Get QR Code

## Description

Returns the QR Code image for a URL.

### Request

```
GET /urls/{id}/qrcode
```

### Success Response

```
200 OK
```

---

# Get Analytics

## Description

Returns analytics for a URL.

### Request

```
GET /urls/{id}/analytics
```

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| from | Start date |
| to | End date |

### Success Response

```
200 OK
```

Returns

- Total Clicks
- Daily Statistics
- Browser Statistics
- Country Statistics
- Device Statistics

---

# Common Error Responses

| Status | Description |
|---------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Short Code Already Exists |
| 410 | URL Expired or Maximum Clicks Reached |
| 422 | Invalid URL |
| 500 | Internal Server Error |

---

# Permission Matrix

| Feature | Workspace Member | Workspace Admin | Workspace Owner |
|----------|------------------|-----------------|-----------------|
| List URLs | ✅ | ✅ | ✅ |
| View URL | ✅ | ✅ | ✅ |
| Create URL | ✅ | ✅ | ✅ |
| Update URL | ✅ | ✅ | ✅ |
| Delete URL | ❌ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ✅ |
| Generate QR Code | ✅ | ✅ | ✅ |

---

# Rate Limiting

To prevent abuse, the following limits should be applied.

| Endpoint | Recommendation |
|----------|----------------|
| Create URL | 50 requests/minute |
| Redirect | Unlimited |
| Generate QR Code | 10 requests/minute |
| Analytics | 30 requests/minute |

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

Future versions should maintain backward compatibility whenever possible.