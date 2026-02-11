# Gryork Brand Guidelines

## Official Design System & Style Guide

---

# Logo Analysis

## Logo Composition

The Gryork logo is a powerful symbol representing **growth**, **infrastructure**, and **financial stability**.

```
                    ▲
                   ╱ ╲
                  ╱   ╲           ← Arrow Head
                 ╱     ╲             (Upward Momentum)
                ▕───────▏
                ▕   ▕   ▏
                ▕   ▕   ▏         ← Building/Tower Shape
    Green       ▕   ▕   ▏            (Infrastructure)
    Accent  →   ▕   ▕   ▏
    (Growth)    ▕   ▕   ▏         ← Vertical Lines
                ▕   ▕   ▏            (Stability)
                ▕   ▕   ▏
                ▕   ▕   ▏         ← Blue Gradient
                                     (Trust, Finance)
```

## Symbolic Meaning

| Element | Symbolism | Application |
|---------|-----------|-------------|
| **Upward Arrow** | Progress, Growth, Forward Movement | Represents the upward trajectory of businesses using Gryork |
| **Building Shape** | Infrastructure, Construction | Core industry focus - EPC and construction sector |
| **Vertical Lines** | Structure, Organization, Reliability | Orderly, systematic platform approach |
| **Blue Gradient** | Trust, Finance, Professionalism | Banking/NBFC associations, corporate trust |
| **Green Accent** | Growth, Money, Prosperity | Financial growth, sustainable business |

---

# Color Palette

## Primary Colors (Blue)

The blue palette represents **trust**, **professionalism**, and **financial stability**.

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Primary Blue Dark** | `#0A2463` | rgb(10, 36, 99) | Headers, important text, footer |
| **Primary Blue Main** | `#1E5AAF` | rgb(30, 90, 175) | Primary buttons, links, accents |
| **Primary Blue Light** | `#3B82F6` | rgb(59, 130, 246) | Hover states, secondary elements |
| **Primary Blue 50** | `#EFF6FF` | rgb(239, 246, 255) | Light backgrounds, highlights |

## Secondary Colors (Green)

The green palette represents **growth**, **prosperity**, and **success**.

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Accent Green Dark** | `#15803D` | rgb(21, 128, 61) | Hover states, emphasis |
| **Accent Green Main** | `#22C55E` | rgb(34, 197, 94) | CTA buttons, success states |
| **Accent Green Light** | `#86EFAC` | rgb(134, 239, 172) | Backgrounds, subtle accents |
| **Accent Green 50** | `#F0FDF4` | rgb(240, 253, 244) | Light backgrounds |

## Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **White** | `#FFFFFF` | rgb(255, 255, 255) | Backgrounds, text on dark |
| **Gray 50** | `#F9FAFB` | rgb(249, 250, 251) | Page backgrounds |
| **Gray 100** | `#F3F4F6` | rgb(243, 244, 246) | Section backgrounds |
| **Gray 200** | `#E5E7EB` | rgb(229, 231, 235) | Borders, dividers |
| **Gray 300** | `#D1D5DB` | rgb(209, 213, 219) | Disabled states |
| **Gray 500** | `#6B7280` | rgb(107, 114, 128) | Secondary text |
| **Gray 600** | `#4B5563` | rgb(75, 85, 99) | Body text |
| **Gray 900** | `#111827` | rgb(17, 24, 39) | Dark backgrounds |

## Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#22C55E` | Confirmations, completed states |
| **Warning** | `#F59E0B` | Alerts, pending states |
| **Error** | `#EF4444` | Errors, destructive actions |
| **Info** | `#3B82F6` | Informational messages |

---

# Color Usage Guidelines

## Do's ✅

```
┌─────────────────────────────────────────────────────────────┐
│  CORRECT COLOR USAGE                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Primary Blue for main CTAs                              │
│     ┌─────────────────────┐                                 │
│     │    Get Started      │  #1E5AAF bg, #FFFFFF text       │
│     └─────────────────────┘                                 │
│                                                              │
│  ✅ Accent Green for secondary/positive CTAs                │
│     ┌─────────────────────┐                                 │
│     │  Partner With Us    │  #22C55E bg, #FFFFFF text       │
│     └─────────────────────┘                                 │
│                                                              │
│  ✅ Blue Dark for headings on white                         │
│     "Unlock Working Capital" in #0A2463                     │
│                                                              │
│  ✅ Gray 600 for body text                                  │
│     Paragraph text in #4B5563                               │
│                                                              │
│  ✅ White text on blue/green backgrounds                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Don'ts ❌

```
┌─────────────────────────────────────────────────────────────┐
│  INCORRECT COLOR USAGE                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ❌ Light colors on light backgrounds (poor contrast)       │
│     Light blue text on white background                     │
│                                                              │
│  ❌ Multiple bright colors competing                        │
│     Blue button next to green button next to another        │
│                                                              │
│  ❌ Using success green for non-success elements            │
│                                                              │
│  ❌ Dark blue text on dark backgrounds                      │
│                                                              │
│  ❌ Random gradients not from the defined palette           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

# Gradients

## Approved Gradients

```css
/* 1. Logo-Inspired Primary Gradient */
.gradient-logo {
  background: linear-gradient(180deg, #3B82F6 0%, #0A2463 100%);
}

/* 2. Hero Background Gradient */
.gradient-hero {
  background: linear-gradient(135deg, #0A2463 0%, #1E5AAF 50%, #3B82F6 100%);
}

/* 3. CTA Gradient (Blue to Green) */
.gradient-cta {
  background: linear-gradient(90deg, #1E5AAF 0%, #22C55E 100%);
}

/* 4. Accent Gradient */
.gradient-accent {
  background: linear-gradient(180deg, #86EFAC 0%, #15803D 100%);
}

/* 5. Subtle Background Gradient */
.gradient-subtle {
  background: linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 100%);
}
```

---

# Typography

## Font Family

**Primary**: Inter (Google Fonts)

```css
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Why Inter?
- Excellent readability at all sizes
- Professional, modern appearance
- Wide language support
- Open source, free to use
- Optimized for screens

## Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Display (Hero) | 56px / 3.5rem | 700 Bold | 1.1 | -0.02em |
| H1 | 48px / 3rem | 700 Bold | 1.2 | -0.02em |
| H2 | 36px / 2.25rem | 700 Bold | 1.2 | -0.01em |
| H3 | 24px / 1.5rem | 600 Semi | 1.3 | 0 |
| H4 | 20px / 1.25rem | 600 Semi | 1.4 | 0 |
| H5 | 18px / 1.125rem | 600 Semi | 1.4 | 0 |
| Body Large | 18px / 1.125rem | 400 Regular | 1.6 | 0 |
| Body | 16px / 1rem | 400 Regular | 1.6 | 0 |
| Body Small | 14px / 0.875rem | 400 Regular | 1.5 | 0 |
| Caption | 12px / 0.75rem | 500 Medium | 1.4 | 0.01em |
| Overline | 12px / 0.75rem | 600 Semi | 1.4 | 0.1em |

## Typography Examples

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Unlock Working Capital                                      │
│  ════════════════════════                                    │
│  Display: 56px, Bold, #0A2463, Line-height: 1.1             │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Why Choose Gryork                                           │
│  ════════════════════                                        │
│  H2: 36px, Bold, #0A2463                                    │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Fast Funding                                                │
│  ════════════════                                            │
│  H3: 24px, SemiBold, #0A2463                                │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Get funded within 48 hours of approval. Our streamlined    │
│  process ensures quick disbursement to your account.         │
│  ════════════════════════════════════════════════════════   │
│  Body: 16px, Regular, #4B5563, Line-height: 1.6             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

# Spacing System

Based on 4px base unit (Tailwind default)

| Name | Size | Pixels | Usage |
|------|------|--------|-------|
| xs | 0.25rem | 4px | Tight spacing |
| sm | 0.5rem | 8px | Small gaps |
| md | 1rem | 16px | Default spacing |
| lg | 1.5rem | 24px | Section padding |
| xl | 2rem | 32px | Large gaps |
| 2xl | 3rem | 48px | Section margins |
| 3xl | 4rem | 64px | Major sections |
| 4xl | 6rem | 96px | Hero padding |

---

# Components

## Buttons

### Primary Button (Blue)
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Default State                                               │
│  ┌────────────────────┐                                     │
│  │    Get Started     │                                     │
│  └────────────────────┘                                     │
│  Background: #1E5AAF                                         │
│  Text: #FFFFFF                                               │
│  Padding: 12px 24px                                          │
│  Border-radius: 8px                                          │
│  Font: 16px, 600 weight                                      │
│                                                              │
│  Hover State                                                 │
│  Background: #3B82F6                                         │
│  Transform: translateY(-1px)                                 │
│  Shadow: 0 4px 12px rgba(30, 90, 175, 0.3)                  │
│                                                              │
│  Active State                                                │
│  Background: #0A2463                                         │
│  Transform: translateY(0)                                    │
│                                                              │
│  Disabled State                                              │
│  Background: #D1D5DB                                         │
│  Cursor: not-allowed                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Secondary Button (Green)
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Default State                                               │
│  ┌────────────────────┐                                     │
│  │  Partner With Us   │                                     │
│  └────────────────────┘                                     │
│  Background: #22C55E                                         │
│  Text: #FFFFFF                                               │
│                                                              │
│  Hover: #15803D                                              │
│  Active: #166534                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Outline Button
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Default State                                               │
│  ┌────────────────────┐                                     │
│  │    Learn More      │                                     │
│  └────────────────────┘                                     │
│  Background: transparent                                     │
│  Border: 2px solid #1E5AAF                                  │
│  Text: #1E5AAF                                               │
│                                                              │
│  Hover:                                                      │
│  Background: #1E5AAF                                         │
│  Text: #FFFFFF                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Ghost Button
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Default: "Contact Us →"                                     │
│  Text: #1E5AAF                                               │
│  Background: transparent                                     │
│                                                              │
│  Hover: Underline                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Cards

### Feature Card
```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │     ┌────────┐                                      │    │
│  │     │  🔒    │  40x40px icon container             │    │
│  │     │        │  Background: #EFF6FF (blue-50)      │    │
│  │     └────────┘  Border-radius: 8px                  │    │
│  │                                                      │    │
│  │     Secure Platform                                 │    │
│  │     ─────────────────                               │    │
│  │     H3: 20px, SemiBold, #0A2463                    │    │
│  │                                                      │    │
│  │     End-to-end encrypted platform                   │    │
│  │     ensuring your financial data                    │    │
│  │     remains protected at all times.                 │    │
│  │     ─────────────────────────────                   │    │
│  │     Body: 14px, Regular, #4B5563                   │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Background: #FFFFFF                                         │
│  Border: 1px solid #E5E7EB                                  │
│  Border-radius: 12px                                         │
│  Padding: 24px                                               │
│  Shadow: 0 1px 3px rgba(0,0,0,0.1)                          │
│                                                              │
│  Hover:                                                      │
│  Shadow: 0 4px 12px rgba(0,0,0,0.1)                         │
│  Transform: translateY(-2px)                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Stat Card
```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │              ₹500+ Cr                               │    │
│  │     Display: 36px, Bold, #0A2463                   │    │
│  │                                                      │    │
│  │        Transactions Facilitated                     │    │
│  │     Body: 14px, Regular, #6B7280                   │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Text-align: center                                          │
│  Padding: 32px                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Form Elements

### Input Field
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Company Name *                                              │
│  Label: 14px, 500 weight, #374151                           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ABC Constructions Pvt Ltd                            │    │
│  └─────────────────────────────────────────────────────┘    │
│  Background: #FFFFFF                                         │
│  Border: 1px solid #D1D5DB                                  │
│  Border-radius: 8px                                          │
│  Padding: 12px 16px                                          │
│  Font: 16px                                                  │
│                                                              │
│  Focus State:                                                │
│  Border: 2px solid #1E5AAF                                  │
│  Outline: none                                               │
│  Box-shadow: 0 0 0 3px rgba(30, 90, 175, 0.1)              │
│                                                              │
│  Error State:                                                │
│  Border: 2px solid #EF4444                                  │
│  + Error message below in #EF4444, 14px                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

# Iconography

## Icon Style
- **Style**: Outline / Linear
- **Stroke Width**: 1.5px
- **Sizes**: 16px, 20px, 24px, 32px, 40px
- **Library**: Lucide Icons (recommended)

## Common Icons

| Icon | Usage | Context |
|------|-------|---------|
| 🔒 Lock | Security | Trust indicators |
| ⚡ Bolt | Speed | Fast processing |
| 📊 Chart | Analytics | Transparency |
| 🏦 Building | Institution | NBFCs |
| 📱 Phone | Digital | Tech platform |
| 🤝 Handshake | Partnership | Collaboration |
| ✓ Check | Success | Completed steps |
| → Arrow | Action | Links, CTAs |

---

# Photography & Imagery

## Image Style Guidelines

### Do's ✅
- Professional business settings
- Infrastructure/construction imagery
- Diverse representation
- Clean, well-lit photos
- Subtle blue/green color grading

### Don'ts ❌
- Stock photos that look fake
- Overly casual imagery
- Dark, moody aesthetics
- Unrelated imagery
- Busy, cluttered backgrounds

## Image Treatment

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  Hero Images:                                                │
│  - Apply subtle blue gradient overlay                       │
│  - Overlay: linear-gradient(rgba(10,36,99,0.7), ...)       │
│                                                              │
│  Feature Images:                                             │
│  - No overlay needed                                         │
│  - Consistent aspect ratios (16:9, 4:3)                     │
│                                                              │
│  Team Photos:                                                │
│  - Professional headshots                                    │
│  - Neutral background                                        │
│  - 1:1 aspect ratio                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

# Animation & Motion

## Principles
1. **Purposeful**: Every animation serves a function
2. **Fast**: Quick enough to not delay users
3. **Smooth**: Ease-out for entries, ease-in for exits
4. **Subtle**: Enhance, don't distract

## Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro-interactions | 150ms | ease-out |
| Button hover | 200ms | ease-in-out |
| Card hover | 200ms | ease-out |
| Page transitions | 300ms | ease-out |
| Scroll reveals | 500ms | ease-out |
| Complex animations | 600ms | ease-out |

## Standard Animations

```css
/* Fade In Up - Page elements */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Button Hover */
.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 90, 175, 0.3);
  transition: all 0.2s ease-out;
}

/* Card Hover */
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-out;
}
```

---

# Accessibility

## Color Contrast

All color combinations meet WCAG 2.1 AA standards:

| Foreground | Background | Contrast Ratio | Pass |
|------------|------------|----------------|------|
| #FFFFFF | #1E5AAF | 5.9:1 | ✅ AA |
| #FFFFFF | #0A2463 | 12.6:1 | ✅ AAA |
| #FFFFFF | #22C55E | 3.1:1 | ✅ Large text |
| #FFFFFF | #15803D | 5.1:1 | ✅ AA |
| #0A2463 | #FFFFFF | 12.6:1 | ✅ AAA |
| #4B5563 | #FFFFFF | 6.4:1 | ✅ AA |

## Accessibility Requirements

- Minimum touch target: 44x44px
- Focus states visible on all interactive elements
- Alt text for all images
- Proper heading hierarchy
- ARIA labels where needed
- Keyboard navigation support

---

# Platform Consistency

## Cross-Platform Application

| Platform | Primary Color | Accent Usage |
|----------|---------------|--------------|
| **Public Website** | Blue-dominant | Green for secondary CTAs |
| **Gryork (Main App)** | Blue-dominant | Green for success states |
| **GryLink** | Blue-dominant | Green for progress |
| **Officials Portal** | Blue-dominant | Green for approvals |

## Consistent Elements

1. **Logo**: Same logo across all platforms
2. **Colors**: Same palette, same usage rules
3. **Typography**: Inter font family everywhere
4. **Buttons**: Same button styles
5. **Cards**: Same card styles
6. **Spacing**: Same spacing system

---

# File Formats & Assets

## Logo Formats

| Format | Usage |
|--------|-------|
| `.svg` | Web, responsive contexts |
| `.png` | Where SVG not supported |
| `.ico` | Favicon |

## Logo Versions

| Version | File | Usage |
|---------|------|-------|
| Full Color | `logo.svg` | Default, light backgrounds |
| White | `logo-white.svg` | Dark backgrounds |
| Icon Only | `logo-icon.svg` | Favicon, small spaces |
| Horizontal | `logo-horizontal.svg` | Wide layouts |

---

**Version**: 1.0
**Last Updated**: January 2026
**Maintained by**: Gryork Design Team
