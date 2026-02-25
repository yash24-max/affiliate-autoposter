# Affiliate Autoposter — Figma Design Prototype Specification

> **Stack:** React 18 + Vite · TypeScript · Tailwind CSS · React Query · React Router · Recharts  
> **Audience:** Figma designer + frontend developer handoff  
> **Version:** v1.0 · 2026-02-25

---

## 1. Design System Foundation

### 1.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-base` | `#0F172A` | App canvas / page background |
| `--color-bg-surface` | `#1E293B` | Cards, panel surfaces |
| `--color-bg-subtle` | `#334155` | Input fields, secondary panels |
| `--color-border` | `#475569` | Dividers, input borders |
| `--color-brand-primary` | `#6366F1` | Primary CTA, active nav, brand |
| `--color-brand-secondary` | `#8B5CF6` | Gradient endpoints, accents |
| `--color-accent-blue` | `#3B82F6` | Links, info states |
| `--color-accent-teal` | `#14B8A6` | "Test Connection" button, success secondary |
| `--color-success` | `#22C55E` | Success status pills, positive metrics |
| `--color-warning` | `#F59E0B` | Earnings highlight, warnings |
| `--color-danger` | `#EF4444` | Error states, "Failed" pills |
| `--color-text-primary` | `#F8FAFC` | Body text, headings |
| `--color-text-secondary` | `#94A3B8` | Labels, captions, placeholders |
| `--color-text-disabled` | `#475569` | Disabled form element text |

**Brand gradient:** `linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)`  
**Glow effect:** `box-shadow: 0 0 24px rgba(99, 102, 241, 0.35)`

---

### 1.2 Typography

> Font: **Inter** (Google Fonts) — used across all UI.

| Style | Size | Weight | Line-height | Usage |
|---|---|---|---|---|
| `Display/XL` | 36px | 700 | 1.2 | Hero brand text (auth left panel) |
| `Heading/H1` | 28px | 700 | 1.3 | Page titles |
| `Heading/H2` | 22px | 600 | 1.35 | Section headings, card headers |
| `Heading/H3` | 18px | 600 | 1.4 | Sub-section, form group labels |
| `Body/LG` | 16px | 400 | 1.6 | Default body, form values |
| `Body/MD` | 14px | 400 | 1.6 | Table rows, descriptions |
| `Body/SM` | 12px | 400 | 1.5 | Captions, footnotes, helper text |
| `Label/MD` | 14px | 500 | 1.4 | Form labels, nav items |
| `Code/SM` | 13px | 400 | 1.5 | API keys, affiliate tags (monospace: `JetBrains Mono`) |

---

### 1.3 Spacing & Grid

**Base unit:** 4px  
**Scale:** `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96px`

| Breakpoint | Columns | Gutter | Margin |
|---|---|---|---|
| Mobile (`< 640px`) | 4 | 16px | 16px |
| Tablet (`640–1024px`) | 8 | 24px | 32px |
| Desktop (`> 1024px`) | 12 | 24px | 48px |

**Container max-width:** 1280px — centered with auto horizontal margins.

---

### 1.4 Elevation & Effects

| Level | Usage | Shadow |
|---|---|---|
| `elevation-0` | Flat (bg surface = card) | none |
| `elevation-1` | Cards, panels | `0 1px 3px rgba(0,0,0,0.3)` |
| `elevation-2` | Dropdowns, tooltips | `0 4px 16px rgba(0,0,0,0.4)` |
| `elevation-3` | Modals, drawers | `0 16px 48px rgba(0,0,0,0.6)` |
| `glow-brand` | Active states, CTAs | `0 0 24px rgba(99,102,241,0.35)` |

**Border radius scale:** `4px / 8px / 12px / 16px / 24px (pill)`  
**Glassmorphism (feature cards):** `background: rgba(30,41,59,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08);`

---

### 1.5 Iconography

- **Library:** [Heroicons](https://heroicons.com/) (Outline for navigation, Solid for status indicators)
- **Size scale:** 16px · 20px · 24px · 32px
- **Color:** Inherit from parent text color; active icons use `--color-brand-primary`

---

## 2. Application Shell & Navigation

### 2.1 Shell Structure (Authenticated)

```
┌─────────────────────────────────────────────────────────┐
│  TopNavBar (h:56px fixed)                               │
│  [Logo] [Breadcrumb]                  [Bell] [Avatar ▼] │
├──────────┬──────────────────────────────────────────────┤
│ Sidebar  │  Page Content Area                           │
│ (w:240px │  (fluid, scrollable)                         │
│  fixed)  │                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

**Mobile:** Sidebar collapses to a bottom tab bar (4 tabs: Dashboard, Config, Schedule, Analytics).

### 2.2 TopNavBar — Component Spec

| Element | Spec |
|---|---|
| Background | `--color-bg-surface` + `border-bottom: 1px solid --color-border` |
| Logo | SVG icon (rocket + link) + "Autoposter" wordmark, `Display/XL` truncated to brand-primary gradient text |
| Breadcrumb | Current page name, `Body/MD`, `--color-text-secondary` |
| Notification Bell | Heroicon `bell` 20px, badge with count (red `--color-danger` circle) |
| Avatar | 32px circle, user initials or profile photo, click → dropdown (Profile / Logout) |

### 2.3 Sidebar — Component Spec

**Width:** 240px collapsed → 64px on icon-only mode  
**Background:** `--color-bg-surface`  
**Right border:** `1px solid --color-border`

| Nav Item | Icon | Route |
|---|---|---|
| Dashboard | `chart-bar` | `/dashboard` |
| Configuration | `cog-6-tooth` | `/settings` |
| Schedule | `clock` | `/schedule` |
| Analytics *(V3+)* | `presentation-chart-line` | `/analytics` |
| Help | `question-mark-circle` | external |

**Active state:** Left accent bar `4px brand-primary`, background `rgba(99,102,241,0.12)`, icon + label `--color-brand-primary`  
**Hover state:** Background `rgba(255,255,255,0.05)`, label fades in to `--color-text-primary`  
**Collapse toggle:** Chevron button at bottom of sidebar

---

## 3. Screen Specifications

---

### 3.1 Screen: Login / Register

**Route:** `/login` · `/register`  
**Accessed by:** Unauthenticated users  
**Layout:** Full-viewport split (50/50 on desktop, single column on mobile)

#### Left Panel — Brand Panel

```
Background: linear-gradient(135deg, #6366F1, #8B5CF6)
─────────────────────────────────────────
  [Logo SVG + "Affiliate Autoposter" wordmark]
  ─────────────────────────────────
  "Automate Your Affiliate Empire"     ← Display/XL, white
  ─────────────────────────────────
  "Connect once. Post automatically.
   Earn consistently."                 ← Body/LG, white/80%
  ─────────────────────────────────
  ✓  Zero daily manual effort          ← Feature list, white/70%
  ✓  Amazon → Telegram in minutes
  ✓  Track earnings on one dashboard
─────────────────────────────────────────
[Abstract animated line art / geometric SVG at bottom]
```

#### Right Panel — Auth Card

```
Background: --color-bg-surface
Padding: 48px
Border-radius: 0 (full panel) → 16px (mobile bottom sheet)
─────────────────────────────────────────
  "Welcome Back"                       ← Heading/H1
  "Sign in to your account"            ← Body/MD, --color-text-secondary
  ─────────────────────────────────
  [FormField: Email]
    Label: "Email Address"
    Input: type=email, placeholder "you@example.com"
    Left icon: envelope 16px
  [FormField: Password]
    Label: "Password"
    Input: type=password
    Left icon: lock-closed 16px
    Right toggle: eye / eye-slash icon
  ─────────────────────────────────
  [Checkbox] "Remember me"      [Link] "Forgot password?"
  ─────────────────────────────────
  [Button: Primary] "Sign In"          ← Full width, h:48px
  ─────────────────────────────────
  [Divider with label "or"]
  ─────────────────────────────────
  [Button: OAuthGoogle] "Continue with Google"  ← outlined, Google logo
  ─────────────────────────────────
  "Don't have an account? Register →"  ← Body/MD, link brand-primary
─────────────────────────────────────────
```

**Toggle Login ↔ Register:** Tab switcher at top of card or a separate route; Register adds "Full Name" field and password confirmation.

#### Error States

| Condition | UI Response |
|---|---|
| Invalid credentials | Inline error below password field, red text + icon |
| Network error | Toast notification (top-right), "Connection error. Try again." |
| Session expired (on re-entry) | Toast: "Session expired. Please log in again." |

---

### 3.2 Screen: Setup Wizard (4-Step Onboarding)

**Route:** `/setup` → redirects post-login for new users  
**Layout:** Centered single-column card (max-width 640px), full-height  
**Purpose:** First-time configuration of Amazon + Telegram + preferences + schedule

#### Stepper Component

```
●━━━━━○━━━━━○━━━━━○
1      2      3      4
Amazon Telegram Categories Schedule
```

- Step **complete**: filled brand-primary circle + checkmark icon
- Step **active**: filled brand-primary circle with white number, label bold
- Step **upcoming**: slate circle + muted label
- Connector line: fills brand-primary as steps complete (animated, 300ms ease)

---

#### Step 1 — Amazon Configuration

```
Card Header: "Amazon Affiliate Setup"
Sub: "Connect your Amazon Product Advertising API"
─────────────────────────────────────
[FormField] Access Key ID          *required
  Type: text, monospace font
  Placeholder: "AKIAIOSFODNN7EXAMPLE"
  Right: [Button: icon paste]

[FormField] Secret Access Key      *required
  Type: password (shown masked)
  Right: [Toggle eye icon]

[FormField] Affiliate Tag          *required
  Placeholder: "yourname-20"
  Helper: "Your tracking ID appended to all product URLs"
  Icon: info-circle with tooltip

[FormField] Associate ID
  Placeholder: "yourname-associatesID"

[Select] AWS Region
  Options: US (amazon.com) / UK / DE / IN / JP / CA / AU

─────────────────────
[Button: secondary outline teal] "Test Connection"
  → Loading state: spinner inside button
  → Success: green checkmark inline "Connected ✓"
  → Failure: red X inline "Connection failed — check credentials"
─────────────────────
[Footer] [Back disabled] [Next →]
```

---

#### Step 2 — Telegram Configuration

```
Card Header: "Telegram Channel Setup"
Sub: "Connect your Telegram bot to publish affiliate posts"
─────────────────────
[FormField] Bot Token              *required
  Placeholder: "1234567890:ABCdef..."
  Helper: "Get this from @BotFather on Telegram"
  Right: [Link "How to create a bot?"]

[FormField] Channel ID             *required
  Placeholder: "@yourchannel or -100123456789"
  Helper: "Use @username for public or numeric ID for private"

[FormField] Post Caption Template  (optional)
  Type: textarea, 3 rows
  Placeholder: "🔥 {product_name}\n💰 {price}\n👉 {link}"
  Helper: "Available tokens: {product_name}, {price}, {link}, {category}"
─────────────────────
[Button: secondary outline teal] "Send Test Message"
  → sends a test message to the configured channel
  → Success / Failure inline indicator
─────────────────────
[Footer] [← Back] [Next →]
```

---

#### Step 3 — Categories & Filters

```
Card Header: "Choose Your Product Categories"
Sub: "Select which Amazon categories to source products from"
─────────────────────
[Multi-select chip grid] — 2 column grid
  [Electronics]  [Fashion]   [Books]    [Home & Kitchen]
  [Sports]       [Beauty]    [Toys]     [Automotive]
  [Health]       [Office]    [Garden]   [Food & Grocery]
  Active chip: brand-primary bg + white text
  Inactive chip: bg-subtle border + secondary text
─────────────────────
[FormField] Min Rating             optional
  Type: number, placeholder "4.0", range 1–5

[FormField] Min Reviews            optional
  Type: number, placeholder "50"

[Toggle] "Only Prime Eligible"     default: off
[Toggle] "Include Sponsored Products"  default: off
─────────────────────
Helper: "You can update these filters anytime from Settings."
─────────────────────
[Footer] [← Back] [Next →]
```

---

#### Step 4 — Schedule Setup

```
Card Header: "Configure Your Posting Schedule"
Sub: "Set when and how often to auto-post"
─────────────────────
[Select] Timezone
  Searchable, e.g., "Asia/Kolkata (UTC+5:30)"

[FormField Row: "Posts per day"]
  Number input with - / + stepper, min 1 max 10

[FormField Row: "Post at these times"]
  Time-slot tag input — add slots like chips
  e.g.,  9:00 AM  ×    2:00 PM  ×    7:00 PM  ×
  [+ Add time slot] button

[Multi-toggle: Active Days]
  [M] [T] [W] [T] [F] [S] [S]
  Toggleable day chips, all on by default
─────────────────────
[Summary Card] Preview
  "Your schedule: 3 posts/day on Mon–Fri at 9:00 AM, 2:00 PM, 7:00 PM IST"
─────────────────────
[Footer] [← Back] [Button: primary green "Activate & Start →"]
```

After submit → success animation (confetti or checkmark lottie) → redirect to `/dashboard`

---

### 3.3 Screen: Dashboard

**Route:** `/dashboard`  
**Layout:** 12-column grid, authenticated shell

#### Summary Stats Row (top)

4 cards across full width (1 per 3 columns on desktop, 2×2 on tablet, stacked on mobile)

| Card | Icon | Value | Color |
|---|---|---|---|
| Posts Today | `paper-airplane` | `12` | `--color-success` trend |
| This Week | `calendar-days` | `47` | `--color-accent-blue` trend |
| All Time | `chart-bar` | `1,204` | `--color-brand-primary` |
| Est. Earnings | `currency-dollar` | `$284.50` | `--color-warning` gold |

**Card anatomy:**  
- Glassmorphism surface, `elevation-1`  
- Top-right: trend icon + percentage change vs previous period (green ▲ / red ▼)  
- Large numeric value: `Heading/H1` weight 700  
- Label below: `Body/SM --color-text-secondary`

#### Main Content Area (2-column, desktop)

**Left (8 cols): Recent Posts Table**

```
Table Header: "Recent Posts"  [Filter dropdown ▼]  [Export CSV button]

Columns:
│ Product Name (truncated to 40 chars + tooltip) │ Platform │ Status │ Posted At │ Actions │

Row design:
  Product: thumbnail 40×40px + product name text, Body/MD
  Platform: Telegram icon + "Telegram"
  Status:
    "Published" → green pill (rounded-full, bg-success/15, text-success)
    "Failed"    → red pill   (bg-danger/15, text-danger)
    "Pending"   → amber pill (bg-warning/15, text-warning)
  Posted At: relative time ("2h ago"), Body/SM, --color-text-secondary
  Actions: [retry icon btn] (for failed) | [view icon btn] (opens external)

Pagination: "Showing 1–10 of 47" · [← Prev] [1][2][3] [Next →]
```

**Empty State** (first-time user):  
Centered illustration + `Heading/H2` "No posts yet" + `Body/MD` "Complete setup to start auto-posting." + `[Button: primary "Go to Setup"]`

**Right (4 cols): Category Breakdown Chart**

```
Card: "Category Breakdown"  [This Week ▼]

[Recharts Donut chart, center label: "Total Posts: 47"]
  Legend below chart:
    ● Electronics   42%   (#6366F1)
    ● Fashion       28%   (#8B5CF6)
    ● Books         18%   (#14B8A6)
    ● Other         12%   (#94A3B8)
```

**Below chart (same right column): Quick Links Card**

```
"Quick Actions"
[Button: outlined] "Edit Amazon Config"
[Button: outlined] "Edit Telegram Config"
[Button: outlined] "Manage Schedule"
[Status row] Schedule: ● Active | Next post: 7:00 PM IST
```

---

### 3.4 Screen: Schedule Management

**Route:** `/schedule`  
**Layout:** Authenticated shell, 2-column (desktop), stacked (mobile)

#### Page Header

```
"Schedule Management"     [Badge: "Active" green pill | "Inactive" gray pill]
"Control when and how often your affiliate posts are published."
```

#### Left Column — Time Slots Visual

```
[Weekly grid view]
Days across top: Mon Tue Wed Thu Fri Sat Sun
Hours down side: 6AM, 9AM, 12PM, 3PM, 6PM, 9PM

Scheduled blocks: Indigo filled cells at configured times
  Hover: tooltip "Post at 9:00 AM · 3 products"
  Click: opens Edit Time Slot modal

[+ Add Time Slot] button (dashed border, full width below grid)
```

#### Right Column — Settings Panel

```
[Section: Posting Configuration]
  Timezone: [Searchable Select]  "Asia/Kolkata (UTC+5:30)"
  Posts per day: [- Stepper 3 +]
  Max Products per Post: [Select: 1 / 2 / 3 / 5]

[Section: Active Days]
  [M][T][W][T][F][S][S]  — day chip toggles (indigo = active)

[Section: Schedule Status]
  [Toggle: large] "Schedule Active"
    ON state:  label green, "Schedule is running"
    OFF state: label gray, "Schedule is paused"
  Next scheduled post: "Tonight, 7:00 PM IST"
  Last post: "3 hours ago — Published ✓"
```

#### Action Bar (sticky bottom)

```
[Button: outlined danger sm] "Deactivate"
[Button: outlined md] "Save Draft"     [Button: primary indigo] "Save & Apply"
```

---

### 3.5 Screen: Error & Empty States

| State | Trigger | UI |
|---|---|---|
| **Invalid API Key** | Test Connection fails | Red banner with error message + "Edit credentials" link |
| **Token Expired** | Any protected API 401 | Full-page redirect to `/login` + toast "Session expired" |
| **Scheduler Conflict** | `/api/schedule PUT` returns 409 | Inline error under save button, list conflicting time slots |
| **Network Offline** | Browser offline event | Banner top of page "You are offline. Changes will sync on reconnect." |
| **Empty Dashboard** | No posts yet | Illustration + CTA to Setup Wizard |
| **Form Validation** | Submit with empty required field | Red border on input + error message below + scroll to first error |

---

## 4. Component Library Index

### 4.1 Atoms

| Component | Variants | Notes |
|---|---|---|
| `Button` | primary / secondary / outlined / ghost / danger | Size: sm(32)/md(40)/lg(48)/xl(56)px height |
| `Input` | default / focused / error / disabled | With optional left/right icon slots |
| `Select` | default / searchable / multi-select | Dropdown elevation-2 |
| `Checkbox` | unchecked / checked / indeterminate / disabled | Brand-primary checked color |
| `Toggle` | off / on / disabled | Smooth 200ms transition |
| `Badge / Pill` | success / warning / danger / info / neutral | Rounded-full, small caps label |
| `Icon` | Via Heroicons | Size: 16/20/24px |
| `Avatar` | initials / image | 32/40/48px sizes |
| `Spinner` | brand-primary / white | Size: 16/20/24px |
| `Tooltip` | dark tooltip | Appears on hover/focus after 400ms delay |
| `Divider` | horizontal / with-label | 1px --color-border |

### 4.2 Molecules

| Component | Composition | Notes |
|---|---|---|
| `FormField` | Label + Input + HelperText + ErrorText | Controlled by react-hook-form |
| `SearchableSelect` | Input + Dropdown + Options list | Filterable |
| `TimePicker` | Select hour + Select minute + AM/PM | Time slot input |
| `CategoryChip` | Checkbox + Label styled as chip | Grid layout in Step 3 |
| `DayToggle` | 7 Toggle chips (M→S) | Week-day selector |
| `StatusPill` | Badge with dot + label | Published / Failed / Pending |
| `StatCard` | Icon + Value + Trend + Label + glassmorphism | Dashboard summary |
| `OAuthButton` | Provider logo + label + outlined border | Google OAuth |
| `StepperItem` | Circle (number/check) + Label + Connector | Part of Stepper |
| `TestConnectionBtn` | Button + inline status indicator | Amazon/Telegram verify |

### 4.3 Organisms

| Component | Notes |
|---|---|
| `AuthCard` | Full login/register form card |
| `BrandPanel` | Left split panel with gradient + feature list |
| `Stepper` | Full 4-step progress bar with step items |
| `SetupStepCard` | Wrapper card with stepper + form + footer nav |
| `RecentPostsTable` | Table with pagination, status pills, empty state |
| `CategoryDonutChart` | Recharts donut + legend |
| `WeeklyScheduleGrid` | Time grid with clickable slots |
| `SidebarNav` | Navigation with collapse support |
| `TopNavBar` | Fixed header with logo, breadcrumb, actions |
| `ToastNotification` | Animated slide-in, auto-dismiss 4s |
| `ConfirmModal` | Deactivate / destructive action confirm dialog |

### 4.4 Page Templates

| Template | Used By |
|---|---|
| `AuthLayout` | Login, Register pages |
| `AppShell` | All authenticated pages |
| `SetupWizardLayout` | Onboarding flow |
| `EmptyStateLayout` | Full-page empty/error screens |

---

## 5. Interactive States Reference

### Button States

| State | Visual |
|---|---|
| Default | Solid brand-primary, white label |
| Hover | Brightness 110%, subtle upward translateY(-1px), shadow-glow |
| Active/Press | Brightness 90%, translateY(0) |
| Focus | 2px offset ring `--color-brand-primary` (keyboard nav) |
| Disabled | Opacity 40%, cursor not-allowed |
| Loading | Label hidden → Spinner centered, prevents double-submit |
| Success | Green bg `--color-success`, checkmark icon, 2s then revert |

### Input States

| State | Visual |
|---|---|
| Default | Border `--color-border`, bg `--color-bg-subtle` |
| Focus | Border `--color-brand-primary`, shadow `0 0 0 3px rgba(99,102,241,0.2)` |
| Error | Border `--color-danger`, bg `rgba(239,68,68,0.05)` |
| Disabled | Opacity 50%, cursor not-allowed, bg slightly darker |
| Filled | Border slightly lighter, text `--color-text-primary` |

### Navigation States

| State | Visual |
|---|---|
| Default | `--color-text-secondary` icon + label |
| Hover | `--color-text-primary`, bg `rgba(255,255,255,0.05)` |
| Active | `--color-brand-primary`, left accent bar, bg `rgba(99,102,241,0.12)` |
| Focus | Same as hover + ring |

---

## 6. Animation & Transition Guidelines

| Interaction | Duration | Easing |
|---|---|---|
| Button hover | 150ms | `ease-out` |
| Nav item hover | 150ms | `ease-out` |
| Sidebar collapse | 250ms | `ease-in-out` |
| Stepper progress fill | 300ms | `ease-in-out` |
| Toast enter/exit | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Modal open | 200ms | `ease-out` (scale 0.95→1 + fade) |
| Card hover lift | 200ms | `ease-out` (translateY -2px) |
| Connection test feedback | instant | No animation; just swap states |
| Page transition | 200ms | `fade` (React Router) |

> **Rule:** No animation should exceed 400ms. Use `prefers-reduced-motion` media query to disable all transitions.

---

## 7. Figma File Structure

```
📁 Affiliate Autoposter — Figma Workspace
│
├── 📄 Page 1: 🎨 Design System
│   ├── Frame: Color Styles (swatches grid)
│   ├── Frame: Typography Scale
│   ├── Frame: Spacing & Grid
│   ├── Frame: Elevation & Effects
│   └── Frame: Iconography Reference
│
├── 📄 Page 2: 🧱 Component Library
│   ├── Frame: Atoms (Buttons, Inputs, Badges, …)
│   ├── Frame: Molecules (FormFields, Chips, …)
│   └── Frame: Organisms (Cards, Tables, Nav, …)
│
├── 📄 Page 3: 📱 Mobile Flows
│   ├── Frame: Login (375px)
│   ├── Frame: Setup Wizard Steps 1–4 (375px)
│   ├── Frame: Dashboard (375px)
│   └── Frame: Schedule (375px)
│
├── 📄 Page 4: 🖥️ Desktop Flows
│   ├── Frame: Login (1440px)
│   ├── Frame: Setup Wizard Steps 1–4 (1440px)
│   ├── Frame: Dashboard (1440px)
│   └── Frame: Schedule (1440px)
│
├── 📄 Page 5: 🔄 User Flow Diagram
│   └── Flowchart: Auth → Setup → Dashboard → Schedule
│
├── 📄 Page 6: 🧪 Interactive States
│   ├── Frame: Button States
│   ├── Frame: Input States
│   ├── Frame: Toast Variants
│   └── Frame: Error Screens
│
└── 📄 Page 7: 📋 Developer Handoff
    ├── Frame: Spacing Annotations
    ├── Frame: Color Tokens Map
    └── Frame: Component→Code Mapping
```

> **Tip:** Use Figma **Variables** (Primitive + Semantic tokens) and **Styles** for all colors, text, and effects — never hardcode in frames. Enable **Dev Mode** on handoff pages.

---

## 8. Figma Annotation Conventions

Every screen frame should include the following annotation layers (use a Sticky or Annotation component):

| Annotation Type | Color | Example |
|---|---|---|
| **Component name** | Blue | `AuthCard`, `StatCard` |
| **State** | Orange | `hover`, `error`, `loading` |
| **Interaction** | Purple | `onClick → navigate('/dashboard')` |
| **API call** | Green | `POST /api/auth/login` |
| **Conditional** | Yellow | `show only if: postsToday === 0` |
| **Accessibility** | Teal | `aria-label="Sign In"`, `role="status"` |

**Version control:** Use Figma **Branching** for each sprint. Branch name format: `v1.0/sprint-N/feature-name`  
**Naming convention for frames:** `[Screen Name] / [Breakpoint] / [State]` e.g. `Dashboard / Desktop / Empty State`

---

## 9. Responsive Behavior Notes

| Element | Mobile | Desktop |
|---|---|---|
| Auth layout | Single column, card full-width | 50/50 split panel |
| Sidebar | Bottom tab bar (4 icons) | Fixed 240px sidebar |
| Stat cards | 2×2 grid | 4 across 1 row |
| Recent posts table | Cards stacked vertically | DataTable with columns |
| Setup wizard | Full-width single column | 640px centered card |
| Schedule grid | Simplified time list | Full weekly grid |

---

## 10. Accessibility Checklist

- [ ] All form inputs have associated `<label>` elements
- [ ] Error messages linked via `aria-describedby`
- [ ] Color contrast ratio ≥ 4.5:1 for all text (WCAG AA)
- [ ] Focus ring visible on all interactive elements
- [ ] Status updates announced via `aria-live="polite"`
- [ ] Loading states use `aria-busy="true"`
- [ ] Modals trap focus and close on `Escape`
- [ ] All icon-only buttons have `aria-label`

---

## 11. Developer Handoff Notes (Tailwind Mapping)

| Design Token | Tailwind Class |
|---|---|
| `--color-bg-base` | `bg-slate-900` |
| `--color-bg-surface` | `bg-slate-800` |
| `--color-bg-subtle` | `bg-slate-700` |
| `--color-brand-primary` | `bg-indigo-500` / `text-indigo-500` |
| `--color-brand-secondary` | `bg-violet-500` |
| `--color-success` | `bg-green-500` / `text-green-400` |
| `--color-warning` | `bg-amber-500` / `text-amber-400` |
| `--color-danger` | `bg-red-500` / `text-red-400` |
| `--color-text-primary` | `text-slate-50` |
| `--color-text-secondary` | `text-slate-400` |
| Glassmorphism card | `bg-slate-800/70 backdrop-blur-md border border-white/10` |
| Glow button | `shadow-[0_0_24px_rgba(99,102,241,0.35)]` |

**Component → File mapping (suggested):**

```
src/
  components/
    ui/           ← Atoms (Button, Input, Select, Badge, Toggle…)
    forms/        ← Molecules (FormField, TimePicker, CategoryChip…)
  features/
    auth/         ← AuthCard, BrandPanel, LoginPage, RegisterPage
    setup/        ← SetupWizard, StepAmazon, StepTelegram, StepCategories, StepSchedule
    dashboard/    ← StatCard, RecentPostsTable, CategoryDonutChart
    schedule/     ← ScheduleGrid, ScheduleSettings
  layouts/
    AuthLayout.tsx
    AppShell.tsx
    SetupWizardLayout.tsx
```

---

*This specification is the single source of truth for the Figma prototype. Designers should build frames directly from this document; developers should use Developer Handoff pages for token and spacing reference.*
