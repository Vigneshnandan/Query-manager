# Official Portal & SLA Escalation - Complete ✅

## TASK 1: Official Portal

### 1. **Updated Signup Flow**

**Changes to `/login`:**
- Role selection includes: Citizen, Official, Dept Head, Officer
- Department dropdown appears for: **Dept Head** and **Officer** roles only
- **Official role requires NO extra fields** (only name, email, password)
- Form validation:
  - Dept Head: Department required
  - Officer: Department required
  - Official: Department NOT required

---

### 2. **Issue Order Portal** (`/official/issue-order`)

**Form Fields:**
- **Order Description** (required textarea)
- **Deadline** (required date picker) - NEW
- Location (optional text input)
- Document/Photo (optional file upload)

**Workflow on Submit:**
1. Validate form (description + deadline required)
2. Upload photo if provided → "complaint-photos" bucket
3. **Pass deadline as context** to AI analysis:
   ```
   "{original_text}\n\nDeadline specified by official: {deadline}"
   ```
4. Call `/api/analyze` with enhanced text
5. Create ticket in `tickets` table
6. Create issues from AI response
7. Redirect to `/official/track/{ticketId}`

**Key Difference from Citizen Submit:**
- ✅ Required deadline input
- ✅ Deadline passed to AI for context
- ✅ Labeled as "Issue Order" instead of "Submit Complaint"
- ✅ Same database tables (orders are treated like complaints)

---

### 3. **Official Tickets** (`/official/tickets`)

**Behavior:**
- Reuses logic from `/citizen/tickets`
- Fetches tickets where `citizen_id = current_user_id`
- Shows all orders issued by this official
- Clickable cards link to ticket detail page

---

### 4. **Official Track** (`/official/track/:ticketId`)

**Behavior:**
- Reuses logic from `/citizen/track/{ticketId}`
- Shows full order details + routed issues
- Issues show department, status, priority, deadline
- Read-only view (officials view routing, don't edit)

---

## TASK 2: SLA Escalation System

### Backend Endpoint: `POST /api/check-sla`

**Authentication:**
- Uses Supabase SERVICE ROLE KEY (not anon key)
- Allows direct database queries on `issues` table

**Query Logic:**
- Find issues where:
  - `sla_deadline < now()` (deadline has passed)
  - AND `status` IN ('new', 'assigned', 'in_progress')
  - (Excludes already resolved/escalated)

**Update Action:**
- Set `status = 'escalated'` for matching issues
- Update `updated_at = now()`

**Response:**
```json
{
  "escalated_count": 5,
  "escalated_ids": ["id1", "id2", "id3", "id4", "id5"]
}
```

**Error Handling:**
- Returns 500 if Supabase credentials not configured
- Returns 500 on any database error
- Includes error message in response

---

### Frontend: SLA Check Button

**Location:** Dept Head Dashboard (`/depthead/dashboard`)

**Button:**
- Label: "Run SLA Check"
- Color: Amber (warning/demo)
- Position: Top-right, next to Logout
- Disabled while checking

**On Click Workflow:**
1. Call `/api/check-sla` endpoint
2. **Refresh issue list** from Supabase
3. Show feedback message:
   - Success: `"✓ SLA check complete. N issue(s) escalated."`
   - Error: Show error message in red

**Immediate Feedback:**
- Issues with status='escalated' now show red badge
- List re-sorts (non-resolved first)
- Demo can trigger escalation without waiting for real time

---

## Pages Created/Updated

```
frontend/src/pages/
├── Login.tsx                  (updated - allow official without dept)
├── OfficialIssueOrder.tsx     (new - issue order form with deadline)
├── OfficialTickets.tsx        (new - list of issued orders)
├── OfficialTrack.tsx          (new - order detail + routing)
└── DepthDashboard.tsx         (updated - added SLA check button)

backend/
├── server.ts                  (updated - added /api/check-sla endpoint)
└── (no schema changes needed)
```

---

## Database Operations

**No schema changes required.** All features use existing tables:
- `tickets` - stores orders same as complaints
- `issues` - stores routed issues, status updated to 'escalated'
- `profiles` - official role added (no dept required)

---

## Build Status

✅ **Frontend:** 78 modules, 489.58 kB (gzipped: 134.94 kB)
✅ **Backend:** TypeScript compiles without errors
✅ **Zero TypeScript strict mode errors**

---

## Testing the Official Portal

### Signup as Official:
1. Go to login page
2. Click "Don't have an account? Sign up"
3. Fill:
   - Name: Jane Doe
   - Email: jane@example.com
   - Password: test123
   - **Role: Official** (no department needed!)
4. Create account → Login
5. Redirects to `/official/tickets`

### Issue an Order:
1. Click "Issue New Order" button
2. Fill form:
   - Description: "Repair pothole on Main Street by 2025-09-15"
   - **Deadline: 2025-09-15** (required)
   - Location: Main Street
   - Photo: (optional)
3. Submit
4. AI splits into issues, routes to departments
5. See order details page

### Track Order:
1. Go to "My Orders"
2. Click any order
3. See routed issues with their department assignments
4. Same as citizen tracking

---

## Testing SLA Escalation (Demo)

### Setup:
1. Dept head logs in
2. Some issues have past SLA deadlines
   - (Can manually set deadline in DB to past date for testing)

### Demo Flow:
1. See issues with "Overdue by X hours" red badge
2. Click "Run SLA Check" button
3. Button shows "Checking..." state
4. Success message: "✓ SLA check complete. N issue(s) escalated."
5. Refresh shows those issues now have "escalated" status (red badge)
6. No more "Overdue by" - shows "escalated" status instead

**Live Demo Advantage:**
- Dept head can trigger escalation on demand
- No waiting for real time to pass
- Shows workflow in action during demo

---

## Workflow Integration

```
Citizen files complaint
          ↓
AI analyzes & routes
          ↓
Dept Head assigns to Officer
(or Official issues order)
          ↓
Officer works on issue
(status: assigned → in_progress → resolved)
          ↓
Time passes or Dept Head runs SLA check
          ↓
If SLA exceeded: issue escalated
(status: new/assigned/in_progress → escalated)
```

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| /health | GET | Health check | None |
| /api/analyze | POST | AI complaint routing | None (frontend) |
| /api/check-sla | POST | Escalate overdue issues | Service Role |

---

## Next Steps (Optional Future)

- Automated SLA check (cron job instead of manual button)
- Email/SMS notifications on escalation
- SLA deadline adjustment UI
- Escalation reason tracking
- Historic escalation reports
