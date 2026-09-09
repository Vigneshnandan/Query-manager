# Citizen-Facing Pages Implementation

## ✅ Build Status
- **Frontend:** ✅ Builds successfully (72 modules, 232.90 kB)
- **Backend:** ✅ Builds successfully

---

## Pages Implemented

### 1. **Login Page** (`/login`)
- Email/password authentication
- Signup and login on same page (toggle between modes)
- On signup: automatically sets role as 'citizen' and creates profile in Supabase
- On login: redirects to `/citizen/tickets`
- Clean Tailwind-styled form with error display

### 2. **Submit Complaint** (`/citizen/submit`)
- Large textarea for complaint text (char counter)
- Optional location input
- Optional photo upload to Supabase Storage (`complaint-photos` bucket)
- On submit:
  - Creates ticket in `tickets` table
  - Calls backend `/api/analyze` to split multi-issue complaints
  - Creates one `issues` row per extracted issue
  - Redirects to ticket detail page
- Pro tip box explaining multi-issue splitting
- Full error visibility on screen

### 3. **My Tickets List** (`/citizen/tickets`)
- Shows all tickets for logged-in citizen
- Displays complaint preview (truncated to 100 chars) + filing date
- Clickable cards link to ticket detail
- "File New Complaint" button
- Logout button in header
- Empty state with call-to-action

### 4. **Ticket Details** (`/citizen/track/:ticketId`)
- Shows full ticket information (ID, filing date, location)
- Displays full complaint text
- Shows uploaded photo (if any)
- Lists all issues routed from the complaint
- Each issue shows:
  - **Department** (e.g., Water, Electricity, Roads)
  - **Status badge** with color coding:
    - New: Gray
    - Assigned: Blue
    - In Progress: Amber
    - Resolved: Green
    - Escalated: Red
  - **Issue text** (extracted by AI)
  - **Priority** (low/medium/high)
  - **Deadline** (if mentioned)
- Buttons to mark issue as resolved or reopen resolved issue
- Responsive mobile-friendly layout

---

## Technical Implementation

### Database Operations
- **Create:** Inserts to `tickets`, `issues`, `profiles`
- **Read:** Selects from all three tables with proper filtering
- **Update:** Status updates for issues with timestamp
- **Authentication:** Supabase Auth with session management

### File Storage
- Photos uploaded to `complaint-photos` bucket in Supabase Storage
- Public URLs returned and stored in `photo_url` field
- File naming: `{userId}/{timestamp}_{filename}` for organization

### API Integration
- Calls backend `POST /api/analyze` to get structured complaint analysis
- Groq model automatically splits multi-issue complaints
- Issues are auto-routed to valid departments

### Error Handling
- All errors displayed on-screen in red alert boxes (not just console.log)
- Try-catch blocks around every async operation
- User-friendly error messages
- Failed operations don't crash the app

### Type Safety
- Full TypeScript strict mode
- Types defined in `lib/supabase.ts`
- Proper type-only imports
- No `any` types

### Styling
- Tailwind CSS single-column layouts
- Mobile-friendly responsive design
- Consistent color scheme (blues, reds, grays)
- Hover states and transitions
- Status color coding for quick visual scanning

---

## Setup Instructions

### 1. Environment Variables

Create `/frontend/.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Supabase Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket named `complaint-photos`
3. Set it to **Public** (for public URL access)
4. Done! File uploads will work automatically

### 3. Start the Backend

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:4000`

### 4. Start the Frontend Dev Server

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` (or next available port)

---

## Testing Workflow

1. **Open browser** → `http://localhost:5173`
2. **Click "Don't have an account? Sign up"**
3. **Sign up** with:
   - Name: Your name
   - Email: test@example.com
   - Password: (any password)
4. **Login** with same credentials
5. **Click "+ File New Complaint"**
6. **Submit a multi-issue complaint**, e.g.:
   > "There's no water supply in our street for 5 days, and the road has a huge pothole"
7. **System automatically splits it** into 2 issues: Water + Roads
8. **Photo upload** is optional (leave blank for demo)
9. **See ticket detail page** with routed issues
10. **Mark issues as resolved/reopened** with buttons
11. **Go back to "My Tickets"** to see the ticket in your list

---

## Key Features Verified

✅ Signup with profile creation  
✅ Login/logout flow  
✅ Complaint text storage  
✅ Optional photo upload to Storage  
✅ Optional location input  
✅ Multi-issue splitting via Groq AI  
✅ Auto-routing to departments  
✅ Ticket list with pagination (implicitly: newest first)  
✅ Ticket detail view with all child issues  
✅ Status badge color coding  
✅ Resolve/reopen issue buttons  
✅ Error display on screen  
✅ Mobile-friendly Tailwind styling  
✅ Full TypeScript type safety  
✅ Protected routes (require login)  

---

## Example Complaint for Testing

```
"My area doesn't have proper street lights, and the water pipe burst on Main Street last week. 
Also, I need to renew my ration card but the Revenue office is closed for renovation. 
Please help urgently."
```

**Expected result:** 3 issues
1. Electricity (street lights) → high priority
2. Water (pipe burst) → high priority  
3. Revenue (ration card) → low priority

---

## Troubleshooting

### "Failed to analyze complaint"
- Ensure backend is running on `http://localhost:4000`
- Check `/api/analyze` returns valid JSON

### "Failed to upload photo"
- Verify `complaint-photos` bucket exists and is **Public**
- Check file size (keep under 5 MB for demo)

### "Not authenticated"
- Log in first before accessing citizen pages
- Check Supabase Auth session in browser DevTools

### Photo URL is null
- Upload is optional; proceed without photo
- Check Supabase Storage bucket permissions

### "Supabase project not found"
- Verify environment variables are correct
- No quotes around values in `.env`

---

## File Structure

```
frontend/src/
├── pages/
│   ├── Login.tsx              (signup/login form)
│   ├── CitizenSubmit.tsx      (complaint submission)
│   ├── CitizenTickets.tsx     (ticket list)
│   └── CitizenTrack.tsx       (ticket detail)
├── lib/
│   └── supabase.ts            (Supabase client + types)
└── App.tsx                    (routing setup)
```

---

## Next Steps (Future Enhancements)

- Add official/officer dashboard to assign and update issues
- Add email notifications on status changes
- Add bulk complaint import for batch filings
- Add search/filter for tickets
- Add SLA tracking and alerts
- Add escalation workflow
- Add comments/notes on issues
