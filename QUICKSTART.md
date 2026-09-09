# ⚡ Quick Start Demo Guide

## 🎯 Start Here (5 minutes)

### Step 1: Ensure Servers Are Running

```bash
# Terminal 1 - Backend
cd backend && npm run dev
# Should show: "Server running on port 4000"

# Terminal 2 - Frontend  
cd frontend && npm run dev
# Should show: "Local: http://localhost:5173"
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Demo Credentials

All demo accounts use password: **`demo123456`**

### Citizen
- Email: `citizen@demo.com`
- Can file complaints and track them

### Department Heads (one per department)
- Email: `depthead-water@demo.com` → **Water Department**
- Email: `depthead-electricity@demo.com` → **Electricity Department**  
- Email: `depthead-sanitation@demo.com` → **Sanitation Department**

### Officers (one per department)
- Email: `officer-water@demo.com` → **Water Department**
- Email: `officer-electricity@demo.com` → **Electricity Department**
- Email: `officer-sanitation@demo.com` → **Sanitation Department**

---

## 🎬 Demo Scenario 1: AI Routing in Action (5 min)

### What You'll See
A single citizen complaint automatically split into 3 department-specific issues by AI.

### Steps

1. **Login as Citizen**
   - Email: `citizen@demo.com`
   - Password: `demo123456`
   - Click "My Tickets"

2. **View Pre-Loaded Complaint**
   - Sample complaint: *"There is no water supply in our street for 5 days, also the street lights on MG road have not worked for 2 weeks, and the drainage is clogged"*
   - Click the ticket to see details

3. **See AI-Routed Issues**
   - **Water Department**: "No water supply..." (high priority)
   - **Electricity Department**: "Street lights..." (high priority)
   - **Sanitation Department**: "Drainage is clogged" (medium priority)

✨ **Magic**: One citizen complaint → 3 separate department workflows

---

## 🎬 Demo Scenario 2: Officer Workflow (7 min)

### What You'll See
An officer receiving an assignment, starting work, uploading a photo, and marking it resolved.

### Steps

1. **Login as Officer**
   - Email: `officer-water@demo.com`
   - Password: `demo123456`
   - See dashboard with "Water Department" issues

2. **View Assigned Issue**
   - You should see 1 issue: **"No water supply in our street for 5 days"**
   - Status badge: **Blue "assigned"**
   - Shows "48h left" (SLA deadline)

3. **Start Work**
   - Click the issue to open detail page
   - Click **"Start Work"** button
   - Status changes to **Orange "in_progress"**

4. **Upload Resolution Photo** (Optional)
   - Choose any image file from your computer
   - Click "Upload Photo"
   - Photo URL appears in the form

5. **Mark Resolved**
   - Click **"Mark Resolved"** button
   - Issue is now **Green "resolved"**
   - Appears at bottom of dashboard

✨ **Magic**: Full issue lifecycle from assignment to resolution in under a minute!

---

## 🎬 Demo Scenario 3: SLA Escalation (3 min)

### What You'll See
Automatic escalation of overdue issues when SLA deadline passes.

### Steps

1. **Login as Dept Head**
   - Email: `depthead-water@demo.com`
   - Password: `demo123456`
   - See "Water Department" dashboard

2. **Find Overdue Issue**
   - You should see 1 issue with a **red "SLA Overdue"** badge in top-right
   - This is the Water issue that's past its 48h deadline
   - Status shows: **"assigned"** (blue)

3. **Trigger SLA Escalation**
   - Click **"Run SLA Check"** button (amber/yellow, top-right)
   - Button shows "Checking..." while processing
   - Success message appears: ✓ "SLA check complete. 1 issue(s) escalated."

4. **See Issue Escalated**
   - Page auto-refreshes
   - Issue status changes from **Blue "assigned"** → **Red "escalated"**
   - Red "SLA Overdue" badge disappears (no longer needed)

✨ **Magic**: With one click, overdue issues are escalated and flagged for management attention!

---

## 🎬 Demo Scenario 4: Create New Complaint (5 min)

### What You'll See
Filing a new multi-issue complaint and watching AI split it automatically.

### Steps

1. **Login as Citizen**
   - Email: `citizen@demo.com`
   - Password: `demo123456`

2. **File New Complaint**
   - Click **"+ File New Complaint"** button
   - Fill the form with a multi-issue complaint, e.g.:
     ```
     The street lights on Highway 1 haven't worked for 3 weeks.
     Also, the pothole on Main Street is getting worse and 
     needs to be fixed urgently. The garbage is not being 
     collected from our area since last Tuesday.
     ```
   - Optional: Add location and photo
   - Click **"Submit"**

3. **AI Analyzes & Routes**
   - Backend calls Groq AI to extract issues
   - Creates 3 issues across departments:
     - **Electricity**: Street lights
     - **Roads**: Pothole repair
     - **Sanitation**: Garbage collection

4. **View Tracking Page**
   - See all 3 routed issues
   - Each shows department, status, priority
   - Automatic routing complete!

✨ **Magic**: Citizen writes once → System automatically routes to 3+ departments!

---

## 🎬 Demo Scenario 5: Government Official Issues Order (5 min)

### What You'll See
An official creating a government order with deadline, automatically routed to departments.

### Steps

1. **Create Official Account** (if not in seed data)
   - Go to `/login` 
   - Click "Don't have an account? Sign up"
   - Select **Role: Official** (no department needed!)
   - Fill name, email, password
   - Create account

2. **Issue Government Order**
   - Click **"Issue New Order"** button
   - Fill form:
     - **Description**: "Repair the main water pipeline by MG Road, install new street lighting, and clean all storm drains"
     - **Deadline**: Pick a date (required!)
     - **Location**: "MG Road area" (optional)
     - **Photo**: (optional)
   - Click **"Submit"**

3. **AI Routes Order**
   - Order split into 3 department issues:
     - **Water Department**: Pipeline repair
     - **Electricity Department**: Street lighting  
     - **Sanitation Department**: Drain cleaning
   - Each issue gets the official's deadline as context

4. **Track Order Progress**
   - Click "My Orders"
   - See order with all 3 routed issues
   - Track each department's progress

✨ **Magic**: Official issues one order → Automatically split to 3 departments with deadline context!

---

## 🔧 Troubleshooting

### Issue: Servers not responding
```bash
# Kill any existing process on port 4000/5173
lsof -ti:4000 | xargs kill -9  # macOS/Linux
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process  # Windows

# Restart servers
cd backend && npm run dev
cd frontend && npm run dev
```

### Issue: "Cannot find module" errors
```bash
cd backend && npm install && npm run build
cd frontend && npm install && npm run build
```

### Issue: Supabase connection fails
- Check `.env` files have correct SUPABASE_URL and keys
- Verify Supabase project is live and tables exist
- Check browser console for network errors

### Issue: AI Analysis returns empty
- Verify GROQ_API_KEY is set in backend `.env`
- Check backend logs for Groq API errors
- Retry the complaint submission

---

## 📊 What Gets Created During Seed

When you run `npm run seed` in backend:

```
✅ 1 Citizen (citizen@demo.com)
✅ 3 Dept Heads (one per department)
✅ 3 Officers (one per department)  
✅ 1 Sample Ticket (multi-issue complaint)
✅ 3 Issues (routed across departments)
✅ 1 Issue Pre-Assigned & Overdue (for SLA demo)
```

---

## 🎯 Next Steps After Demo

1. **Try filing your own complaint** - Use realistic multi-issue text
2. **Test department assignment** - Switch between dept_head and officer accounts
3. **Create a government order** - See AI routing with deadline context
4. **Explore the API** - Call `/api/analyze` with custom text
5. **Customize departments** - Add more departments to match your needs

---

## 📚 Learn More

- **Full documentation**: See `README.md`
- **Technical details**: See `CLAUDE.md`  
- **Feature specs**: See `OFFICIAL_PORTAL_AND_SLA.md`

---

## ✨ Key Takeaways

| Feature | How It Works |
|---------|-------------|
| **AI Routing** | Citizen writes once → AI extracts multiple issues → Auto-routed to departments |
| **SLA Tracking** | 48h deadline from officer assignment → Red badge when overdue → Dept head escalates with 1 click |
| **Role-Based Workflow** | Each role sees only their relevant work (citizen tickets, dept head issues, officer tasks) |
| **Photo Evidence** | Officers upload resolution photos → Stored in Supabase Storage → URL saved in database |
| **Real-Time Updates** | Changes in one role immediately visible in others (no page refresh needed) |

---

**Ready to demo?** Open http://localhost:5173 and login! 🚀
