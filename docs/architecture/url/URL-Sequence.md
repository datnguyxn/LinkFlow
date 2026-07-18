# URL Sequence Design

## Overview

This document describes the interaction flow between clients, backend services, database, object storage, and analytics components in the URL module.

The sequence diagrams illustrate how requests are processed from start to finish for each feature.

---

# Create Short URL

## Description

Creates a new shortened URL inside a workspace.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: POST /urls

    API->>DB: Validate Workspace

    alt Workspace Not Found
        API-->>User: 404 Workspace Not Found

    else Workspace Exists

        API->>DB: Check Permission

        alt No Permission
            API-->>User: 403 Forbidden

        else Authorized

            API->>API: Validate Original URL

            API->>DB: Check Short Code

            alt Short Code Exists
                API-->>User: 409 Short Code Already Exists

            else Short Code Available

                API->>DB: Create URL

                DB-->>API: URL Created

                API-->>User: Short URL

            end

        end

    end
```

---

# Get URL Details

## Description

Returns information about a URL.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: GET /urls/:id

    API->>DB: Find URL

    alt URL Not Found
        API-->>User: 404 Not Found

    else URL Exists

        API->>DB: Validate Workspace Permission

        alt Forbidden
            API-->>User: 403 Forbidden

        else Authorized

            DB-->>API: URL Information

            API-->>User: URL Details

        end

    end
```

---

# Update URL

## Description

Updates an existing shortened URL.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: PATCH /urls/:id

    API->>DB: Find URL

    alt URL Not Found
        API-->>User: 404 Not Found

    else URL Exists

        API->>DB: Validate Permission

        alt Forbidden
            API-->>User: 403 Forbidden

        else Authorized

            API->>API: Validate Request

            API->>DB: Update URL

            DB-->>API: Updated URL

            API-->>User: URL Updated

        end

    end
```

---

# Delete URL

## Description

Soft deletes a URL.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: DELETE /urls/:id

    API->>DB: Find URL

    alt URL Not Found
        API-->>User: 404 Not Found

    else URL Exists

        API->>DB: Validate Permission

        alt Forbidden
            API-->>User: 403 Forbidden

        else Authorized

            API->>DB: Set deletedAt

            DB-->>API: Updated

            API-->>User: URL Deleted

        end

    end
```

---

# Redirect URL

## Description

Redirects visitors from the shortened URL to the original destination.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor Visitor
    participant API
    participant DB
    participant Analytics

    Visitor->>API: GET /:shortCode

    API->>DB: Find URL

    alt URL Not Found
        API-->>Visitor: 404 Not Found

    else URL Exists

        API->>API: Check Soft Delete

        API->>API: Check Status

        API->>API: Check Expiration

        API->>API: Check Click Limit

        API->>API: Verify Password (Optional)

        alt Validation Failed

            API-->>Visitor: Redirect Denied

        else Validation Success

            API->>DB: Increase Click Count

            API->>Analytics: Record Click Event

            Analytics-->>API: Recorded

            API-->>Visitor: HTTP Redirect

        end

    end
```

---

# Generate QR Code

## Description

Generates a QR Code for a shortened URL.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant QRGenerator
    participant Storage
    participant DB

    User->>API: POST /urls/:id/qrcode

    API->>DB: Find URL

    alt URL Not Found
        API-->>User: 404 Not Found

    else URL Exists

        API->>QRGenerator: Generate QR

        QRGenerator-->>API: PNG

        API->>Storage: Upload Image

        Storage-->>API: Image URL

        API->>DB: Save QR Code

        DB-->>API: Saved

        API-->>User: QR Code

    end
```

---

# Get Analytics

## Description

Returns analytics for a URL.

### Sequence Diagram

```mermaid
sequenceDiagram

    actor User
    participant API
    participant DB

    User->>API: GET /urls/:id/analytics

    API->>DB: Find URL

    alt URL Not Found
        API-->>User: 404 Not Found

    else URL Exists

        API->>DB: Validate Permission

        alt Forbidden
            API-->>User: 403 Forbidden

        else Authorized

            API->>DB: Query Statistics

            DB-->>API: Analytics

            API-->>User: Analytics Report

        end

    end
```

---

# Sequence Summary

| Feature | Main Components |
|----------|-----------------|
| Create URL | API → Database |
| Get URL | API → Database |
| Update URL | API → Database |
| Delete URL | API → Database |
| Redirect URL | API → Database → Analytics |
| Generate QR Code | API → QR Generator → Storage → Database |
| Get Analytics | API → Database |