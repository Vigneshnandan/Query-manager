# Testing Dept Head Features

## Quick Start

### Prerequisites
Both servers running:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Frontend at: `http://localhost:5173`

---

## Test Scenario 1: Dept Head Signup

**Steps:**
1. Go to `http://localhost:5173/login`
2. Click "Don't have an account? Sign up"
3. Fill form:
   - **Full Name:** `John Smith`
   - **Role:** `Department Head` (dropdown)
   - **Department:** `Water` (appears after role selection)
   - **Email:** `john@example.com`
   - **Password:** `test123`
4. Click "Create Account"
5. See success message
6. Click toggle to login mode
7. Login with same email/password
8. **Should redirect to** `/depthead/dashboard` ✅

---

## Test Scenario 2: Officer Assignment

**Prerequisites:**
- Create a citizen complaint (see CITIZEN_PAGES.md)
- Complaint gets split into issues (e.g., 2 issues for Water dept)
- Both issues visible in dept head dashboard

**Steps:**
1. Login as dept head (Water department)
2. See 2 issues in dashboard
3. Click dropdown on first NEW issue
4. **See officers list with workload:**
   ```
   - Officer A (0 active)
   - Officer B (2 active)
   - Officer C (1 active)
   ```
5. Select Officer A
6. Click "Assign"
7. **Issue updates:**
   - Status changes to "assigned" (blue badge)
   - "Assign Officer" button disappears
   - SLA deadline shows (48 hours from now)
8. Officer A workload increased to (1 active) if you reassign other issue

---

## Test Scenario 3: SLA Overdue Badge

**Manual Test:**
1. Manually update issue in Supabase to past deadline:
   - Go to Supabase Dashboard → Table Editor → Issues
   - Find an assigned issue
   - Change `sla_deadline` to a past date (e.g., 2 days ago)
   - Refresh browser
2. **Red "SLA Overdue" badge appears** ✅

**Automatic Test:**
- Wait 48+ hours after assignment (not practical for demo)
- Or manually set deadline in database as above

---

## Test Scenario 4: Role-Based Redirect

**Test for each role:**

### Citizen
- Signup as: Role = `Citizen`
- After login → redirects to `/citizen/tickets` ✅

### Dept Head
- Signup as: Role = `Department Head`, Department = `Electricity`
- After login → redirects to `/depthead/dashboard` (Electricity Dept) ✅

### Officer
- Signup as: Role = `Officer`
- After login → redirects to `/officer/dashboard` ✅

### Official
- Signup as: Role = `Official`
- After login → redirects to `/official/issue-order` ✅

---

## Test Data Setup

**For complete testing, create:**

1. **One Citizen** (to file complaints)
2. **One Dept Head** (to assign issues)
   - Department: Water
3. **Two Officers** (to show workload comparison)
   - Both same department as Dept Head (Water)
   - Names: "Alice Officer", "Bob Officer"
4. **Multi-issue Complaint** from Citizen
   - Text: "No water supply AND road has pothole"
   - Should split into: Water + Roads issues

**Then:**
- Dept head sees Water issue
- Can assign to Alice or Bob (with workload showing)
- SLA deadline set automatically
- After 48+ hours, red badge appears (if you change database time)

---

## Expected UI Elements

### Dept Head Dashboard
- [ ] Header: "Department Dashboard" + department name
- [ ] Logout button (top right)
- [ ] Cards for each issue with:
  - [ ] Department name + status badge
  - [ ] Issue text (full text visible)
  - [ ] Priority, Deadline, SLA Deadline
  - [ ] "Assign Officer" control for NEW issues only
  - [ ] Red "SLA Overdue" badge if past deadline

### Officer Dropdown
- [ ] Shows officers from same department only
- [ ] Shows workload count: `(N active)`
- [ ] N = count of issues with status in [assigned, in_progress]
- [ ] Can only see officers from your department

### Status Updates
- [ ] Issue status changes immediately after assignment
- [ ] No page refresh needed
- [ ] Officer workload counts update in real-time

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Department dropdown not showing | Role not set to dept_head | Make sure to select "Department Head" role first |
| Redirect to /citizen/tickets after login | Wrong role stored | Re-signup with dept_head role |
| Officers list is empty | No officers in same department | Create officer account with same department |
| SLA Overdue badge not showing | Deadline in future | Manually set to past date in Supabase |
| Assignment button disabled | No officer selected | Select an officer from dropdown first |

---

## Verification Checklist

- [ ] Dept head signup works with department selection
- [ ] Login redirects to correct dashboard based on role
- [ ] Dashboard shows only issues for dept head's department
- [ ] Officer dropdown shows workload counts
- [ ] Assignment sets correct status/SLA/officer
- [ ] SLA overdue badge appears when deadline passes
- [ ] All role redirects working (citizen/officer/official/dept_head)
