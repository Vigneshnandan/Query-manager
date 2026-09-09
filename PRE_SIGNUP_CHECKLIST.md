# Pre-Signup Checklist ✅

Before you can sign up, verify these steps:

## 1. ✅ Supabase Database Schema

**Go to:** https://app.supabase.com → Your Project → SQL Editor

**Check if you have these 3 tables:**
- [ ] `profiles` table exists
- [ ] `tickets` table exists  
- [ ] `issues` table exists

**If tables are MISSING:**
1. Click "New query"
2. Open `/backend/sql/schema.sql` 
3. Copy ALL the SQL code
4. Paste into SQL editor
5. Click "Run"
6. Wait for success message

---

## 2. ✅ Environment Variables

**Backend `.env` (check `/backend/.env`):**
```
✅ GROQ_API_KEY=your_groq_api_key_here
✅ SUPABASE_URL=https://your-project.supabase.co
✅ SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
✅ PORT=4000
```

**Frontend `.env` (check `/frontend/.env`):**
```
✅ VITE_SUPABASE_URL=https://your-project.supabase.co
✅ VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 3. ✅ Supabase Storage Bucket

**Go to:** https://app.supabase.com → Your Project → Storage

**Check if bucket exists:**
- [ ] `complaint-photos` bucket exists
- [ ] It is set to **PUBLIC** (important!)

**If bucket is MISSING:**
1. Click "New bucket"
2. Name: `complaint-photos`
3. Set to **PUBLIC**
4. Create

---

## 4. ✅ Servers Running

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Look for: `Server is running on port 4000` ✅

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Look for: `Local: http://localhost:5173` ✅

---

## 5. ✅ Supabase Auth Setup

**Go to:** https://app.supabase.com → Your Project → Authentication → Providers

**Email/Password provider should be:**
- [ ] Enabled (toggle ON)
- [ ] Email Confirmations: OFF (for testing)

---

## Now You Can Sign Up! 🚀

1. Go to browser: `http://localhost:5173`
2. Click "Don't have an account? Sign up"
3. Fill in:
   - Full Name: `Vignesh N` ✓
   - Email: `your-email@example.com` ✓
   - Password: `any password` ✓
4. Click "Create Account"
5. Should say "Signup successful! Please log in..."
6. Then login with same credentials
7. You'll see "My Tickets" page

---

## If Still Getting "Failed to fetch"

1. Open **DevTools** (F12) → **Console** tab
2. Look for red error messages
3. Take screenshot and share the error

Common causes:
- ❌ Database schema not uploaded
- ❌ Supabase URL is invalid
- ❌ Auth provider not enabled
- ❌ Storage bucket not created
