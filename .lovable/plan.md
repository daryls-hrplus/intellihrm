
# External API Implementation Plan

## Overview

This plan creates a secure, external-facing REST API for Intellico Global integration. The API will support employee data, leave management, payroll records, and competency/skills data with token-based authentication.

---

## Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                         External Client (Intellico)                       │
│                                                                           │
│    POST /auth/token (API Key) ──► Get JWT                                │
│    GET /employees ──────────────► List employees                         │
│    GET /employees/:id ──────────► Employee details                       │
│    GET /leave/requests ─────────► Leave requests (filtered)              │
│    GET /leave/balances ─────────► Leave balances                         │
│    GET /payroll/records ────────► Payroll records (filtered)             │
│    GET /competencies ───────────► Skills & certifications                │
└───────────────────────┬──────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    Edge Function: external-api                            │
│                                                                           │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│   │  Route Handler  │──│  Auth Middleware │──│  Rate Limiter   │          │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘          │
│                                                                           │
│   Endpoints:                                                              │
│   • /auth/token     - Exchange API key for JWT (15min expiry)            │
│   • /employees      - List with pagination, company filtering            │
│   • /employees/:id  - Full profile with assignments                      │
│   • /leave/*        - Leave requests and balances                        │
│   • /payroll/*      - Payroll run records                                │
│   • /competencies   - Skills, competencies, certificates                 │
└───────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                         Database Tables                                    │
│                                                                           │
│   NEW: api_keys                    EXISTING: profiles, leave_requests,   │
│   • id, company_id, key_hash       leave_balances, employee_payroll,     │
│   • name, scopes[], rate_limit     competencies, employee_certificates,  │
│   • is_active, expires_at          employee_competencies, payroll_runs   │
│   • last_used_at, created_by                                             │
│                                                                           │
│   NEW: api_request_logs                                                   │
│   • id, api_key_id, endpoint                                             │
│   • method, status_code, ip_address                                       │
│   • request_at, response_time_ms                                          │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Changes

### Table: `api_keys`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| company_id | uuid | Company scope (FK companies.id) |
| name | text | Display name (e.g., "Intellico Integration") |
| key_prefix | text | First 8 chars for display (e.g., "igk_abc1...") |
| key_hash | text | SHA-256 hash of full key |
| scopes | text[] | Allowed scopes: `employees:read`, `leave:read`, `payroll:read`, `competencies:read` |
| rate_limit_per_minute | integer | Default: 60 |
| is_active | boolean | Default: true |
| expires_at | timestamptz | Optional expiration |
| last_used_at | timestamptz | Last successful request |
| created_by | uuid | Admin who created |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update |

### Table: `api_request_logs`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| api_key_id | uuid | FK api_keys.id |
| endpoint | text | Request path |
| method | text | HTTP method |
| status_code | integer | Response status |
| ip_address | text | Client IP |
| user_agent | text | Client user agent |
| request_at | timestamptz | Request timestamp |
| response_time_ms | integer | Processing time |
| error_message | text | Error if failed |

---

## Edge Function: `external-api`

### File Structure
```
supabase/functions/external-api/
└── index.ts        # All routing and logic in single file
```

### Endpoints

#### POST `/auth/token`
**Purpose**: Exchange API key for short-lived JWT token

**Request**:
```json
{
  "api_key": "igk_abc123..."
}
```

**Response** (200):
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 900,
  "scopes": ["employees:read", "leave:read"]
}
```

**Security**:
- API key verified against `key_hash`
- Updates `last_used_at`
- Returns JWT with `company_id`, `scopes`, 15min expiry
- Rate limited to prevent brute force

---

#### GET `/employees`
**Purpose**: List employees with pagination

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 50 | Items per page (max 100) |
| status | string | all | Filter: `active`, `inactive`, `all` |
| department_id | uuid | - | Filter by department |
| updated_since | ISO date | - | Only records updated after |

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "employee_id": "EMP001",
      "full_name": "John Doe",
      "email": "john@company.com",
      "department_id": "uuid",
      "department_name": "Engineering",
      "employment_status": "active",
      "start_date": "2023-01-15",
      "updated_at": "2024-01-10T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

---

#### GET `/employees/:id`
**Purpose**: Get full employee details

**Response** (200):
```json
{
  "id": "uuid",
  "employee_id": "EMP001",
  "full_name": "John Doe",
  "first_name": "John",
  "first_last_name": "Doe",
  "email": "john@company.com",
  "department": {
    "id": "uuid",
    "name": "Engineering"
  },
  "position": {
    "id": "uuid",
    "title": "Senior Developer"
  },
  "employment_status": "active",
  "start_date": "2023-01-15",
  "hire_date": "2023-01-15",
  "manager_id": "uuid",
  "created_at": "2023-01-10T08:00:00Z",
  "updated_at": "2024-01-10T10:30:00Z"
}
```

---

#### GET `/leave/requests`
**Purpose**: List leave requests with filtering

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| employee_id | uuid | Filter by employee |
| status | string | Filter: `pending`, `approved`, `rejected`, `cancelled` |
| start_date | date | Requests starting from |
| end_date | date | Requests ending before |
| page | integer | Page number |
| limit | integer | Items per page |

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "request_number": "LR-2024-001",
      "employee_id": "uuid",
      "employee_name": "John Doe",
      "leave_type": {
        "id": "uuid",
        "code": "ANN",
        "name": "Annual Leave"
      },
      "start_date": "2024-02-01",
      "end_date": "2024-02-05",
      "duration": 5,
      "status": "approved",
      "submitted_at": "2024-01-15T09:00:00Z",
      "reviewed_by": "uuid",
      "reviewed_at": "2024-01-16T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

#### GET `/leave/balances`
**Purpose**: Get employee leave balances

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| employee_id | uuid | Filter by employee (optional) |
| year | integer | Leave year (default: current) |

**Response** (200):
```json
{
  "data": [
    {
      "employee_id": "uuid",
      "employee_name": "John Doe",
      "leave_type": {
        "id": "uuid",
        "code": "ANN",
        "name": "Annual Leave"
      },
      "year": 2024,
      "opening_balance": 15,
      "accrued": 1.25,
      "used": 5,
      "carried_forward": 3,
      "current_balance": 14.25
    }
  ]
}
```

---

#### GET `/payroll/records`
**Purpose**: Get payroll records with period filtering

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| employee_id | uuid | Filter by employee |
| period_start | date | Period starting from |
| period_end | date | Period ending before |
| status | string | Filter: `draft`, `calculated`, `approved`, `paid` |
| page | integer | Page number |
| limit | integer | Items per page |

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "employee_id": "uuid",
      "employee_name": "John Doe",
      "payroll_run": {
        "id": "uuid",
        "run_number": "PR-2024-01",
        "status": "paid",
        "pay_date": "2024-01-31"
      },
      "pay_period": {
        "start": "2024-01-01",
        "end": "2024-01-31"
      },
      "gross_pay": 5000.00,
      "total_deductions": 1200.00,
      "net_pay": 3800.00,
      "currency": "USD",
      "hours": {
        "regular": 160,
        "overtime": 8
      }
    }
  ],
  "pagination": { ... }
}
```

---

#### GET `/competencies`
**Purpose**: Get employee skills and certifications

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| employee_id | uuid | Filter by employee |
| type | string | Filter: `skill`, `competency`, `certificate` |

**Response** (200):
```json
{
  "data": [
    {
      "employee_id": "uuid",
      "employee_name": "John Doe",
      "competencies": [
        {
          "id": "uuid",
          "name": "Leadership",
          "category": "behavioral",
          "assessed_level": 4,
          "required_level": 3,
          "assessed_date": "2024-01-15"
        }
      ],
      "certificates": [
        {
          "id": "uuid",
          "name": "PMP Certification",
          "issuing_organization": "PMI",
          "issue_date": "2023-06-01",
          "expiry_date": "2026-06-01",
          "status": "active"
        }
      ]
    }
  ]
}
```

---

## Security Implementation

### 1. API Key Generation
- Format: `igk_` + 32 random alphanumeric characters
- Only shown once at creation time
- Stored as SHA-256 hash

### 2. JWT Token
- Algorithm: HS256
- Payload includes: `company_id`, `scopes`, `api_key_id`
- Expiry: 15 minutes
- Signed with `SUPABASE_JWT_SECRET`

### 3. Rate Limiting
- Per API key limit (default 60/min)
- 429 response when exceeded
- `X-RateLimit-*` headers in response

### 4. Request Logging
- All requests logged to `api_request_logs`
- Enables usage analytics and security auditing

### 5. Scope Enforcement
- Each endpoint requires specific scope
- Scopes checked from JWT on every request

---

## UI Enhancement: API Management Page

Enhance the existing `APIManagementPage.tsx` with:

1. **API Keys List**
   - Create/revoke keys
   - Configure scopes per key
   - View usage stats

2. **API Documentation**
   - Interactive endpoint reference
   - Try-it-out functionality

3. **Usage Analytics**
   - Request volume chart
   - Error rate monitoring
   - Endpoint breakdown

---

## Implementation Files

### Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/external-api/index.ts` | Main API edge function |
| `src/components/system/api-management/APIKeyList.tsx` | API key management UI |
| `src/components/system/api-management/APIKeyCreateDialog.tsx` | Create key dialog |
| `src/components/system/api-management/APIUsageChart.tsx` | Usage analytics |
| `src/components/system/api-management/APIDocumentation.tsx` | Endpoint docs |
| `src/hooks/useAPIKeys.ts` | API key CRUD hooks |

### Files to Update
| File | Changes |
|------|---------|
| `supabase/config.toml` | Add `[functions.external-api]` with `verify_jwt = false` |
| `src/pages/system/APIManagementPage.tsx` | Full page implementation |

### Database Migration
- Create `api_keys` table with RLS
- Create `api_request_logs` table
- Add indexes for performance

---

## RLS Policies

### api_keys
```sql
-- Admins can manage keys for their company
CREATE POLICY "admins_manage_api_keys" ON api_keys
  FOR ALL USING (
    public.is_admin() AND 
    company_id IN (SELECT company_id FROM role_company_access WHERE user_id = auth.uid())
  );
```

### api_request_logs
```sql
-- Read-only for admins
CREATE POLICY "admins_read_api_logs" ON api_request_logs
  FOR SELECT USING (
    public.is_admin() AND 
    api_key_id IN (SELECT id FROM api_keys WHERE company_id IN 
      (SELECT company_id FROM role_company_access WHERE user_id = auth.uid()))
  );
```

---

## Error Responses

All endpoints return consistent error format:
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "The access token has expired",
    "status": 401
  }
}
```

| Code | Status | Description |
|------|--------|-------------|
| INVALID_API_KEY | 401 | API key not found or inactive |
| INVALID_TOKEN | 401 | JWT invalid or expired |
| INSUFFICIENT_SCOPE | 403 | Missing required scope |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| RESOURCE_NOT_FOUND | 404 | Requested resource not found |
| VALIDATION_ERROR | 400 | Invalid request parameters |

---

## Estimated Effort

| Phase | Tasks | Hours |
|-------|-------|-------|
| 1 | Database migration (tables, RLS) | 1-2 |
| 2 | Edge function with all endpoints | 4-6 |
| 3 | UI: API key management | 3-4 |
| 4 | UI: Documentation + analytics | 2-3 |
| 5 | Testing + refinements | 2-3 |
| **Total** | | **12-18 hours** |

---

## Industry Alignment

This design follows REST API best practices from:
- **Workday**: Token-based auth, scoped permissions
- **SAP SuccessFactors**: Pagination patterns, date filtering
- **Oracle HCM**: Resource-based endpoints, comprehensive error handling
- **BambooHR API**: Simple, developer-friendly response structures
