# Demo Tenant Provisioning - Testing Checklist

## Pre-Testing Requirements

### Secrets Verification
- [ ] `CLOUDFLARE_API_TOKEN` - Configured with DNS edit permissions
- [ ] `CLOUDFLARE_ZONE_ID` - Correct zone ID for your domain
- [ ] `RESEND_API_KEY` - Valid API key with verified sender domain

### Database Setup
- [ ] `demo_registrations` table exists with correct schema
- [ ] `client_provisioning_tasks` table exists
- [ ] RLS policies allow admin access

---

## Test Scenarios

### 1. Client Registry Page (`/admin/client-registry`)

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| Page loads | Navigate to `/admin/client-registry` | Page displays with table/cards | ☐ |
| Empty state | View with no registrations | Shows "No registrations found" message | ☐ |
| Create registration | Click "New Registration", fill form | Registration created, appears in list | ☐ |
| Filter by status | Use status filter dropdown | Only matching registrations shown | ☐ |
| Search | Enter company name in search | Filtered results | ☐ |
| Start provisioning | Click "Start Provisioning" on pending | Navigates to provision page | ☐ |

### 2. Client Detail Page (`/admin/clients/{id}`)

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| View details | Click on registration | Shows full details | ☐ |
| Contact info | Check contact section | Email, name, phone displayed | ☐ |
| Module selection | View selected modules | All selected modules listed | ☐ |
| Status badge | Check status display | Correct colored badge | ☐ |
| Provisioning link | Click provisioning button | Navigates to provision page | ☐ |

### 3. Provisioning Workflow (`/admin/clients/{id}/provision`)

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| Task list loads | Open provisioning page | All tasks displayed in order | ☐ |
| Manual task complete | Mark manual task done | Task status updates | ☐ |
| DNS automation | Trigger DNS setup | Creates Cloudflare record | ☐ |
| Company creation | Run provisioning | Company & group created | ☐ |
| User creation | Run provisioning | User created with credentials | ☐ |
| Email sent | Complete provisioning | Welcome email received | ☐ |
| Status update | Complete all tasks | Registration status = provisioned | ☐ |

### 4. DNS Edge Function

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| Create DNS record | Call with action="create" | CNAME created in Cloudflare | ☐ |
| Duplicate handling | Create same subdomain twice | Updates existing record | ☐ |
| Delete DNS record | Call with action="delete" | Record removed | ☐ |
| Invalid subdomain | Use special characters | Sanitized to valid format | ☐ |
| Missing credentials | Remove API token | Returns clear error | ☐ |

### 5. Demo Login Flow

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| Login by ID | `/demo/login?id={id}` | Shows login form | ☐ |
| Login by subdomain | `/demo/login?subdomain={sub}` | Shows login form | ☐ |
| Valid credentials | Enter demo credentials | Logs in successfully | ☐ |
| Invalid credentials | Enter wrong password | Shows error message | ☐ |
| Expired demo | Login to expired demo | Redirects to expired page | ☐ |

### 6. Demo Expired Page

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| Shows expiry info | Visit expired demo | Shows expiry message | ☐ |
| Contact support | Click support link | Opens email/form | ☐ |
| Convert option | Click convert button | Navigates to conversion | ☐ |

### 7. Demo Conversion

| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| Load conversion page | `/demo/convert?id={id}` | Shows conversion form | ☐ |
| Fill company details | Enter legal name, billing | Form validates | ☐ |
| Select modules | Choose production modules | Selection saved | ☐ |
| Submit conversion | Click convert | Triggers edge function | ☐ |
| Company updated | Check company record | tenant_type = production | ☐ |
| Subscription created | Check subscriptions | New subscription record | ☐ |
| Email sent | Complete conversion | Confirmation email received | ☐ |
| Already converted | Try converting again | Shows already converted error | ☐ |

---

## Integration Tests

### End-to-End Flow
1. [ ] Create new demo registration via admin
2. [ ] Start provisioning workflow
3. [ ] Complete all automated tasks
4. [ ] Verify DNS record in Cloudflare
5. [ ] Verify company created in database
6. [ ] Receive welcome email with credentials
7. [ ] Login as demo user via subdomain
8. [ ] Navigate through demo features
9. [ ] Initiate conversion to production
10. [ ] Complete conversion form
11. [ ] Verify subscription created
12. [ ] Verify demo flags removed from user
13. [ ] Receive conversion confirmation email

### Error Handling
- [ ] Network failure during provisioning → Shows retry option
- [ ] Cloudflare API error → Clear error message, doesn't corrupt state
- [ ] Email sending failure → Provisioning continues, logs warning
- [ ] Database constraint violation → Meaningful error shown

---

## Performance Tests

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Page load (Client Registry) | < 2s | | ☐ |
| Provisioning completion | < 30s | | ☐ |
| DNS propagation | < 5 min | | ☐ |
| Email delivery | < 1 min | | ☐ |

---

## Security Tests

| Test Case | Expected | Status |
|-----------|----------|--------|
| Non-admin access to /admin/client-registry | Redirected to login/forbidden | ☐ |
| Direct API call without auth | Returns 401 | ☐ |
| SQL injection in subdomain | Sanitized, no injection | ☐ |
| XSS in company name | Properly escaped | ☐ |
| Demo user can't access other companies | RLS blocks access | ☐ |

---

## Production Readiness Checklist

### Configuration
- [ ] All secrets configured in production
- [ ] Correct Cloudflare zone for production domain
- [ ] Resend sender domain verified
- [ ] Demo expiry period configured appropriately

### Monitoring
- [ ] Edge function logs accessible
- [ ] Error alerts configured
- [ ] Performance metrics tracking

### Documentation
- [ ] Admin training documentation complete
- [ ] Support runbook for common issues
- [ ] API documentation for integrations

### Backup & Recovery
- [ ] Database backup strategy in place
- [ ] Rollback procedure documented
- [ ] DNS record recovery process

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA | | | |
| Product Owner | | | |
| Operations | | | |
