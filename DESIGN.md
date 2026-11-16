---
name: Bright Smile Dashboard
description: >
  A read-only clinic appointment dashboard. Mobile-first, calm clinical aesthetic.
  Teal accent on white with service-specific color coding.
colors:
  primary: "#0d9488"
  primary-dark: "#0f766e"
  primary-light: "#ccfbf1"
  surface: "#ffffff"
  surface-alt: "#f9fafb"
  border: "#e5e7eb"
  border-strong: "#d1d5db"
  on-surface: "#18181b"
  on-surface-secondary: "#52525b"
  on-surface-muted: "#a1a1aa"
  on-primary: "#ffffff"
  status-now: "#0d9488"
  status-upcoming: "#3b82f6"
  status-done: "#a1a1aa"
  status-error: "#dc2626"
  status-warning: "#f59e0b"
  service-cleaning: "#3b82f6"
  service-filling: "#f59e0b"
  service-root-canal: "#ef4444"
  service-whitening: "#a855f7"
  service-extraction: "#22c55e"
  service-other: "#6b7280"
typography:
  headline-display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-lg:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.02em
  time-display:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: tnum
rounded:
  none: 0px
  sm: 6px
  md: 10px
  lg: 14px
  xl: 20px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: 12px
    typography: "{typography.label-lg}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 12px
    typography: "{typography.label-lg}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 16px
  chip-service:
    rounded: "{rounded.full}"
    padding: 6px
    typography: "{typography.label-md}"
  now-card:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
    padding: 20px
  appointment-row:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 16px
---

# Bright Smile Dashboard — Design System

## Overview
A calm, clean, clinical interface for the Bright Smile Dental Clinic appointments dashboard.
Built mobile-first for doctors checking schedule flow between patient appointments.
Prioritizes glanceable appointment times, patient status, service color recognition, and clear free gaps.

## Colors
- **Primary Teal (`#0d9488` / `#0f766e`):** Interaction anchor, primary actions, and "Now" active state card.
- **Teal Light Tint (`#ccfbf1`):** Subdued active indicators and highlights.
- **Surface (`#ffffff`) & Surface Alt (`#f9fafb`):** Pure white container cards on subtle cool-grey page canvas.
- **Borders (`#e5e7eb` / `#d1d5db`):** Soft perimeter separation without heavy drop shadows.
- **Typography Neutrals:** Zinc palette (`#18181b` primary, `#52525b` secondary, `#a1a1aa` muted).
- **Service Tokens:**
  - Cleaning: `#3b82f6` (Blue)
  - Filling: `#f59e0b` (Amber)
  - Root Canal: `#ef4444` (Red)
  - Whitening: `#a855f7` (Purple)
  - Extraction: `#22c55e` (Green)
  - Other / Manual: `#6b7280` (Neutral Slate)

## Typography
Sole typeface family: **Geist Sans** (`next/font/google`).
- **Tabular Numerals (`font-feature-settings: 'tnum'`):** Enforced across all time displays (`09:00 - 09:30`), appointment counts, and duration badges for jitter-free scanning.
- **Hierarchy:** High contrast scale from `headline-display` (48px bold) down to `label-sm` (11px micro labels).
- No serif accents. Clean sans geometric rendering.

## Layout
- **Mobile (< 640px):** Single-column vertical stream. Prominent "Now" card banner at top, followed by horizontal service filters and timeline list.
- **Tablet (640px – 1023px):** Contained width with responsive timeline spacing.
- **Desktop (>= 1024px):** Two-column split layout (max-w 1280px) with sticky right summary sidebar (Now card, next appointment, service distribution metrics).

## Elevation & Depth
- Flat, tactile, layered borders over heavy diffuse drop shadows.
- Subtle `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)` for surface cards.
- Layered 1px inner highlights on active/now containers.

## Shapes
- **Container Radii:** `14px` (`rounded-lg`) for appointment cards, dialogs, and main surfaces.
- **Interactive Badges & Chips:** `9999px` (`rounded-full`) for service badges, status pills, and counter tags.
- **Hero/Now Card:** `20px` (`rounded-xl`) for elevated visual prominence.

## Components
- **NowCard:** Prominent dark teal hero surface displaying active patient, service type, elapsed time bar, and countdown.
- **AppointmentCard / Row:** Time block with tabular figures, patient name, service badge with color dot, source tag (`BOT` / `MANUAL`), and WhatsApp/Call touch targets.
- **ServiceChip:** Compact pill showing service dot, name, and count (`Cleaning 3`).
- **FreeGapRow:** Quiet dashed or striped row highlighting unbooked intervals (`15 min free`).
- **StateDisplays:** Dedicated full-viewport empty, closed (Sunday), busy, and connection error layouts.

## Do's and Don'ts
- **DO:** Always display times in the clinic's configured timezone with tabular numbers.
- **DO:** Always show explicit status text alongside colored indicators for accessibility.
- **DO:** Keep "View only. Bookings, changes and cancellations happen in WhatsApp." visible on viewports.
- **DON'T:** Use arbitrary saturated colors outside the defined service token palette.
- **DON'T:** Mix sharp (`rounded-none`) with curved containers.
- **DON'T:** Add interactive write actions (booking/cancelling) inside the dashboard.
