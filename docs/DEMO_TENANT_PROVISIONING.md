# Demo Tenant Provisioning System

## Overview

The Demo Tenant Provisioning System allows HRplus administrators to manage demo registrations, provision new demo environments, and convert successful demos to production tenants.

## Access Points

### Admin Dashboard
Navigate to **Admin & Security → Client Registry** (under Organization & Structure section)

**Direct URL**: `/admin/client-registry`

### Demo Experience URLs
- **Demo Login**: `/demo/login?id={registration_id}` or `/demo/login?subdomain={subdomain}`
- **Demo Expired**: `/demo/expired?id={registration_id}`
- **Demo Conversion**: `/demo/convert?id={registration_id}`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN INTERFACE                              │
├─────────────────────────────────────────────────────────────────┤
│  Client Registry Page (/admin/client-registry)                  │
│  ├── View all demo registrations                                │
│  ├── Start provisioning workflow                                │
│  └── Monitor status                                             │
├─────────────────────────────────────────────────────────────────┤
│  Client Detail Page (/admin/clients/{id})                       │
│  ├── View registration details                                  │
│  ├── Contact information                                        │
│  └── Provisioning actions                                       │
├─────────────────────────────────────────────────────────────────┤
│  Provisioning Page (/admin/clients/{id}/provision)              │
│  ├── Manual task tracking                                       │
│  ├── Step-by-step workflow                                      │
│  └── Automated provisioning trigger                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     EDGE FUNCTIONS                               │
├─────────────────────────────────────────────────────────────────┤
│  provision-demo-tenant                                          │
│  ├── Creates company group & company                            │
│  ├── Creates demo user with secure password                     │
│  ├── Creates user profile & assigns admin role                  │
│  ├── Seeds sample data (departments, leave types, grades)       │
│  └── Sends welcome email with credentials                       │
├─────────────────────────────────────────────────────────────────┤
│  create-subdomain-dns                                           │
│  ├── Creates CNAME record in Cloudflare                         │
│  ├── Enables SSL via Cloudflare proxy                           │
│  └── Updates registration with DNS info                         │
├─────────────────────────────────────────────────────────────────┤
│  convert-demo-to-production                                     │
│  ├── Updates company to production tenant                       │
│  ├── Creates subscription record                                │
│  ├── Removes demo user flags                                    │
│  └── Sends conversion confirmation email                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE TABLES                              │
├─────────────────────────────────────────────────────────────────┤
│  demo_registrations                                             │
│  ├── id, company_name, contact_name, contact_email              │
│  ├── subdomain, selected_modules, company_size                  │
│  ├── status (pending/provisioning/provisioned/converted/expired)│
│  ├── demo_expires_at, provisioned_at, converted_at              │
│  └── provisioned_company_id (FK to companies)                   │
├─────────────────────────────────────────────────────────────────┤
│  client_provisioning_tasks                                      │
│  ├── registration_id, task_name, task_type                      │
│  ├── status (pending/in_progress/completed/failed)              │
│  ├── execution_order, is_automated                              │
│  └── started_at, completed_at, notes                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Workflow Steps

### 1. Demo Registration (External)
A prospect registers for a demo via the marketing website (separate project). This creates a record in `demo_registrations` with status `pending`.

### 2. Admin Review
1. Navigate to `/admin/client-registry`
2. Review pending registrations
3. Click "Start Provisioning" to begin the workflow

### 3. Provisioning Workflow
The provisioning page (`/admin/clients/{id}/provision`) guides through:

| Step | Task | Type | Description |
|------|------|------|-------------|
| 1 | DNS Setup | Automated | Creates subdomain via Cloudflare |
| 2 | Company Setup | Automated | Creates company group and company |
| 3 | User Account | Automated | Creates demo user with admin role |
| 4 | Seed Data | Automated | Departments, leave types, salary grades |
| 5 | Module Configuration | Manual | Review and adjust module settings |
| 6 | Branding Review | Manual | Apply any company-specific branding |
| 7 | Welcome Email | Automated | Sends credentials to prospect |
| 8 | Final Verification | Manual | Admin confirms everything works |

### 4. Demo Period
- Demo user logs in via `/demo/login?subdomain={subdomain}`
- Demo expires after configured period (default: 14 days)
- Expired demos redirect to `/demo/expired`

### 5. Conversion to Production
When a demo converts:
1. Navigate to conversion page or use `/demo/convert?id={id}`
2. Confirm company details and billing information
3. Select modules for production subscription
4. Edge function converts tenant type and creates subscription

---

## Required Secrets

| Secret Name | Purpose | Required |
|-------------|---------|----------|
| `CLOUDFLARE_API_TOKEN` | DNS record management | Yes |
| `CLOUDFLARE_ZONE_ID` | Target DNS zone | Yes |
| `RESEND_API_KEY` | Email delivery | Yes |

---

## API Endpoints

### Provision Demo Tenant
```typescript
POST /functions/v1/provision-demo-tenant
{
  "registrationId": "uuid",
  "taskId": "uuid" // optional, for task tracking
}
```

### Create Subdomain DNS
```typescript
POST /functions/v1/create-subdomain-dns
{
  "subdomain": "acme-corp",
  "registrationId": "uuid", // optional
  "action": "create" | "delete"
}
```

### Convert Demo to Production
```typescript
POST /functions/v1/convert-demo-to-production
{
  "demoId": "uuid",
  "companyDetails": {
    "companyName": "Acme Corp",
    "legalName": "Acme Corporation Ltd.",
    "billingEmail": "billing@acme.com",
    "billingAddress": "123 Main St..."
  },
  "selectedModules": ["core_hr", "leave", "payroll"]
}
```

---

## Seed Data Created

When a demo is provisioned, the following sample data is created:

### Departments
- Human Resources (HR)
- Information Technology (IT)
- Finance (FIN)
- Operations (OPS)
- Sales (SALES)

### Leave Types
| Code | Name | Paid | Days/Year |
|------|------|------|-----------|
| AL | Annual Leave | Yes | 15 |
| SL | Sick Leave | Yes | 10 |
| PL | Personal Leave | Yes | 3 |
| UL | Unpaid Leave | No | 0 |

### Salary Grades
| Code | Name | Min | Max |
|------|------|-----|-----|
| E1 | Entry Level | 30,000 | 45,000 |
| E2 | Junior | 45,000 | 65,000 |
| E3 | Mid-Level | 65,000 | 90,000 |
| E4 | Senior | 90,000 | 130,000 |
| M1 | Manager | 100,000 | 150,000 |
| M2 | Senior Manager | 130,000 | 180,000 |
| D1 | Director | 160,000 | 220,000 |

---

## Status Flow

```
pending → provisioning → provisioned → converted
                ↓                ↓
              failed          expired
```

---

## Troubleshooting

### DNS Not Propagating
- Check Cloudflare dashboard for DNS record
- Verify `CLOUDFLARE_API_TOKEN` has DNS edit permissions
- DNS propagation can take up to 24 hours (usually minutes with Cloudflare)

### Email Not Sent
- Verify `RESEND_API_KEY` is configured
- Check edge function logs for errors
- Verify sender domain is configured in Resend

### Provisioning Failed
1. Check edge function logs: `supabase functions logs provision-demo-tenant`
2. Verify registration exists and is in correct status
3. Check for unique constraint violations (duplicate subdomain/company code)

### Demo Login Issues
- Verify subdomain DNS is resolving
- Check user was created with correct email
- Confirm profile was created and linked to company
