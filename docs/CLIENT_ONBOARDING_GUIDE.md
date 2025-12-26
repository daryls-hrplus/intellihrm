# HRplus Client Onboarding Guide

This guide provides step-by-step instructions for deploying HRplus to new enterprise clients with their own isolated workspace and database.

---

## Overview

Each client receives:
- ✅ Their own Lovable workspace (isolated environment)
- ✅ Their own database (complete data isolation)
- ✅ Multi-company support (for conglomerates/subsidiaries)
- ✅ Multi-country support (regional compliance)
- ✅ Automatic updates from the master repository

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 MASTER REPOSITORY                        │
│                   (Your GitHub)                          │
│  • Source of truth for all code                         │
│  • Push updates here → flows to all clients             │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │Client A │   │Client B │   │Client C │
   │Workspace│   │Workspace│   │Workspace│
   ├─────────┤   ├─────────┤   ├─────────┤
   │Database │   │Database │   │Database │
   │(Isolated)│   │(Isolated)│   │(Isolated)│
   └─────────┘   └─────────┘   └─────────┘
```

---

## Prerequisites

Before onboarding a new client, ensure:

1. **Master Project is connected to GitHub**
   - Settings → GitHub → Connect to GitHub
   - Repository created and syncing

2. **Database migrations are up to date**
   - All schema changes committed
   - Migration files organized

3. **Environment variables documented**
   - List of required secrets/API keys
   - Configuration options

---

## Client Onboarding Checklist

### Phase 1: Workspace Setup (15 minutes)

- [ ] **1.1 Create Client Workspace**
  - Remix the master project to create client's workspace
  - OR: Client creates their own Lovable account and workspace

- [ ] **1.2 Connect GitHub Repository**
  - Client workspace connects to the shared GitHub repository
  - Enables automatic updates when you push changes

- [ ] **1.3 Enable Lovable Cloud**
  - Navigate to Cloud tab in client's workspace
  - Enable Cloud to provision their isolated database

### Phase 2: Database Configuration (30 minutes)

- [ ] **2.1 Run Initial Migrations**
  - Database schema will be applied automatically
  - Verify all tables are created correctly

- [ ] **2.2 Configure Authentication**
  - Enable email authentication
  - Configure auto-confirm for email signups (development)
  - Set up OAuth providers if required (Google, Microsoft)

- [ ] **2.3 Set Up Initial Data**
  - Create the client's primary company record
  - Set up initial admin user
  - Configure lookup values (countries, currencies, etc.)

### Phase 3: Client Configuration (45 minutes)

- [ ] **3.1 Company Setup**
  ```
  Companies to create:
  - Primary company (headquarters)
  - Subsidiary companies (if conglomerate)
  - Regional entities (if multi-country)
  ```

- [ ] **3.2 Organization Structure**
  - Departments
  - Locations/Branches
  - Cost Centers
  - Business Units

- [ ] **3.3 Job Architecture**
  - Job Families
  - Job Grades
  - Positions

- [ ] **3.4 User Roles & Permissions**
  - System Administrator
  - HR Manager
  - HR Officer
  - Department Managers
  - Employees (ESS)

### Phase 4: Module Activation (15 minutes)

- [ ] **4.1 Configure Subscription**
  - Activate required modules
  - Set employee count limits
  - Configure billing (if applicable)

- [ ] **4.2 Enable Features**
  - Core HR
  - Time & Attendance
  - Leave Management
  - Payroll
  - Performance Management
  - Recruitment
  - Learning & Development

### Phase 5: Integration Setup (Variable)

- [ ] **5.1 External Integrations (if required)**
  - Payroll systems
  - Biometric devices
  - Email services
  - Document storage

- [ ] **5.2 Configure Secrets**
  - API keys for integrations
  - SMTP settings for email
  - External service credentials

### Phase 6: Go-Live Preparation (1-2 hours)

- [ ] **6.1 Data Migration**
  - Import employee data
  - Historical records
  - Leave balances
  - Payroll history

- [ ] **6.2 User Training**
  - Admin training session
  - HR team training
  - Manager training
  - Employee self-service orientation

- [ ] **6.3 Testing**
  - End-to-end workflow testing
  - Permission verification
  - Report generation
  - Integration testing

---

## Pushing Updates to Clients

When you make updates to the master project:

1. **Make changes in your master workspace**
2. **Changes automatically push to GitHub**
3. **Client workspaces pull updates automatically** (if connected to same repo)

### For Breaking Changes:

1. Notify clients in advance
2. Schedule maintenance window
3. Push changes to GitHub
4. Run any required database migrations in each client workspace
5. Verify functionality

---

## Database Isolation Details

Each client has complete data isolation:

| Component | Isolation Level |
|-----------|-----------------|
| Database | Separate instance |
| Users/Auth | Separate auth system |
| Files/Storage | Separate storage buckets |
| Edge Functions | Shared code, isolated data |
| Secrets | Per-workspace configuration |

---

## Troubleshooting

### Client can't see updates
- Verify GitHub connection is active
- Check if workspace is syncing with repository
- Manual refresh may be required

### Database migration issues
- Check Cloud tab for migration status
- Review error logs in Cloud → Database
- Contact support if migrations fail

### Authentication problems
- Verify auth settings in Cloud → Users
- Check email confirmation settings
- Review RLS policies

---

## Support Escalation

| Issue Type | Contact |
|------------|---------|
| Lovable Platform | support@lovable.dev |
| Database Issues | Cloud tab → Support |
| Client-specific bugs | Your support team |

---

## Client Information Template

```
Client Name: ___________________
Workspace URL: ___________________
Primary Contact: ___________________
Email: ___________________
Phone: ___________________

Companies:
- [ ] ___________________
- [ ] ___________________
- [ ] ___________________

Modules Activated:
- [ ] Core HR
- [ ] Time & Attendance
- [ ] Leave Management
- [ ] Payroll
- [ ] Performance
- [ ] Recruitment
- [ ] Learning

Go-Live Date: ___________________
Employee Count: ___________________
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-26 | Initial guide |

