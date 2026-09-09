# Design System

A cohesive design system for the Grievance Routing System, built with Tailwind CSS and custom React components.

## 🎨 Color Palette

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **ink** | `#1A202C` | Primary text, headings, buttons |
| **paper** | `#FFFFFF` | Page background |
| **line** | `#E2E8F0` | Borders, dividers |
| **muted** | `#718096` | Secondary text, labels |
| **signal** | `#3182CE` | Links, interactive states |

### Department Colors

| Department | Color | Hex |
|-----------|-------|-----|
| Water | `dept-water` | `#0EA5E9` (Sky Blue) |
| Electricity | `dept-electricity` | `#FBBF24` (Amber) |
| Sanitation | `dept-sanitation` | `#10B981` (Emerald) |
| Roads | `dept-roads` | `#F97316` (Orange) |
| Health | `dept-health` | `#EC4899` (Pink) |
| Revenue | `dept-revenue` | `#8B5CF6` (Purple) |
| Police | `dept-police` | `#6B7280` (Slate) |

### Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| New | `status-new` | `#6366F1` (Indigo) |
| Assigned | `status-assigned` | `#3B82F6` (Blue) |
| In Progress | `status-in_progress` | `#F59E0B` (Amber) |
| Resolved | `status-resolved` | `#10B981` (Emerald) |
| Escalated | `status-escalated` | `#EF4444` (Red) |

## 📝 Typography

### Font Stack

```css
font-display: "Fraunces", serif (weights: 500, 600)
font-sans: "IBM Plex Sans", sans-serif (weights: 400, 500, 600)
font-mono: "IBM Plex Mono", monospace (weight: 400)
```

### Usage

- **Display Font**: Page headings, section titles
- **Sans Font**: Body text, UI labels, descriptions
- **Mono Font**: Code blocks, terminal output

## 🧩 Components

All components are located in `/frontend/src/components/ui/` and can be imported from `ui/index.ts`.

### Button

A versatile button component with three variants.

```tsx
import { Button } from "../components/ui";

<Button variant="primary" onClick={handleClick}>
  Primary Action
</Button>

<Button variant="secondary" disabled>
  Secondary Action
</Button>

<Button variant="ghost">
  Ghost Action
</Button>
```

**Props:**
- `variant`: `"primary"` | `"secondary"` | `"ghost"` (default: `"primary"`)
- `children`: Button text
- All standard button HTML attributes supported

**Styling:**
- **primary**: bg-ink text-paper with hover state
- **secondary**: Bordered, text-ink, transparent background
- **ghost**: Text-signal with underline on hover

---

### Card

A container component with optional accent border.

```tsx
import { Card } from "../components/ui";

<Card accentColor="#0EA5E9">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

**Props:**
- `children`: Card content
- `accentColor`: Optional hex color for left border

**Styling:**
- White background with line border
- 4px left border when accentColor provided
- Rounded corners, subtle shadow

---

### Badge

A small pill-shaped label with colored text and tinted background.

```tsx
import { Badge } from "../components/ui";

<Badge label="High Priority" color="#EF4444" />
<Badge label="Water Dept" color="#0EA5E9" />
```

**Props:**
- `label`: Badge text
- `color`: Hex color for text and tinted background (12% opacity)

---

### StatusBadge

Convenience wrapper that maps status strings to styled badges.

```tsx
import { StatusBadge } from "../components/ui";

<StatusBadge status="in_progress" />
<StatusBadge status="escalated" />
```

**Props:**
- `status`: `"new"` | `"assigned"` | `"in_progress"` | `"resolved"` | `"escalated"`

**Auto-mapped labels and colors based on status.**

---

### DepartmentBadge

Convenience wrapper that maps department names to styled badges.

```tsx
import { DepartmentBadge } from "../components/ui";

<DepartmentBadge department="Water" />
<DepartmentBadge department="Electricity" />
```

**Props:**
- `department`: `"Water"` | `"Electricity"` | `"Sanitation"` | `"Roads"` | `"Health"` | `"Revenue"` | `"Police"`

**Auto-mapped colors based on department.**

---

### Input

Text input field with optional label.

```tsx
import { Input } from "../components/ui";

<Input
  label="Email Address"
  id="email"
  type="email"
  placeholder="user@example.com"
  required
/>
```

**Props:**
- `label`: Optional label text rendered above field
- `id`: Input element ID
- All standard input HTML attributes supported

**Styling:**
- Bordered with line color
- Focus state with ink border color
- Smooth transitions

---

### Textarea

Multiline text input with optional label.

```tsx
import { Textarea } from "../components/ui";

<Textarea
  label="Complaint Description"
  id="complaint"
  placeholder="Describe your grievance..."
  rows={6}
  required
/>
```

**Props:**
- `label`: Optional label text rendered above field
- `id`: Textarea element ID
- All standard textarea HTML attributes supported

**Styling:**
- Bordered with line color
- Focus state with ink border color
- Smooth transitions

---

### Select

Dropdown select component with optional label.

```tsx
import { Select } from "../components/ui";

<Select label="Department" id="dept">
  <option value="">Select a department</option>
  <option value="Water">Water</option>
  <option value="Electricity">Electricity</option>
</Select>
```

**Props:**
- `label`: Optional label text rendered above field
- `id`: Select element ID
- `children`: Option elements
- All standard select HTML attributes supported

**Styling:**
- Bordered with line color
- Focus state with ink border color
- Smooth transitions

---

### EmptyState

Centered message for empty data lists, with optional call-to-action button.

```tsx
import { EmptyState } from "../components/ui";

<EmptyState
  message="You haven't filed any complaints yet."
  actionLabel="File First Complaint"
  onAction={() => navigate("/citizen/submit")}
/>
```

**Props:**
- `message`: Empty state message text
- `actionLabel`: Optional button text
- `onAction`: Optional callback function for button click

---

### LoadingState

Centered loading message during data fetch.

```tsx
import { LoadingState } from "../components/ui";

{loading && <LoadingState message="Loading issues..." />}
```

**Props:**
- `message`: Loading message (default: "Loading...")

---

## 🏗️ Layout Patterns

### Page Wrapper

All pages should follow this basic structure:

```tsx
export default function Page() {
  return (
    <div className="min-h-screen bg-paper">
      <TopNav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page content */}
      </main>
    </div>
  );
}
```

### Grid Layouts

Use Tailwind's grid utilities:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

### Spacing Scale

- `px-4 py-2` - Small buttons, compact controls
- `px-6 py-4` - Standard cards, sections
- `px-8 py-6` - Large sections, padding around content
- `gap-4` - Standard spacing between elements
- `gap-6` - Larger sections

---

## 🎯 Usage Examples

### Login Form

```tsx
import { Button, Card, Input, Textarea, Select } from "../components/ui";

<Card>
  <h2 className="text-xl font-semibold text-ink mb-4">Login</h2>
  
  <Input
    label="Email"
    id="email"
    type="email"
    required
    className="mb-4"
  />
  
  <Input
    label="Password"
    id="password"
    type="password"
    required
    className="mb-6"
  />
  
  <Button variant="primary" className="w-full">
    Sign In
  </Button>
</Card>
```

### Issue List

```tsx
import { Card, StatusBadge, DepartmentBadge, EmptyState, LoadingState } from "../components/ui";

{loading && <LoadingState />}

{!loading && issues.length === 0 && (
  <EmptyState message="No issues assigned to your department." />
)}

{!loading && issues.length > 0 && (
  <div className="space-y-4">
    {issues.map((issue) => (
      <Card key={issue.id}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-ink">{issue.issue_text}</h3>
            <div className="flex gap-2 mt-2">
              <StatusBadge status={issue.status} />
              <DepartmentBadge department={issue.department} />
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
)}
```

---

## 🔄 Responsive Design

All components are responsive by default. Use Tailwind breakpoints:

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

Example:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-6">
  {/* Content adapts at different breakpoints */}
</div>
```

---

## 🚀 Best Practices

1. **Use tokens consistently** - Always use design tokens instead of inline colors
2. **Semantic HTML** - Use proper semantic elements (button, input, etc.)
3. **Accessibility** - Include labels for form inputs
4. **Component composition** - Build complex UIs from small components
5. **Tailwind utilities** - Leverage Tailwind for spacing, sizing, layout
6. **Type safety** - All components are fully TypeScript typed

---

## 📦 Import Reference

```tsx
// Import individual components
import Button from "../components/ui/Button";
import { Card, Badge, StatusBadge } from "../components/ui";

// Or use index export
import {
  Button,
  Card,
  Badge,
  StatusBadge,
  DepartmentBadge,
  Input,
  Textarea,
  Select,
  EmptyState,
  LoadingState,
} from "../components/ui";
```

---

## 🎨 Extending the Design System

To add new colors to the palette:

1. Add color to `frontend/tailwind.config.js` under `extend.colors`
2. Update `CLAUDE.md` design system section
3. Create a convenience component if frequently used
4. Update this documentation

---

## ✅ Checklist for Consistency

- [ ] All custom colors use design tokens
- [ ] All buttons use Button component or variant prop
- [ ] All form inputs have labels
- [ ] All lists show loading states
- [ ] All empty lists show empty state message
- [ ] All text uses appropriate font (display/sans/mono)
- [ ] Spacing uses consistent Tailwind values
- [ ] Components are reusable and small

---

**Design System v1.0** — Updated: 2026-09-09
