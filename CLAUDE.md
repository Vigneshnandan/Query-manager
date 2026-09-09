# Project: Citizen Grievance & Government Order Auto-Routing System

## Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS, single app, role-based routing via react-router-dom
- Backend: Node.js + Express + TypeScript — minimal, only 2 endpoints (AI analysis, SLA check)
- Database/Auth/Storage: Supabase (Postgres, Supabase Auth, Supabase Storage)
- AI: Groq API via the official groq-sdk npm package, model "llama-3.3-70b-versatile", called ONLY from the backend using forced tool-calling for structured output — never expose GROQ_API_KEY to the frontend

## Folder structure
/frontend  - Vite React app
/backend   - Express API

## Roles (stored in profiles.role)
citizen | official | dept_head | officer

## Fixed department taxonomy (use exactly these everywhere, do not invent new ones)
Water, Electricity, Sanitation, Roads, Health, Revenue, Police

## Database tables (Supabase / Postgres)
profiles(id, name, role, department, created_at)
tickets(id, citizen_id, raw_text, photo_url, location, created_at)
issues(id, parent_ticket_id, department, issue_text, deadline, priority, assigned_officer_id, status, sla_deadline, resolution_photo_url, created_at, updated_at)

## Design System

### Color Tokens
- **ink**: #1A202C (dark text/primary)
- **paper**: #FFFFFF (background)
- **line**: #E2E8F0 (borders)
- **muted**: #718096 (secondary text)
- **signal**: #3182CE (links, active states)
- **dept-water**: #0EA5E9 (sky blue)
- **dept-electricity**: #FBBF24 (amber)
- **dept-sanitation**: #10B981 (emerald)
- **dept-roads**: #F97316 (orange)
- **dept-health**: #EC4899 (pink)
- **dept-revenue**: #8B5CF6 (purple)
- **dept-police**: #6B7280 (slate)
- **status-new**: #6366F1 (indigo)
- **status-assigned**: #3B82F6 (blue)
- **status-in_progress**: #F59E0B (amber)
- **status-resolved**: #10B981 (emerald)
- **status-escalated**: #EF4444 (red)

### Fonts
- **Display**: Fraunces, serif (weights 500, 600) — headings
- **Sans**: IBM Plex Sans, sans-serif (weights 400, 500, 600) — body text
- **Mono**: IBM Plex Mono, monospace (weight 400) — code

## Conventions
- TypeScript everywhere, strict mode on
- Supabase table/column names are snake_case
- Never commit .env files — use .env.example with placeholder values
- After writing code for any task, run the build/typecheck command for that part of the app and fix all errors before considering the task finished
- Keep components small, organized in /frontend/src/pages and /frontend/src/components
- Never let the backend crash on bad input — always wrap in try/catch and return a clear error response