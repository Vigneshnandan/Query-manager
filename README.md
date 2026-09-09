# 🏛️ Citizen Grievance & Government Order Auto-Routing System

A full-stack application for intelligent complaint routing and government order management using AI-powered issue classification.

## 🎯 System Overview

This system enables:
- **Citizens** to file grievances about government services (water, electricity, sanitation, etc.)
- **Officials** to issue government orders with automatic deadline-aware routing
- **Department Heads** to assign issues to officers and track SLA compliance
- **Officers** to resolve issues with photo evidence
- **AI-Powered Routing** using Groq AI to intelligently split multi-issue complaints into department-specific tasks
- **Automatic SLA Escalation** for overdue issues

## 🏗️ Architecture

### Frontend (React + Vite + TypeScript + Tailwind CSS)
- **Location**: `/frontend`
- **Port**: `http://localhost:5173`
- **Role-based routing**: Separate dashboards for each user role
- **Supabase Auth & Storage** integration for authentication and photo uploads

### Backend (Express + TypeScript)
- **Location**: `/backend`
- **Port**: `http://localhost:4000`
- **API Endpoints**: 
  - `POST /api/analyze` - Groq AI complaint analysis
  - `POST /api/check-sla` - Manual SLA escalation trigger
  - `GET /health` - Health check

### Database (Supabase PostgreSQL)
- **Tables**:
  - `profiles` - User accounts and roles
  - `tickets` - Citizen complaints and official orders
  - `issues` - Individual department-routed items

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account (for database & auth)
- Groq API key

### 1. Setup Environment Variables

**Backend** (`/backend/.env`):
```
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=4000
```

**Frontend** (`/frontend/.env`):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 3. Build Both Apps

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### 4. Populate Demo Data

```bash
cd backend
npm run seed
```

This creates:
- 1 Citizen account (citizen@demo.com)
- 3 Department Heads (one per department)
- 3 Officers (one per department)
- 1 sample complaint split into 3 issues
- One issue pre-assigned and overdue (for SLA demo)

### 5. Start Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173` in your browser.

## 👥 User Roles & Workflows

### 1. **Citizen** 
Workflow: File Complaint → Track Status → View Resolution

**Pages**:
- `/login` - Signup/login
- `/citizen/tickets` - List your complaints
- `/citizen/submit` - File new complaint
- `/citizen/track/:ticketId` - View complaint details and routed issues

**Demo**:
1. Login as `citizen@demo.com / demo123456`
2. Click "View Tickets" to see pre-populated sample complaint
3. Click on ticket to see AI-routed issues across departments

---

### 2. **Department Head**
Workflow: Review Issues → Assign to Officer → Track SLA

**Pages**:
- `/depthead/dashboard` - View all issues in your department
- Officer assignment dropdown with workload counts
- "Run SLA Check" button to escalate overdue issues

**Demo**:
1. Login as `depthead-water@demo.com / demo123456`
2. See the Water department's issues
3. See one pre-assigned issue marked "SLA Overdue" (red badge)
4. Click "Run SLA Check" button → Issue status changes to "escalated" ✨

---

### 3. **Officer**
Workflow: Review Assigned Issues → Start Work → Upload Photo → Mark Resolved

**Pages**:
- `/officer/dashboard` - List assigned issues (sorted by SLA deadline)
- `/officer/ticket/:issueId` - Issue detail page with action buttons
  - **Assigned** → "Start Work" button
  - **In Progress** → "Upload Photo" + "Mark Resolved" buttons
  - **Resolved** → Confirmation view

**Demo**:
1. Login as `officer-water@demo.com / demo123456`
2. See the Water issue pre-assigned to you
3. Click "Start Work" → Status changes to "in_progress"
4. Upload a photo of resolution
5. Click "Mark Resolved" → Issue marked complete ✅

---

### 4. **Official** (Government)
Workflow: Issue Government Order → Route to Departments → Track Progress

**Pages**:
- `/official/tickets` - List issued orders
- `/official/issue-order` - Create new government order (with required deadline)
- `/official/track/:ticketId` - View order details and department routing

**Demo**:
1. Create official account (no department required)
2. Click "Issue New Order"
3. Enter description + required deadline date + optional location/photo
4. AI analyzes and routes to relevant departments
5. Track order progress as departments work on it

---

## 🤖 AI-Powered Routing

The system uses **Groq AI** (via openai/gpt-oss-120b model) to:

1. **Parse multi-issue complaints** - Citizen writes one ticket about multiple problems
2. **Extract structured data**:
   - `department` - Which department should handle this (Water, Electricity, Sanitation, etc.)
   - `issue_text` - Clean description of the problem
   - `priority` - high/medium/low
   - `deadline` - Optional date extracted from complaint text
3. **Create individual issues** - Each extracted issue becomes a separate workflow item

### Example

**Citizen complaint**: 
> "There's no water supply in our street for 5 days AND the street lights on MG Road have not worked for 2 weeks. Also, the drainage is clogged."

**AI extracts 3 issues**:
1. **Water Department**: "No water supply in our street for 5 days" (priority: high)
2. **Electricity Department**: "Street lights on MG Road have not worked for 2 weeks" (priority: high)
3. **Sanitation Department**: "Drainage is clogged" (priority: medium)

---

## ⏰ SLA Escalation System

### How It Works

1. **On Officer Assignment** (by Dept Head)
   - `sla_deadline` set to 48 hours from now
   - Issue status: `new` → `assigned`

2. **Officer Works** 
   - Status: `assigned` → `in_progress` (when starting work)
   - Status: `in_progress` → `resolved` (when marking complete with photo)

3. **SLA Check** (Manual trigger by Dept Head)
   - Click "Run SLA Check" button
   - Backend finds all issues where `sla_deadline < now()` AND status in (new/assigned/in_progress)
   - Updates them to status `escalated`
   - Issues with `escalated` status show red badge

### Demo Setup

The seed script pre-creates one overdue issue:
- **Water issue** assigned to Water Officer
- **SLA deadline** = 1 hour ago
- **Status** = assigned

**Quick escalation demo**:
1. Login as Water Dept Head
2. See Water issue with red "SLA Overdue" badge
3. Click "Run SLA Check"
4. Watch status change to "escalated"

---

## 📊 Database Schema

### profiles
```
id                UUID (from auth)
name              TEXT
role              TEXT (citizen | official | dept_head | officer)
department        TEXT (Water | Electricity | Sanitation | Roads | Health | Revenue | Police)
                  Required for dept_head & officer, NULL for citizen & official
created_at        TIMESTAMP
```

### tickets
```
id                UUID
citizen_id        UUID (who filed complaint / issued order)
raw_text          TEXT (original complaint or order text)
photo_url         TEXT (optional photo from Supabase Storage)
location          TEXT (optional location)
created_at        TIMESTAMP
```

### issues
```
id                UUID
parent_ticket_id  UUID (links to tickets)
department        TEXT (where this issue is routed)
issue_text        TEXT (problem description)
deadline          TIMESTAMP (optional deadline extracted from complaint)
priority          TEXT (high | medium | low)
assigned_officer_id UUID (officer assigned to this issue)
status            TEXT (new | assigned | in_progress | resolved | escalated)
sla_deadline      TIMESTAMP (48h from assignment, used for escalation)
resolution_photo_url TEXT (photo uploaded during resolution)
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

---

## 🔑 API Endpoints

### POST /api/analyze
Analyzes complaint text and routes to departments.

**Request**:
```json
{
  "text": "There is no water supply in our street for 5 days, also the street lights on MG road have not worked for 2 weeks, and the drainage is clogged"
}
```

**Response**:
```json
{
  "issues": [
    {
      "department": "Water",
      "issue_text": "No water supply in our street for 5 days",
      "priority": "high",
      "deadline": null
    },
    {
      "department": "Electricity",
      "issue_text": "Street lights on MG Road have not worked for 2 weeks",
      "priority": "high",
      "deadline": null
    },
    {
      "department": "Sanitation",
      "issue_text": "Drainage is clogged",
      "priority": "medium",
      "deadline": null
    }
  ]
}
```

---

### POST /api/check-sla
Escalates overdue issues (service role required).

**Request**: (empty body)
```json
{}
```

**Response**:
```json
{
  "escalated_count": 2,
  "escalated_ids": ["issue-id-1", "issue-id-2"]
}
```

---

### GET /health
Health check endpoint.

**Response**:
```json
{
  "status": "ok"
}
```

---

## 🗂️ File Structure

```
.
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── CitizenSubmit.tsx
│   │   │   ├── CitizenTickets.tsx
│   │   │   ├── CitizenTrack.tsx
│   │   │   ├── DepthDashboard.tsx
│   │   │   ├── OfficerDashboard.tsx
│   │   │   ├── OfficerTicket.tsx
│   │   │   ├── OfficialIssueOrder.tsx
│   │   │   ├── OfficialTickets.tsx
│   │   │   └── OfficialTrack.tsx
│   │   ├── components/
│   │   │   └── TopNav.tsx
│   │   ├── lib/
│   │   │   └── supabase.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env (not in repo)
│   ├── .env.example
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── server.ts
│   ├── seed-demo.ts
│   ├── .env (not in repo)
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── CLAUDE.md (project guidelines)
├── README.md (this file)
└── OFFICIAL_PORTAL_AND_SLA.md (feature details)
```

---

## ✅ Build Status

- **Frontend**: ✅ Builds successfully (78 modules, 489.58 kB gzipped)
- **Backend**: ✅ Builds successfully (TypeScript strict mode)
- **Seed Script**: ✅ Runs successfully, populates demo data
- **Both Servers**: ✅ Running on ports 5173 (frontend) and 4000 (backend)

---

## 🧪 Testing Checklist

### Citizen Flow
- [ ] Signup as citizen
- [ ] File complaint with multiple issues
- [ ] View complaint in ticket list
- [ ] Track individual routed issues
- [ ] Upload optional photo during filing

### Department Head Flow
- [ ] Signup as dept_head with department
- [ ] View issues for your department
- [ ] See officer workload counts
- [ ] Assign issue to officer
- [ ] See SLA deadline countdown
- [ ] Click "Run SLA Check" to escalate overdue issues

### Officer Flow
- [ ] Signup as officer with department
- [ ] View assigned issues sorted by SLA deadline
- [ ] Click issue → See "Start Work" button
- [ ] Start work → Status changes to in_progress
- [ ] Upload photo of resolution
- [ ] Mark resolved → Status changes to resolved

### Official Flow
- [ ] Signup as official (no department needed)
- [ ] Issue government order with required deadline
- [ ] View issued orders in ticket list
- [ ] Track order routing across departments

### SLA Escalation Demo
- [ ] Login as dept_head
- [ ] See pre-assigned overdue Water issue
- [ ] Issue shows red "SLA Overdue" badge
- [ ] Click "Run SLA Check" button
- [ ] Watch issue escalate to "escalated" status
- [ ] Status badge turns from orange to red

---

## 🔐 Security Notes

- `.env` files are never committed (add to `.gitignore`)
- Supabase Service Role Key only used server-side for SLA checks
- Frontend uses Supabase Anon Key (read/write limited by RLS)
- Groq API key never exposed to frontend
- Photo uploads stored in Supabase Storage with public URLs

---

## 📝 Convention Notes

- Department taxonomy: **Water, Electricity, Sanitation, Roads, Health, Revenue, Police**
- Status values: **new, assigned, in_progress, resolved, escalated**
- Priority values: **high, medium, low**
- Role values: **citizen, official, dept_head, officer**
- All timestamps in ISO 8601 format (UTC)

---

## 🚀 Deployment (Future)

1. Build both apps: `npm run build` in frontend & backend
2. Frontend: Deploy `/frontend/dist` to static hosting (Vercel, Netlify, etc.)
3. Backend: Deploy to Node.js host (Railway, Render, Heroku, etc.)
4. Supabase: Use hosted PostgreSQL (no changes needed)
5. Update environment variables on hosting platforms

---

## 📚 Additional Resources

- **CLAUDE.md** - Project guidelines and conventions
- **OFFICIAL_PORTAL_AND_SLA.md** - Detailed feature documentation
- **Groq API Docs** - https://console.groq.com/docs
- **Supabase Docs** - https://supabase.com/docs

---

## ✨ Built with Love

This system demonstrates:
- Full-stack TypeScript
- AI-powered intelligent routing
- Real-time SLA tracking
- Role-based access control
- File upload & storage
- Responsive UI with Tailwind CSS
- Service-oriented architecture

Happy grievance routing! 🎉
