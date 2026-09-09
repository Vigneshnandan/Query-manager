# Network Testing Setup — Complete ✅

## ✨ Features Implemented

### 1. Real-Time Live Updates
- **DepthDashboard** (`/depthead/dashboard`):
  - Supabase Realtime subscription to `issues` table
  - Auto-refetch when any issue changes
  - Transient "New complaint received" banner (3 seconds) when new issue added to department
  - Banner positioned top-right, signal-colored with pulse animation
  - Subscription cleans up on component unmount

- **OfficerDashboard** (`/officer/dashboard`):
  - Supabase Realtime subscription to `issues` table
  - Auto-refetch when assigned issues change
  - Maintains sorting: unresolved first, then by SLA deadline
  - Subscription cleans up on component unmount

### 2. Configurable API Base URL
- **New file**: `frontend/src/config.ts`
  - Exports `API_BASE_URL` from `VITE_API_BASE_URL` env var
  - Falls back to `http://localhost:4000` if not set
  
- **Updated files**:
  - `CitizenSubmit.tsx` → `${API_BASE_URL}/api/analyze`
  - `DepthDashboard.tsx` → `${API_BASE_URL}/api/check-sla`
  - `OfficialIssueOrder.tsx` → `${API_BASE_URL}/api/analyze`

- **Updated `.env.example`**:
  - Added `VITE_API_BASE_URL=http://localhost:4000`

### 3. Backend Network Setup
- **server.ts**:
  - Changed `app.listen(PORT)` → `app.listen(PORT, "0.0.0.0", ...)`
  - Now listens on all network interfaces (reachable from other devices)
  - PORT converted to number: `parseInt(process.env.PORT || "4000", 10)`
  - CORS already configured: `app.use(cors())` with no origin restrictions

### 4. Build Status
```
✓ Frontend: 92 modules, 493.93 kB JS (gzipped: 136.98 kB)
✓ Backend: TypeScript compiles without errors
✓ Ready for network testing
```

---

## 📱 Testing Instructions — Follow These Steps Manually

### Prerequisites
- Both frontend and backend dev servers should NOT be running yet
- Your laptop and phone connected to the same Wi-Fi network
- Frontend built and backend ready to start

---

### Step 1: Find Your Laptop's Local Network IP Address

**On Mac:**
1. Click Apple menu → System Settings
2. Click Wi-Fi
3. Click "Details..." next to your connected network
4. Find "IPv4 Address" (format: `192.168.x.x`)
5. Note this IP address

**On Windows:**
1. Open Command Prompt or PowerShell
2. Run: `ipconfig`
3. Look for "Wireless LAN adapter Wi-Fi" or "Ethernet adapter"
4. Find "IPv4 Address:" (format: `192.168.x.x`)
5. Note this IP address

**Example IP:** `192.168.1.42`

---

### Step 2: Update Frontend Configuration

1. Open `/frontend/.env` in your editor
2. Add or update this line:
   ```
   VITE_API_BASE_URL=http://<your-ip>:4000
   ```
   Replace `<your-ip>` with the IP from Step 1
   
   **Example:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   VITE_API_BASE_URL=http://192.168.1.42:4000
   ```
3. Save the file

---

### Step 3: Restart Dev Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
You should see: `Server is running on http://0.0.0.0:4000`

**Terminal 2 — Frontend (with network access):**
```bash
cd frontend
npm run dev -- --host
```
You should see output showing both `localhost:5173` and your IP like `192.168.1.42:5173`

---

### Step 4: Test on Your Phone

1. **Connect phone to Wi-Fi:**
   - Go to Settings → Wi-Fi
   - Connect to the same network as your laptop
   - Verify the Wi-Fi network name matches

2. **Open frontend in phone browser:**
   - Open Safari (iOS) or Chrome (Android)
   - Type in address bar: `http://<your-ip>:5173`
   - Example: `http://192.168.1.42:5173`
   - Press Enter

3. **You should see the login page** ✅

---

### Step 5: Test the Full Workflow

**On your phone:**
1. Click "Don't have an account? Sign up"
2. Enter:
   - Name: "Mobile Tester"
   - Email: "mobile@example.com"
   - Password: "test123456"
   - Role: **Citizen** (required for this test)
3. Click "Sign Up"
4. Click "File New Complaint"
5. Enter complaint text:
   ```
   The water pump on Main Street is broken and needs urgent repair.
   Also, the streetlight at the intersection is flickering.
   ```
6. Click "Submit Complaint"
7. **Wait for the ticket to be created and routed** (this calls the backend API with your laptop's IP)

**On your laptop:**
1. Open a new browser tab
2. Go to `http://localhost:5173`
3. Sign up or login as a Dept Head:
   - Email: `depthead-water@demo.com`
   - Password: `demo123456`
4. **WITHOUT refreshing the page**, watch for a transient banner saying "New complaint received" to appear in the top-right corner
5. The issue list should automatically update with the new Water complaint from your phone
6. You should see the new complaint appear without manually refreshing ✅

---

### Success Criteria ✅

All of these should happen:
- [ ] Phone successfully connects to frontend at `http://<ip>:5173`
- [ ] Phone can login and see the citizen dashboard
- [ ] Phone can file a multi-issue complaint
- [ ] Backend receives the complaint (check backend terminal for logs)
- [ ] Laptop dept head dashboard receives the "New complaint received" banner
- [ ] Laptop dashboard auto-updates with the new issue from phone
- [ ] **No manual refresh needed** on laptop — live update works!

---

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Phone can't reach `http://<ip>:5173` | Verify IP is correct, both devices on same Wi-Fi, firewall allows port 5173 |
| Backend API errors on phone submit | Check VITE_API_BASE_URL is correct in frontend/.env, backend listening on 0.0.0.0:4000 |
| Dept head dashboard doesn't update | Check backend console for Realtime subscription errors, refresh page manually to verify data loaded |
| No "New complaint received" banner | Banner only shows for new issues in the dept head's department; check issue was routed correctly |

---

### What's Happening Behind the Scenes

1. **Phone submits complaint** → Frontend sends to `http://192.168.1.42:4000/api/analyze`
2. **Backend analyzes** → Groq AI extracts issues, routed to departments
3. **Supabase notified** → Issues inserted into database
4. **Realtime triggered** → Laptop's subscription fires
5. **Refetch runs** → Dept head dashboard auto-fetches new issues
6. **UI updates** → Banner shows + issue appears in list
7. **No refresh needed** ✅

---

## 📊 Summary of Changes

| File | Change | Purpose |
|------|--------|---------|
| `frontend/src/config.ts` | New file | Export configurable API base URL |
| `frontend/.env` | Update | Add `VITE_API_BASE_URL` |
| `frontend/.env.example` | Update | Document env var |
| `CitizenSubmit.tsx` | Edit | Use API_BASE_URL instead of hardcoded URL |
| `DepthDashboard.tsx` | Edit | Use API_BASE_URL + add Realtime subscription + notification banner |
| `OfficerDashboard.tsx` | Edit | Use API_BASE_URL (existing) + add Realtime subscription |
| `OfficialIssueOrder.tsx` | Edit | Use API_BASE_URL instead of hardcoded URL |
| `backend/server.ts` | Edit | Listen on 0.0.0.0, parse PORT to number |

---

## 🎯 Architecture

```
┌─────────────────────────┐
│    Phone (Wi-Fi)        │
│  http://192.168.1.42:5173
│    React Frontend       │
│  (VITE_API_BASE_URL)    │
└────────┬────────────────┘
         │ POST /api/analyze
         │ (to http://192.168.1.42:4000)
         ▼
┌─────────────────────────┐
│  Laptop Backend         │
│  0.0.0.0:4000          │
│  Express + Groq AI     │
└────────┬────────────────┘
         │ INSERT issues
         ▼
┌─────────────────────────┐
│   Supabase Database     │
│   PostgreSQL + Realtime │
└────────┬────────────────┘
         │ Realtime notification
         ▼
┌─────────────────────────┐
│  Laptop Frontend        │
│  Realtime Subscription  │
│  Auto-refetch + Update  │
│  "New complaint"  banner│
└─────────────────────────┘
```

---

**Network testing setup ready!** 🚀
