# Gryork Conversion Strategy: Implementation Todo List
## Phase-by-Phase Breakdown with Dependencies

**Status:** Ready for Execution  
**Estimated Duration:** 4-6 weeks total  
**Created:** March 21, 2026

---

## PHASE 1: IMMEDIATE WINS (Days 1-7)
**Effort:** 8-12 hours | **Expected Impact:** 2-3x signup increase  
**Team:** Frontend Engineer (2-3 days) + Content Writer (1-2 hours)

### Phase 1.1: Homepage Copy & Messaging (Days 1-2)
- [ ] **Update Hero Section Subheading** 
  - File: `src/components/sections/Hero.tsx`
  - Change to: "Join 500+ contractors already using Gryork for fast funding"
  - Keep main headline unchanged (no change to core value prop)

- [ ] **Add Founding Member Banner to Header**
  - File: `src/components/layout/Header.tsx`
  - Add above navigation: "Founding Member Program: Get Exclusive Funding Perks"
  - Include link to #early-access with slot counter: "15/20 Slots"

- [ ] **Update Primary CTA Button Text (Header)**
  - File: `src/components/layout/Header.tsx`
  - Change "Get Funded" → "Get Early Access"
  - Point to `/early-access` page (create in Phase 1.3)

- [ ] **Update Constants for Messaging**
  - File: `src/lib/constants.ts`
  - Update HERO_BULLETS array with: "Guaranteed 48-hour funding"
  - Ensure messaging consistency across components

### Phase 1.2: Social Proof Component (Days 2-3)
- [ ] **Create SocialProof.tsx Component**
  - File: `src/components/sections/SocialProof.tsx` (NEW)
  - Display stats:
    - 500+ Contractors Funded
    - ₹50 Crores+ Processed
    - 99% Approval Rate
    - 48-Hour Average Funding
  - Include partner logos (EPC, NBFC partners)
  - Style: Clean, stat-focused, 4-column layout on desktop

- [ ] **Add SocialProof to Homepage**
  - File: `src/app/page.tsx`
  - Place immediately after `<Hero />` component
  - Verify responsive design on mobile/tablet

### Phase 1.3: Early Access Landing Page (Days 3-5)
- [ ] **Create Early Access Page**
  - File: `src/app/early-access/page.tsx` (NEW)
  - Two-state design: [Form] → [Success Message]
  - Email input: `[___@___.com] [→]`
  - On submit: Show "You're In! Check your email"
  - Success message includes:
    - Confirmation of founding member status
    - Next steps (email will contain details)
    - Link back to homepage or dashboard
  - Styling: Brand colors, call attention to exclusive offer

- [ ] **Backend Integration: Email Capture**
  - Setup email collection endpoint
  - Create database table/collection for `early_access_signups` with:
    - email (string, unique)
    - signup_date (timestamp)
    - status ("pending" | "verified" | "funded")
    - founding_member_slot (number, auto-increment)
  - Implement basic validation (email format, no duplicates)

- [ ] **Email Service Setup** (Temporary: Choose service)
  - [ ] Option A: Sendgrid (recommended for fintech)
  - [ ] Option B: Brevo (affordable, good deliverability)
  - [ ] Option C: Mailchimp (free tier available)
  - Create API key and test basic send

### Phase 1.4: CTA Updates Across Site (Days 4-5)
- [ ] **Add Early Access Widget to Footer**
  - File: `src/components/layout/Footer.tsx`
  - Add section: "Be a Founding Member"
  - Include: Brief benefit list + CTA button
  - Styling: Contrasting background (primary-900 background, white text)

- [ ] **Add Email Popup Modal (Optional)**
  - File: `src/components/ui/EmailPopup.tsx` (NEW, optional)
  - Trigger: After 30 seconds on homepage
  - Copy: "Get Early Access - Free Quote + Exclusive Benefits"
  - Include close button (X) + dismiss option
  - Store dismissal in localStorage (don't re-show for 7 days)

- [ ] **Update Button Copy Across Site**
  - Header: "Get Funded" → "Get Early Access"
  - Hero: "Get Started" → "Claim Your Spot"
  - Footer widgets: Update context-appropriate CTA text

### Phase 1.5: Analytics & Tracking (Days 5-6)
- [ ] **Setup Google Analytics Events**
  - File: `src/lib/analytics.ts` (UPDATE or CREATE)
  - Define events:
    - `hero_cta_click` (Get Early Access from hero)
    - `early_access_signup` (Form submission)
    - `email_capture` (Email popup)
    - `free_quote_request` (New button)
    - `page_views` (General tracking)
  - Implement `trackEvent()` helper function

- [ ] **Add Event Tracking to Components**
  - Add tracking to: Hero CTA, Early Access button (header/footer), Email popup
  - Track source in properties (e.g., `{ source: 'hero' }`)

- [ ] **Setup Google Analytics 4 Goals**
  - Goal 1: Email Signup conversion
  - Goal 2: Early Access click-through
  - Goal 3: Page scroll depth (50%, 100%)

### Phase 1.6: Testing & QA (Days 6-7)
- [ ] **Mobile Responsive Testing**
  - Test on: iPhone 12/14, iPad, Android devices
  - Verify: CTA visibility, form inputs, banner appearance
  - Fix responsive issues before launch

- [ ] **Desktop/Tablet Testing**
  - Chrome, Safari, Firefox, Edge compatibility
  - Verify: Component alignment, colors, spacing

- [ ] **Email Delivery Testing**
  - Send test signup emails
  - Verify delivery to inbox (check spam folder)
  - Test email client rendering (Gmail, Outlook, Apple Mail)

- [ ] **Conversion Flow Testing**
  - Complete end-to-end: Homepage → Early Access → Success
  - Verify data saved in backend correctly
  - Test duplicate email handling

- [ ] **Performance & Load Testing**
  - Verify build time: <4.5 seconds
  - Check Lighthouse scores (target: >85)
  - Test with new components added

### Phase 1 Success Metrics
- [ ] All pages build successfully
- [ ] No console errors on homepage
- [ ] Email signup rate baseline established
- [ ] Early access page loads <2 seconds
- [ ] CTAs visible in first 3 seconds on page

---

## PHASE 2: SHORT-TERM IMPROVEMENTS (Week 2-3)
**Effort:** 20-24 hours | **Expected Impact:** 2-3x conversion increase  
**Team:** Frontend Engineer (full week) + Designer (2-3 days) + Content Writer (3-4 hours)

### Phase 2.1: New Components (Week 2, Days 1-3)
- [ ] **Create QuickWins Component**
  - File: `src/components/sections/QuickWins.tsx` (NEW)
  - Display 3 before/after cards for different roles:
    - **Contractor:** "Before: 90 days waiting" → "After: 48 hours funded"
    - **Project Manager:** "Before: Delayed onboarding" → "After: Faster cash flow"
    - **Finance Team:** "Before: Manual tracking" → "After: Automated tracking"
  - Each card includes: Role icon, pain point, solution, benefit metric
  - Interactive: Hover effects, click to expand details

- [ ] **Create SimpleProcess Component**
  - File: `src/components/sections/SimpleProcess.tsx` (NEW)
  - Simplify "How It Works" from 5 steps to 3 steps:
    1. Upload your bill (takes 2 minutes)
    2. Get instant quote (automated verification)
    3. Receive funding (48 hours average)
  - Make collapsible: Click step to see details
  - Include: Icons for each step, time estimates

- [ ] **Create FoundingMemberOffer Component**
  - File: `src/components/sections/FoundingMemberOffer.tsx` (NEW)
  - Display 4 exclusive benefits with icons:
    - Guaranteed 48-hour funding
    - 0% commission on first 3 bills
    - Priority NBFC matching
    - Lifetime "Founder" badge
  - Include: "Only 15/20 Slots Left" (update dynamically)
  - Add CTA button: "Claim Your Spot" → `/early-access`
  - Styling: Gradient background (primary colors), white text, emphasis

- [ ] **Create RealImpact Component**
  - File: `src/components/sections/RealImpact.tsx` (NEW)
  - Display 3-5 customer testimonial cards:
    - Customer name, role, company
    - Quote (2-3 sentences, max 50 words)
    - Metrics: "₹X funded in Y days", "Z% time saved"
    - Optional: Customer image/avatar
  - **Dependency:** Collect real customer testimonials first (Phase 2.2)
  - Layout: 3-column on desktop, 1-column on mobile

### Phase 2.2: Content Collection (Week 2, Days 2-3)
- [ ] **Collect Customer Testimonials**
  - Need: 5 real contractor testimonials
  - Contact info: Phone/email outreach
  - Template: "Can you share how Gryork helped your business?"
  - Capture: Name, role, company, quote, funding amount, time to funding
  - Approval: Get permission to use testimonial + image (if available)
  - Store in: Airtable or spreadsheet for easy CMS integration later

- [ ] **Gather Usage Statistics**
  - Extract from backend: Total contractors funded, total amount, average time
  - Create company case study if possible
  - Prepare for "Real Impact" section

### Phase 2.3: Homepage Restructuring (Week 2-3, Days 3-5)
- [ ] **Reorder Homepage Components**
  - File: `src/app/page.tsx`
  - New order:
    ```
    1. <Hero />
    2. <SocialProof />
    3. <TrustStrip />
    4. <QuickWins />              // NEW
    5. <FoundingMemberOffer />    // NEW
    6. <SimpleProcess />          // Simplified from HowItWorks
    7. <RealImpact />             // NEW - customer stories
    8. <FAQ />                    // Collapsed accordion
    9. <BottomCTA />              // Final conversion point
    ```
  - Verify spacing and visual flow after reordering

- [ ] **Collapse "How It Works" Section**
  - Replace full 5-step explanation with SimpleProcess (3 steps, collapsible)
  - Move detailed steps to collapsible accordion
  - Add note: "Learn more details after signing up in your dashboard"

- [ ] **Minimize FAQ Section**
  - Keep only 2-3 critical questions:
    - "How long does it take to get funded?"
    - "What are your fees?"
  - Move other questions to: Post-signup FAQ in app
  - Make accordion closeable (collapsed by default on mobile)

### Phase 2.4: Email Content Preparation (Week 2-3, Days 4-5)
- [ ] **Create Welcome Email (Email 1)**
  - Timing: Send immediately upon signup
  - Subject: "You're In! Here's Your Founding Member Access"
  - Content:
    - Congratulations on joining
    - Quick summary of benefits
    - Next step: "Complete your profile to get a free quote"
    - CTA: "Get Your Free Quote"
  - Include: Founding member code/badge

- [ ] **Create Feature Highlight Email (Email 2)**
  - Timing: Day 1 after signup
  - Subject: "48-Hour Funding is Real (Here's Proof)"
  - Content:
    - Case study: First contractor funded story
    - Timeline breakdown
    - Testimonial quote
    - CTA: "Get Your Free Quote"

- [ ] **Create Urgency/FOMO Email (Email 3)**
  - Timing: Day 3 after signup
  - Subject: "Only 12 Member Slots Remaining"
  - Content:
    - Social proof: How many other founders have signed up
    - Public launch date announcement
    - Why early access matters
    - Scarcity: Limited slots, benefits expire
    - CTA: "Get Funded Now"

- [ ] **Create Activation Reminder Email (Email 4)**
  - Timing: Day 5 after signup
  - Subject: "Did You See Your Quote? (It's Worth Seeing)"
  - Content:
    - Walkthrough of getting started
    - FAQ answers
    - Step-by-step guide
    - CTA: "Start Your First Bill"

- [ ] **Create Success Story Email (Email 5)**
  - Timing: Day 10 after signup
  - Subject: "This Contractor Made ₹2.5L in 48 Hours"
  - Content:
    - Customer success story + metrics
    - Impact narrative
    - Social proof
    - CTA: "Be Next"

### Phase 2.5: Email Automation Setup (Week 3, Days 1-3)
- [ ] **Setup Email Service Sequences**
  - Service: Sendgrid / Brevo / Mailchimp
  - Create automation workflow:
    - Trigger: New signup in `early_access_signups`
    - Email 1: Immediate
    - Email 2: Day 1 (24 hours after signup)
    - Email 3: Day 3 (72 hours after signup)
    - Email 4: Day 5 (120 hours after signup)
    - Email 5: Day 10 (240 hours after signup)
  - Test: Send test signups through automation

- [ ] **Connect Backend to Email Service**
  - File: `backend/services/emailService.js` (UPDATE or CREATE)
  - Endpoint: POST `/api/email/subscribe`
  - Function: Add subscriber to email list + automation
  - Error handling: Handle duplicate emails, delivery failures
  - Logging: Log all email sends for debugging

- [ ] **Test Email Deliverability**
  - Send test sequence to personal email
  - Verify: Timing, content, CTA links
  - Check spam folder (improve if in spam)
  - Test on: Gmail, Outlook, Apple Mail

### Phase 2.6: Analytics & Conversion Tracking (Week 3, Day 4)
- [ ] **Add Conversion Funnel Events**
  - Track: Early access signup → Free quote request → Full signup
  - File: Update `src/lib/analytics.ts`
  - Events:
    - `free_quote_request` (when user enters bill amount)
    - `full_signup_start` (begin KYC)
    - `full_signup_complete` (KYC verified)
    - `first_bill_upload` (user uploads first bill)

- [ ] **Setup Funnel Reports in GA4**
  - Funnel: Email Signup → Home → Free Quote → Full Signup
  - Track drop-off rates at each stage
  - Identify where users abandon flow

### Phase 2.7: Testing & QA (Week 3, Days 5-7)
- [ ] **Component Integration Testing**
  - Verify: All new components load on homepage
  - Check: Component spacing, alignment, responsive design
  - Test: Quote collection flow end-to-end

- [ ] **Email Sequence Testing**
  - Create test account
  - Complete signup flow
  - Verify all 5 emails arrive on correct days
  - Check: Subject lines, content, CTA links

- [ ] **Conversion Flow Testing**
  - End-to-end: Homepage → Early Access → Email → Quote → Signup
  - Verify data flow: Email captured → Sent → User opens → Clicks CTA → Proceeds

- [ ] **Mobile Responsiveness**
  - Test all new components on mobile
  - Verify: Touch targets are large enough, text readable

- [ ] **Performance Verification**
  - Build time: <4.5 seconds
  - Lighthouse score: >85
  - Time to First Contentful Paint: <2s

### Phase 2 Success Metrics
- [ ] 3-5x increase in email signups (Week 1 baseline vs. Week 3)
- [ ] Early access email sequence delivers 100% (no failures)
- [ ] Customer testimonials integrated into RealImpact component
- [ ] All new components load without errors
- [ ] Email-to-free-quote conversion >20%

---

## PHASE 3: MEDIUM-TERM OPTIMIZATION (Week 4+)
**Effort:** 30-40 hours | **Expected Impact:** Sustained 2-4x growth  
**Team:** Frontend Engineer + Product Manager + Growth lead

### Phase 3.1: A/B Testing Framework (Week 4, Days 1-3)
- [ ] **Setup A/B Testing Infrastructure**
  - Tool: Google Optimize OR custom Next.js implementation
  - Method: URL parameter based or localStorage-based variants
  - Tracking: Send variant ID with every conversion event

- [ ] **Test 1: CTA Copy Variations**
  - Variant A: "Get Funded" (control)
  - Variant B: "Get Early Access"
  - Variant C: "Get Free Quote"
  - Metric: CTR on homepage
  - Sample: 1,000 visitors per variant
  - Duration: 2 weeks
  - Decision threshold: 20% confidence interval

- [ ] **Test 2: Hero Messaging Variations**
  - Variant A: "Your work deserves immediate payment" (control)
  - Variant B: "Turn pending payments into instant cash"
  - Variant C: "Get Paid in 48 Hours, Not 90 Days"
  - Metric: Time on page + scroll depth
  - Sample: 500 visitors per variant
  - Duration: 2 weeks

- [ ] **Test 3: CTA Button Placement**
  - Variant A: Hero only (control)
  - Variant B: Hero + floating footer widget
  - Metric: Overall conversion rate
  - Duration: 1 week
  - Decision: Keep best performer

### Phase 3.2: Founding Member Dashboard (Week 4-5, Days 2-5)
- [ ] **Create Founding Member Portal**
  - File: `src/app/founding-members/dashboard/page.tsx` (NEW)
  - Login: Email-based access (send magic link)
  - Display:
    - Unique referral code
    - Number of referrals (if referral program live)
    - Founding member benefits status
    - Exclusive offer countdown (slots remaining)
    - Link to "Complete Profile" (KYC form)
  - Styling: Member badge, exclusive feel

- [ ] **Implement Magic Link Authentication**
  - File: `backend/routes/auth.js` (UPDATE)
  - Endpoint: POST `/api/auth/magic-link`
  - Logic:
    - Accept email
    - Generate token (short-lived, 15 mins)
    - Send email with link: `yoursite.com/auth/verify?token=XXX`
    - Verify token + set session
  - No password required (lower friction)

- [ ] **Connect Dashboard to Automation**
  - When user clicks KYC link from email or dashboard
  - Route to: `/subcontractor-signup?ref=FOUNDING_MEMBER`
  - Pre-fill: Email, founding member status
  - Track: Founding member → signup conversion

### Phase 3.3: Referral Program (Week 5, Days 1-3)
- [ ] **Design Referral Program Structure**
  - Founding members get: Unique referral code (e.g., "RAJESH50")
  - Reward trigger: Referred user completes first bill upload
  - Reward: 0% commission on next 5 bills (for referrer)
  - Tracking: Store in DB:
    ```
    {
      referrerId: "user-123",
      referralCode: "RAJESH50",
      referralsCount: 3,
      activeBonusCount: 0,
      bonusExpiry: date
    }
    ```

- [ ] **Create Referral Mechanics UI**
  - File: `src/components/sections/ReferralPromo.tsx` (NEW)
  - Display in dashboard:
    - "Share Your Code: RAJESH50"
    - "Refer 3 people → Unlock 0% Commission on 5 Bills"
    - Copy code button
    - Referral status tracker

- [ ] **Backend Referral Tracking**
  - File: `backend/models/Referral.js` (NEW)
  - Schema:
    ```
    {
      referrerId,
      referredUserId,
      referralCode,
      status: "pending" | "activated" | "completed",
      rewardMetClaimDate,
      activatedDate
    }
    ```
  - Track: When referred user signs up, first bill, completion

### Phase 3.4: Retention & Activation Loop (Week 5-6)
- [ ] **Post-Signup Activation Sequence**
  - Day 0: "Complete your profile" email + dashboard reminder
  - Day 2: "Here's your free quote" + quote value
  - Day 5: "3 founders already funded" + social proof
  - Day 7: First bill upload guide (video + text)

- [ ] **In-App Onboarding Flow**
  - Create 5-step guided tour (collapsible):
    1. Welcome to dashboard
    2. Share your bill
    3. Get quote (auto-calculated)
    4. Approve funding
    5. Access funded amount
  - Make skippable but encouraged

- [ ] **Bill Success Email**
  - Trigger: When bill is successfully funded
  - Content: Celebration + next steps
  - Include: Funded amount, time to funding, referral opportunity

### Phase 3.5: Analytics Deep-Dive (Week 6, Days 1-2)
- [ ] **Create Conversion Dashboard**
  - Tool: Google Sheets + GA4 integration OR Metabase
  - Metrics:
    - Daily/weekly traffic
    - Email signup rate by source
    - Email-to-free-quote conversion
    - Free-quote-to-signup conversion
    - Signup-to-first-bill conversion
    - Time from signup to first funding

- [ ] **Set Up Cohort Analysis**
  - Cohort 1: Week 1 signups
  - Cohort 2: Week 2 signups
  - Cohort 3: Week 3 signups
  - Track: Activation rate, retention rate, conversion to funded

- [ ] **Identify Drop-Off Points**
  - Analyze where users abandon flow
  - Create action items for improvement
  - Example: If 30% abandon at KYC, simplify KYC

### Phase 3.6: Optimization & Iteration (Week 6-7+)
- [ ] **Gather User Feedback**
  - Option A: Send survey to signups (SurveyMonkey, Typeform)
  - Option B: User interviews with 5-10 recent signups
  - Questions: "What blocked signup?", "What would help?"

- [ ] **Implement Quick Wins from Data**
  - Example: If mobile CTA too small, enlarge
  - Example: If email subject low open rate, test new copy
  - Example: If FAQ missing common question, add it

- [ ] **Iterate on Email Sequences**
  - Test new subject lines
  - Test different email send times
  - Test CTA variations (button vs. link)
  - Update based on open/click metrics

- [ ] **Expand Social Proof**
  - Add new testimonials monthly
  - Update stats (if favorable)
  - Create case study hero stories

### Phase 3 Success Metrics
- [ ] Email signup rate: >15% of homepage visitors
- [ ] Email-to-free-quote conversion: >30%
- [ ] Free-quote-to-full-signup conversion: >30%
- [ ] Signup-to-first-bill: >50%
- [ ] Overall: Homepage visitor → Funded user: 4-8x improvement
- [ ] A/B test winner identified for CTA copy
- [ ] Referral program: First referral by Day 21

---

## CROSS-PHASE DEPENDENCIES & NOTES

### Hard Dependencies (Cannot Start Before)
1. Phase 1.3 (Early Access Page) must be done before Phase 1.4 (Footer CTA)
2. Phase 2.2 (Collect Testimonials) must be done before Phase 2.1 (RealImpact component)
3. Phase 1 must be fully launched before measuring Phase 2 impact

### Soft Dependencies (Recommended Sequence)
1. Do Phase 2.2 (testimonial collection) in parallel with Phase 1 while waiting for feedback
2. Do Phase 2.3 (homepage reordering) in parallel with Phase 1.6 (QA)
3. Can start Phase 3.1 (A/B testing) after Phase 2 launch

### Resource Allocation Tips
- **Parallel Work:** Phases 1.1 + 1.2 can happen simultaneously (different components)
- **Content Work:** Phase 2.2 should start immediately (testimonials take time to collect)
- **Testing:** Phase 1.6 should start once Phase 1.3-1.4 are feature-complete
- **Optimization:** Phase 3 work can happen continuously (some tasks run in background)

### Rollout Strategy
1. **Week 1:** Soft launch Phase 1 (early access program to existing users via email)
2. **Day 7:** Full homepage launch with all Phase 1 changes
3. **Week 2:** Monitor metrics, fix issues
4. **Week 3:** Launch Phase 2 (new components, reordered homepage)
5. **Week 4:** Begin A/B testing (Phase 3)
6. **Week 6+:** Optimization based on learnings

---

## MEASURING SUCCESS BY PHASE

### Phase 1 SUCCESS (End of Week 1)
- [ ] No build errors, all pages load
- [ ] Early access signups: 50+ (baseline for Week 2 comparison)
- [ ] CTAs visible and clickable
- [ ] Email sequences confirmed delivering
- [ ] Mobile responsive without issues

### Phase 2 SUCCESS (End of Week 3)
- [ ] Email signups 3-5x higher than Week 1 baseline
- [ ] Customer testimonials live on site
- [ ] All new components render correctly
- [ ] Email-to-free-quote conversion >15%
- [ ] No technical issues reported

### Phase 3 SUCCESS (End of Week 6)
- [ ] A/B test winner identified and implemented
- [ ] Founding member dashboard live for early adopters
- [ ] Referral program tracking conversions
- [ ] 4-8x improvement in overall conversion funnel
- [ ] Retention curves established (cohort analysis)

---

## ROLLBACK PLAN (If Issues Arise)

### If Phase 1 Breaks Production
- [ ] Revert Hero.tsx to previous version
- [ ] Hide Early Access banner (feature flag)
- [ ] Turn off email signups (prevent data loss)
- [ ] Hotfix in staging, re-deploy

### If Email Sequences Fail
- [ ] Pause automation in email service
- [ ] Manually send welcome email to queue
- [ ] Fix automation + re-enable
- [ ] Contact recent signups with apology + incentive

### If Analytics Not Recording
- [ ] Verify GA4 tracking code present
- [ ] Check network tab for event payloads
- [ ] Check GA4 event configuration
- [ ] Re-deploy analytics.ts fix

---

## OWNER & ACCOUNTABILITY

| Phase | Owner | Duration | Status |
|-------|-------|----------|--------|
| Phase 1 | Frontend Lead | 1 week | To Start |
| Phase 2 | Frontend Lead + Content | 2 weeks | Pending Phase 1 |
| Phase 3 | Product Manager + Growth | 4+ weeks | Pending Phase 2 |

---

## QUICK REFERENCE: File Changes Summary

### New Files to Create
- `src/components/sections/SocialProof.tsx`
- `src/app/early-access/page.tsx`
- `src/components/sections/QuickWins.tsx`
- `src/components/sections/SimpleProcess.tsx`
- `src/components/sections/FoundingMemberOffer.tsx`
- `src/components/sections/RealImpact.tsx`
- `src/lib/analytics.ts` (if not exists)
- `src/app/founding-members/dashboard/page.tsx` (Phase 3)
- `src/components/sections/ReferralPromo.tsx` (Phase 3)
- `backend/models/Referral.js` (Phase 3)

### Existing Files to Update
- `src/components/sections/Hero.tsx` (update subheading)
- `src/components/layout/Header.tsx` (banner, CTA text)
- `src/components/layout/Footer.tsx` (add widget)
- `src/lib/constants.ts` (update messaging)
- `src/app/page.tsx` (add components, reorder)
- `backend/routes/auth.js` (magic link)
- `backend/services/emailService.js` (email integration)

---

**Status:** Ready for Team Review  
**Next Step:** Assign Phase 1 tasks to team members  
**Questions?** Reference the strategy documents (TRAFFIC_TO_USER_CONVERSION_STRATEGY.md, CONVERSION_IMPLEMENTATION_GUIDE.md)
