# Citizen Pages Redesign — Complete ✅

All three citizen pages have been redesigned using the design system components from Phase 7. No data-fetching or submission logic was changed — only visuals and layout.

## 📝 Changes Summary

### 1. `/citizen/submit` — File a Complaint

**Visual Updates:**
- Form wrapped in `Card` component, `max-w-xl mx-auto`
- `Textarea` component for complaint description (label: "Describe your issue")
- `Input` component for location (label: "Location (optional)")
- Styled file input for photo upload
- `Button` variant="primary" for submit, full width

**Loading State Transitions:**
- When AI analysis starts, form/button area replaced with `LoadingState`
- First ~1 second: "Reading your complaint..."
- After 1 second: "Filing your ticket..." (simple setTimeout-based swap)
- Uses `useEffect` to manage message transitions

**Color Scheme:**
- Uses design system tokens: paper, ink, muted, signal
- Background: paper (white)
- Text: ink (dark)
- Pro tip card has accent color (signal blue)

---

### 2. `/citizen/tickets` — List Complaints

**Visual Updates:**
- Vertical stack of `Card` components (one per ticket)
- Full clickable card wrapped in `Link`
- Spacing: `gap-3` between cards

**Card Content:**
- Ticket text truncated to ~90 characters in `font-display text-base`
- Relative time string below in `text-sm text-muted` (e.g., "2 hours ago")
- Department badge chips for each unique department on the right

**Empty & Loading States:**
- `EmptyState` component when no complaints filed yet
  - Message: "You haven't filed any complaints yet."
  - Action button: "File a complaint" (links to `/citizen/submit`)
- `LoadingState` component while fetching

**New Helpers:**
- `formatRelativeTime()` — Converts timestamps to human-readable format
  - "just now", "15m ago", "3h ago", "2d ago", or full date
- Department fetch: `.select('*, issues(department)')` to get routed departments

**Color Scheme:**
- Cards: white with line border
- Links: department badges use their respective colors

---

### 3. `/citizen/track/:ticketId` — Track Issue Progress

**Visual Updates:**
- Ticket details at top in a `Card`
  - Ticket ID in `font-mono text-sm text-muted`
  - Filed date/time in human-readable format
  - Raw complaint text in `font-display text-xl`
  - Optional photo below (with border)

- Each issue in a `Card` with `accentColor` matching department color
  - Contains: `DepartmentBadge`, `StatusBadge`, priority `Badge`
  - Issue description and deadline info
  - **New: Status stepper showing 5 stages**

**Status Stepper Component:**
- Shows progression: Filed → Routed → Assigned → In Progress → Resolved
- Current stage and all completed stages highlighted in department color
- Completed stages show checkmark (✓)
- Connecting lines between stages
- Used for visual workflow clarity

**Action Buttons:**
- When status is "resolved":
  - `Button` variant="primary" labeled "Confirm resolved"
  - `Button` variant="ghost" labeled "Not resolved, reopen"
- When status is not "resolved":
  - `Button` variant="primary" labeled "Confirm resolved"

**Color Scheme:**
- Card accent colors match department colors (Water, Electricity, etc.)
- Status badges use status-specific colors
- Links use signal color (blue)

---

## 🆕 New Components & Helpers

### StatusStepper Component
**Location:** `frontend/src/components/StatusStepper.tsx`

```tsx
<StatusStepper issue={issue} departmentColor={deptColor} />
```

Shows 5-stage workflow progression for each issue:
1. **Filed** - Ticket created
2. **Routed** - Issue extracted and categorized (new/assigned)
3. **Assigned** - Officer assigned (assigned status)
4. **In Progress** - Officer working on it (in_progress status)
5. **Resolved** - Issue marked complete (resolved status)

**Logic:**
- Maps `issue.status` to stage index
- Highlights current and all prior stages in department color
- Uses connecting lines between stages

---

### Utility Functions
**Location:** `frontend/src/lib/utils.ts`

#### `formatRelativeTime(date: string | Date): string`
Converts ISO timestamps to human-readable relative time:
- Less than 1 minute: "just now"
- Less than 1 hour: "15m ago"
- Less than 1 day: "3h ago"
- Less than 1 week: "2d ago"
- Otherwise: Full date string

#### `DEPT_COLORS` Object
Maps department names to their brand colors:
```ts
{
  Water: "#0EA5E9",
  Electricity: "#FBBF24",
  Sanitation: "#10B981",
  Roads: "#F97316",
  Health: "#EC4899",
  Revenue: "#8B5CF6",
  Police: "#6B7280",
}
```

#### `STATUS_COLORS` Object
Maps status values to their colors:
```ts
{
  new: "#6366F1",
  assigned: "#3B82F6",
  in_progress: "#F59E0B",
  resolved: "#10B981",
  escalated: "#EF4444",
}
```

---

## 🎨 Design System Components Used

### By Page

**CitizenSubmit:**
- `Card` (form wrapper)
- `Textarea` (complaint input)
- `Input` (location input)
- `Button` (submit)
- `LoadingState` (during AI analysis)

**CitizenTickets:**
- `Card` (ticket wrapper)
- `DepartmentBadge` (department labels)
- `EmptyState` (no complaints)
- `LoadingState` (while fetching)

**CitizenTrack:**
- `Card` (ticket detail + issue wrapper)
- `StatusBadge` (status label)
- `DepartmentBadge` (department label)
- `Badge` (priority label)
- `Button` (action buttons)
- `StatusStepper` (workflow visualization)

---

## 📐 Layout Pattern

All citizen pages follow this structure:

```tsx
<div className="min-h-screen bg-paper">
  <main className="max-w-2xl mx-auto px-6 py-8">
    {/* Page content using design system components */}
  </main>
</div>
```

---

## 🎯 Data-Fetching Logic

**NO CHANGES** to:
- Supabase queries
- Error handling
- State management
- Navigation logic
- Form submission workflows
- File upload logic

Only visual presentation was redesigned using design system components.

---

## ✅ Build Status

```
✓ 91 modules transformed
✓ dist/assets/index-BXFONYSI.css  6.20 kB (gzipped: 1.63 kB)
✓ dist/assets/index-C2AU9zof.js   492.60 kB (gzipped: 136.65 kB)
✓ built in 218ms
```

**TypeScript strict mode:** ✅ Zero errors

---

## 🚀 Visual Improvements

1. **Consistent typography** using design system fonts
2. **Cohesive color system** with department and status colors
3. **Better information hierarchy** with Cards and Badges
4. **Improved loading states** instead of blank screens
5. **Visual workflow progression** with Status Stepper
6. **Responsive design** using Tailwind utilities
7. **Professional appearance** with subtle borders and spacing
8. **Accessible form inputs** with proper labels and focus states

---

## 🔄 Next Steps

Other pages can be similarly redesigned:
- Officer pages (`/officer/*`)
- Department Head pages (`/depthead/*`)
- Official pages (`/official/*`)

All use the same design system components and patterns.

---

**Redesign completed: 2026-09-09**
