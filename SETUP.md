# Project Setup Guide

## TASK 1: Database Schema (Supabase)

### Instructions to Apply the Schema

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard: https://app.supabase.com
   - Click on "SQL Editor" in the left sidebar
   - Click "New query" to create a new SQL query

2. **Copy and paste the schema**
   - Open the file: `/backend/sql/schema.sql`
   - Copy the entire contents
   - Paste it into the Supabase SQL Editor

3. **Execute the schema**
   - Click the "Run" button (or press Ctrl+Enter)
   - Wait for the query to complete successfully
   - You should see three tables created: `profiles`, `tickets`, and `issues`

4. **Verify the setup**
   - In Supabase, navigate to "Table Editor"
   - Confirm you can see the three tables: profiles, tickets, issues
   - Each table should have the correct columns and constraints

### Important Notes
- The SQL file enables pgcrypto extension for UUID generation
- Row Level Security (RLS) is enabled on all tables
- **WARNING:** The RLS policies are intentionally permissive for hackathon/demo purposes
  - They allow ALL authenticated users to perform ALL actions
  - DO NOT use this configuration in production
  - Implement proper per-user and per-role policies for real applications

---

## TASK 2: Groq API Configuration & Testing

### Prerequisites
- GROQ_API_KEY: Get this from https://console.groq.com/keys
- SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY: Available in your Supabase dashboard

### Step 1: Set up environment variables

**Create `/backend/.env` file** with:
```
GROQ_API_KEY=your_groq_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=4000
```

### Step 2: Start the backend server

From the project root, run:
```bash
cd backend
npm run dev
```

You should see:
```
Server is running on port 4000
```

The server is now ready to receive requests at http://localhost:4000

### Step 3: Run the test script (in a new terminal)

While the server is running, open a **new terminal/command prompt** and run:
```bash
cd backend
npx ts-node test-analyze.ts
```

### Expected Output

The test script will send 3 example complaints to the `/api/analyze` endpoint:

1. **Test 1**: "There is no water supply in our street for 5 days, also the road has had a huge pothole for 3 months"
   - Expected: 2 issues (Water + Roads departments)

2. **Test 2**: "Street lights on MG road have not worked for 2 weeks, please fix urgently"
   - Expected: 1 issue (Electricity department, high priority)

3. **Test 3**: "My ration card correction request filed last month at the Revenue office is still pending, and there's also garbage piling up uncollected near our house"
   - Expected: 2 issues (Revenue + Sanitation departments)

Each issue should show:
- Department classification
- Extracted issue text
- Priority level (low/medium/high)
- Deadline (if mentioned in the complaint)

---

## API Endpoint: POST /api/analyze

### Request
```json
{
  "text": "Citizen complaint or government order text"
}
```

### Response
```json
{
  "issues": [
    {
      "department": "Water",
      "issue_text": "No water supply in our street",
      "deadline": null,
      "priority": "high"
    },
    {
      "department": "Roads",
      "issue_text": "Huge pothole on street",
      "deadline": null,
      "priority": "medium"
    }
  ]
}
```

### Key Features
- Uses Groq's `llama-3.3-70b-versatile` model
- Implements tool calling to force structured JSON responses
- Automatically validates and maps department values to valid departments
- Retries once on transient Groq API failures
- Comprehensive error handling and logging

---

## Troubleshooting

### "GROQ_API_KEY environment variable is not set"
- Make sure you created `/backend/.env` with the correct API key
- The file must be in the backend directory (not in frontend)

### "Server is running on port 4000" but test script fails to connect
- Ensure the backend server is running: `npm run dev` in the backend directory
- Check that port 4000 is not already in use

### "Failed to connect to Groq API"
- Verify your GROQ_API_KEY is valid at https://console.groq.com
- Check your internet connection

### Test script shows wrong department classification
- This is expected for novel phrasing; the model does its best with mapping
- The `mapDepartmentToValid` function handles common variations
- Warnings will be logged for unmapped departments

---

## Development Commands

```bash
# Terminal 1: Backend dev server with hot reload
cd backend
npm run dev

# Terminal 2: Test the analyze endpoint
cd backend
npx ts-node test-analyze.ts

# Building for production
cd backend && npm run build
cd frontend && npm run build
```
