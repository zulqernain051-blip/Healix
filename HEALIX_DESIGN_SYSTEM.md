# HEALIX Design System Specification

> **Status:** Authoritative Standard  
> **Version:** 2.0.0 (Unified Clinical Navy & Modern Health Platform)  
> **Target Platforms:** Mobile (Expo / React Native), Web (Vite / React)  
> **Last Updated:** September 2026

---

## 1. Design Philosophy & Guidelines

Healix is a patient-centric, clinical-grade digital health application. Its design language blends clinical trustworthiness with warmth, clarity, and rapid legibility.

### Core Principles
1. **Clinical Trust & Warmth:** Deep navies (`#0B4268`, `#06294B`) convey medical authority and stability, paired with calming scenic backgrounds, clean whites, and soft pastels.
2. **Clear Information Hierarchy:** High contrast between text and background ensures effortless readability for patients of all ages and cognitive states.
3. **Intentional Accent Color Coding:**
   - **Primary Action / Navigation:** Primary Navy (`#0B4268`) & Accent Blue (`#29A9F5`)
   - **Clinical Success & Care Verification:** Care Emerald (`#10B981`)
   - **Urgent / Emergency / Allergies:** Critical Red (`#EF4444`)
   - **Warnings & Alerts:** Warm Amber (`#F59E0B`)
4. **Consistency Across Screens:** Every future screen redesign must reuse the exact tokens and component hierarchy defined in this document.

---

## 2. Color Palette & Token System

### Core Brand & Clinical Tokens
| Token Name | Hex Code | Purpose & Usage |
|---|---|---|
| `primary` / `navy` | `#0B4268` | Primary clinical brand, active tab icons, buttons, titles |
| `navyDark` | `#06294B` | Deep navy for headers, modal backgrounds, and high-emphasis cards |
| `accentBlue` | `#29A9F5` | Accent blue for interactive badges, highlights, timestamp details |
| `careEmerald` / `emerald`| `#10B981` | Verification badges, completed visits, positive health metrics |
| `criticalRed` / `red` | `#EF4444` | High risk alerts, emergency SOS, severe allergy tags |
| `alertAmber` / `amber` | `#F59E0B` | Warnings, pending verification, scheduled/in-progress tags |

### Surface & Background Tokens
| Token Name | Hex Code | Purpose & Usage |
|---|---|---|
| `bgDefault` / `surface` | `#F8FAFC` | Default screen body background for light mode |
| `surfaceCard` | `#FFFFFF` | Pure white cards, bottom sheets, reminder containers |
| `surfaceSubtle` / `surfaceMuted` | `#F1F5F9` | Subtle pill backgrounds, input fill, secondary card surfaces |
| `borderLight` / `inputBorder` | `#E2E8F0` | Card borders, dividers, form element borders |

### Typography & Text Tokens
| Token Name | Hex Code | Purpose & Usage |
|---|---|---|
| `textPrimary` / `textDark` | `#1E293B` | Main headings, card titles, primary values |
| `textSecondary` / `textBody`| `#475569` | Body text, card subtitles, descriptions |
| `textMuted` | `#64748B` | Helper captions, metadata, inactive labels, placeholders |
| `textInverse` / `headerText`| `#FFFFFF` | Text rendered on dark navy surfaces or scenic header overlays |

### Quick Action Card Palette (Pastels)
| Action Card | Background Hex | Accent / Icon Hex | Icon Name (Ionicons) |
|---|---|---|---|
| **Request Care** | `#EBF5FF` | `#2563EB` | `add-circle` |
| **View Records** | `#ECFDF5` | `#10B981` | `document-text` |
| **Message Team** | `#F3E8FF` | `#8B5CF6` | `chatbubble-ellipses` |
| **Health Info** | `#FFF1F2` | `#F43F5E` | `heart` |

---

## 3. Spacing, Sizing & Radii

### Spacing Scale
```typescript
export const SPACING = {
  xs: 4,     // Micro-spacing, inline badges
  sm: 8,     // Gap between icon and label, tight padding
  md: 12,    // Medium padding inside cards, default stack gap
  lg: 16,    // Standard screen edge padding, card padding
  xl: 20,    // Section margin bottom, header spacing
  xxl: 28,   // Wide block separation
  xxxl: 40,  // Large header offsets
};
```

### Corner Radius Scale
```typescript
export const RADIUS = {
  xs: 4,     // Subtle tags, small checkboxes
  sm: 8,     // Input fields, secondary badges
  md: 12,    // Quick action icon circles, chips
  lg: 16,    // Standard cards, metric blocks
  xl: 24,    // Overlapping hero cards, bottom sheets
  round: 9999, // Circular avatars, pills, floating action buttons
};
```

### Typography Scale & Weights
```typescript
export const TYPOGRAPHY = {
  sizes: {
    xs: 11,   // Badges, footnotes, timestamps
    sm: 13,   // Secondary descriptions, subtitles
    md: 15,   // Standard body, button labels, card headers
    lg: 18,   // Section titles, modal titles
    xl: 22,   // Card hero titles, subheadings
    xxl: 28,  // Screen hero greetings, key data points
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};
```

---

## 4. Screen Architecture & Layout Standards

### Patient Home Screen Anatomy
1. **Scenic Hero Header:**
   - Background image: Peaceful, scenic nature/lake landscape (`mobile/assets/images/home-header-bg.jpg`).
   - Dark navy gradient overlay (`rgba(6, 41, 75, 0.85)` → `rgba(11, 66, 104, 0.3)`).
   - Time-based greeting ("Good morning," / "Good afternoon," / "Good evening,").
   - Patient name in bold white heading (`fontSize: 28`).
   - Reassuring clinical message: *"Your health matters. We're here for you."*
   - Profile avatar with patient initials or verified photo.
2. **Upcoming Visit Card (Floating / Overlapping):**
   - Negative top margin (-30) to visually overlap the scenic hero.
   - Navy surface background (`#0B4268`), rounded corners (`RADIUS.xl`).
   - Title: `✨ Your Next Care Visit` with calendar icon.
   - Next appointment time, staff name, staff avatar, and rounded "View Details" CTA pill (`#06294B`).
3. **Quick Actions Section:**
   - Pure white section background (`#FFFFFF` or `#F8FAFC`).
   - Heading: `Quick Actions` in `#1E293B`.
   - 2×2 grid layout of rounded pastel cards (Blue, Green, Purple, Pink).
   - High-contrast iconography, title, and descriptive subtitle with chevron indicator.
4. **Today's Reminders:**
   - White card container with subtle shadow and light border (`#E2E8F0`).
   - Header with notification bell icon and chevron navigation to Prescriptions.
   - List of active prescriptions/reminders with pill icon, time, and interactive checkbox.
5. **Bottom Navigation Tab Bar:**
   - Clean white background (`#FFFFFF`) with thin border top (`#E2E8F0`).
   - Active tint: Primary Navy (`#0B4268`).
   - Inactive tint: Muted Slate (`#94A3B8`).
   - 5 primary tabs: `Home`, `Requests`, `Records`, `Messages`, `Profile`.

### Patient Care Screen Anatomy
1. **Header & Context:**
   - Subtitle: `Requests, visits & agreements` in `#64748B`.
   - Title: `Your care team` in `#1E293B`.
2. **Care Team Row (`CareTeamRow`):**
   - Horizontal pill scroll showing active caregivers/nurses with emerald circular avatar ring (`rgba(16, 185, 129, 0.35)`), caregiver first name, and visit count.
   - `+ Add nurse` action pill with dashed border navigating to `/(patient)/requests/new`.
3. **Upcoming vs Past Segmented Control (`RequestFilterPills`):**
   - Rounded pill track (`#E2E8F0`) containing two high-contrast segments (`Upcoming · X` / `Past · Y`).
   - Active state: elevated white pill (`#FFFFFF`) with dark bold text (`#1E293B`).
   - Inactive state: transparent background with muted text (`#64748B`).
4. **Care Journey Cards (`CareJourneyCard`):**
   - **Upcoming with Assigned Visit:** Left initials avatar in emerald ring, nurse name, service type, amber visit timing (`Visit today · 11:30 AM`), and solid `"Show check-in code"` CTA navigating to `/(patient)/visits/[id]`.
   - **Open Request with Offers:** Stacked avatars, `"Care offers available"`, service title, request time, and solid `"Compare offers"` CTA navigating to `/(patient)/marketplace/[id]`.
   - **Completed Care:** Left initials avatar, service title, nurse name, completed date, and outlined `"Book [Name] again"` CTA.

---

## 5. Mandatory Rules for Future Screen Redesigns

Whenever any screen in the Healix application (Patient, Nurse, Doctor, Admin) is redesigned or updated:
1. **Consult This Specification First:** Never invent ad-hoc hex codes or arbitrary spacing values. Always map styles to `COLORS`, `SPACING`, `RADIUS`, and `TYPOGRAPHY` in `src/theme.ts`.
2. **Preserve Data Flow & Contracts:**
   - Never break existing hooks (`useDashboardSummary`, `useVisits`, `useRecords`, etc.).
   - Never alter backend routes, controllers, or database schemas during frontend redesigns.
   - Always preserve navigation routes (`/(patient)/(tabs)/...`, `/(patient)/requests/...`).
3. **Accessibility Requirements:**
   - Minimum touch target: 48×48dp.
   - Contrast ratio: High-contrast text on all surfaces (dark text on white/slate; white text on navy/teal).
   - Touch feedback: Use `activeOpacity={0.75-0.85}` on all TouchableOpacity elements.
