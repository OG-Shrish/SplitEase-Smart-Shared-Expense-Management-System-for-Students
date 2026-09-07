# SplitEase – Figma Prototype & UI/UX Design System Specification

## 1. Prototype Overview & Links

- **Figma Design File & Interactive Prototype**: [SplitEase Figma Prototype (Starter Plan)](https://www.figma.com/proto/splitease-shared-expenses/SplitEase-UI-Prototype?node-id=1-2&scaling=scale-down&page-id=0%3A1&starting-point-node-id=1%3A2)
- **Design System File**: [SplitEase Components & Design Tokens](https://www.figma.com/file/splitease-shared-expenses/SplitEase-Design-System)
- **Resolution**: 1440 x 900 (Desktop) / 375 x 812 (Mobile Responsive Breakpoints)
- **Target Audience**: College students, flatmates, and hostel residents managing shared bills.

---

## 2. Design System & Design Tokens

### Color Palette

| Token Name | Hex Code | Role / Usage | Semantic Purpose |
|------------|----------|--------------|------------------|
| `primary-600` | `#4F46E5` | Brand Accent / Primary CTAs | Focus, trust, and modern student aesthetic |
| `primary-700` | `#4338CA` | Hover state for buttons | Interactive depth |
| `success-600` | `#10B981` | Credit / "You Are Owed" / Settled | Positive financial balance / Completed payment |
| `danger-600` | `#EF4444` | Debit / "You Owe" / Delete | Financial obligation / Alert |
| `warning-500` | `#F59E0B` | Pending / Calculation discrepancies | Status warning |
| `surface-ground` | `#F8FAFC` | App background | High legibility, neutral canvas |
| `surface-card` | `#FFFFFF` | Cards, Modals, Dialogs | Elevation and grouping |
| `border-subtle` | `#E2E8F0` | Dividers and containers | Structural separation without visual noise |
| `text-primary` | `#0F172A` | Headings and titles | High contrast (WCAG AAA) |
| `text-secondary` | `#64748b` | Subtitles, metadata, timestamps | Readable contextual information |

### Typography

- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Scale**:
  - `Display / H1`: 32px – 48px, Bold (800)
  - `Section / H2`: 20px – 24px, Semi-Bold (700)
  - `Card Header / H3`: 15px – 17px, Semi-Bold (600)
  - `Body Regular`: 13px – 14px, Regular (400)
  - `Caption / Meta`: 11px – 12px, Medium (500)
  - `Numbers / Currency`: 16px – 32px, Bold (700 / 800), Monospace tabular nums for exact financial alignment

### Spacing & Elevation

- **8pt Grid System**: Consistent spacing increments (4px, 8px, 12px, 16px, 24px, 32px, 48px).
- **Border Radii**: Small (`6px`), Medium (`10px`), Large (`14px`), Pill (`9999px`).
- **Elevation**:
  - Cards: `0 1px 3px rgba(0,0,0,0.05)`
  - Modals & Dropdowns: `0 20px 40px rgba(0,0,0,0.25)`

---

## 3. The 6 Core Prototype Screens

### Screen 1: Landing Page (`screens/screen1_landing.png`)
- **Key Elements**: Clear value proposition ("Split Flat Expenses With Ease"), direct CTA ("Get Started Free"), three feature cards showcasing Automated Balances, Flexible Split Engine, and Greedy Debt Simplification.
- **UX Goal**: Convince student roommates within 5 seconds that SplitEase eliminates awkward money conversations and spreadsheet chaos.

### Screen 2: Authentication & Onboarding (`screens/screen2_auth.png`)
- **Key Elements**: Clean unified card for Sign In and Registration tabs, College/Student email input with validation, password security indicator, session persistence toggle.
- **UX Goal**: Fast 10-second sign-up requiring only Name, Email, and Password with instant JWT session initialization.

### Screen 3: Main Dashboard Overview (`screens/screen3_dashboard.png`)
- **Key Elements**: High-contrast summary cards:
  1. Active Groups count
  2. "You Owe" in bold semantic red (`₹450.00`)
  3. "You Are Owed" in bold semantic green (`₹1,850.00`)
  - Grid of user's active flat groups with net balance tags and quick navigation.
- **UX Goal**: Answer the student's most pressing question instantly: *"Do I owe money today, or is someone paying me back?"*

### Screen 4: Group Details & Activity Stream (`screens/screen4_group_details.png`)
- **Key Elements**:
  - Two-column layout: Left column contains chronological expense stream with category icons (Groceries, Electricity, WiFi); Right column displays Simplified Debt settlement cards and member avatar list.
  - Action buttons: `+ Add Member` and `+ Add Expense`.
- **UX Goal**: Provide single source of truth for the entire flat apartment with zero ambiguity on shared purchases.

### Screen 5: Interactive Add Expense & Split Engine Modal (`screens/screen5_add_expense_split.png`)
- **Key Elements**: Title input, Amount in INR (`₹`), Category dropdown, Segmented tab control (`Equal Split` | `Custom Amount` | `Percentage (%)`).
  - Real-time participant breakdown list with automated penny-rounding discrepancy absorption.
  - Live balance status pill (`Total: ₹1,200.00` | `Remaining: ₹0.00 (Balanced)`).
- **UX Goal**: Keep expense entry time strictly under 10 seconds while preventing mathematical imbalance errors before submission.

### Screen 6: Debt Settlement & Visual Analytics (`screens/screen6_settlement_analytics.png`)
- **Key Elements**:
  - Monthly spending donut chart breakdown (Groceries 45%, Utilities 25%, Internet 15%, Food 15%).
  - Verified settlement cards logging peer-to-peer repayments (e.g., "Amit Sharma paid Rahul Sharma ₹600.00 via Google Pay UPI").
- **UX Goal**: Transparency and closure; allows roommates to confirm off-platform UPI payments and immediately zero out ledger debts.

---

## 4. UI/UX Usability Heuristics Applied

1. **Student-Centric Simplicity (Zero Visual Clutter)**: Clean layout prioritizing balance visibility over dense financial tables.
2. **Semantic Color Guidance**: Immediate recognition of debt obligations (Red = You Owe, Green = You Are Owed).
3. **Instant Validation**: Client-side feedback ensures split amounts total exactly 100% or the expense amount before API transmission.
4. **Mobile & Touch Friendly**: Interactive targets strictly follow the 44x44px minimum sizing rule for effortless mobile browser usage.
