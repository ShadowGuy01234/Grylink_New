# Gryork Public UI Upgrade Document

## Objective
Rebuild Gryork Public into a premium, conversion-oriented React experience while preserving current business messaging for Sub-contractors, EPCs, and NBFCs.

## Product Direction
- Dark, institutional visual language for trust
- Role-aware messaging controlled by shared `activeRole` state
- Modern conversion UX: bento grids, sticky-scroll storytelling, micro-animations
- Modular, reusable section architecture

## Technical Foundation
- Framework: Next.js (existing app) with React + TypeScript
- Styling: Tailwind CSS with shared tokens
- Animation: Framer Motion
- State: React Context (`activeRole`)
- Forms: React Hook Form + Zod (existing pattern)
- Feedback API integration: `POST ${NEXT_PUBLIC_API_URL}/feedback`

## Design System Tokens
- Base: `slate-950` / `#0B0F19`
- Accent: Emerald (`#10B981`) and Cobalt (`#3B82F6`)
- Display font: Space Grotesk (fallback Plus Jakarta Sans)
- UI/Data font: Inter
- Surface style: glassmorphism, low-opacity borders, soft blurs

## Homepage Component Architecture (Upgraded)
1. `GlobalNavigation`
   - Fixed top
   - Transparent at top, frosted glass on scroll
   - Logo + contextual links + Login/Register style CTAs

2. `HeroDynamicRole`
   - Pill role toggle: Sub-contractor | EPC | NBFC
   - Updates shared `activeRole`
   - Role-specific headline and CTA
   - Animated right-side workflow visual

3. `MetricsBanner`
   - Animated counters triggered on viewport entry
   - Key proof points:
     - ₹1,000 Flat Platform Fee
     - 48 hrs Target Funding
     - 100% Digital Process
     - Zero Collateral

4. `ProblemSolutionBento`
   - Asymmetrical bento grid
   - Replaces text-heavy before/after blocks and trust lists

5. `ProcessStickyScroll`
   - Left sticky explanatory content
   - Right sticky mockup swapped by scroll-linked step activation
   - Five canonical steps: KYC -> CWCRF -> EPC verify -> NBFC bids -> Funded

6. `EligibilityChecklist`
   - Clean checklist with satisfying completion visuals

7. `FloatingFeedbackWidget`
   - Bottom-right FAB + slide-out drawer
   - Captures current role from context
   - Category switch: Bug | Idea | Question
   - Sends payload to backend API

## Content Mapping Source
- Existing centralized copy in `src/lib/constants.ts`
- Existing role pages:
  - `/for-subcontractors`
  - `/for-epc`
  - `/for-nbfc`
- Existing trust and process copy retained, presented in upgraded UI patterns

## Implementation Phases

### Phase 1 (In Progress)
- Add design tokens/utilities for premium theme
- Add role context provider
- Implement upgraded homepage sections
- Wire homepage to new sections

### Phase 2
- Upgrade role pages (`/for-subcontractors`, `/for-epc`, `/for-nbfc`) to same design language
- Standardize card/button/input surfaces across pages
- Align all page headers with upgraded navigation system

### Phase 3
- Connect existing lead/contact forms to production endpoints
- Add analytics events for role toggles, sticky steps, feedback submits
- Performance and responsive refinement

### Phase 4
- QA polish across mobile/tablet/desktop
- Accessibility pass (focus states, reduced motion, semantic structure)
- Conversion optimization iteration on CTA placements/copy

## Risks and Mitigations
- **Risk:** Theme mismatch between upgraded homepage and legacy pages  
  **Mitigation:** Scoped premium styles to upgraded components; migrate remaining pages in Phase 2.

- **Risk:** API endpoint variation for feedback payload  
  **Mitigation:** Env-driven endpoint and explicit error states in widget.

- **Risk:** Animation overhead on low-end devices  
  **Mitigation:** Keep animations subtle, use transform/opacity, avoid heavy continuous effects.

## Current Status
- Audit complete
- Upgrade blueprint documented (this file)
- Implementation started on homepage foundations
