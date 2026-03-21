import { Header, Footer } from "@/components/layout";
import {
  Hero,
  SocialProof,
  TrustStrip,
  PainPoints,
  QuickWins,
  SimpleProcess,
  FoundingMemberOffer,
  RealImpact,
  Features,
  HowItWorks,
  ForStakeholders,
  Testimonials,
  FAQ,
} from "@/components/sections";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* 1. Hero — SC-focused headline + pipeline visual */}
        <Hero />
        {/* 2. Social Proof — Stats with social trust signals */}
        <SocialProof />
        {/* 3. Trust Strip — live stats + NBFC logos slider */}
        <TrustStrip />
        {/* 4. Pain Points — before/after comparison + eligibility */}
        <PainPoints />
        {/* 5. Simple Process — 3-step collapsible process (before role breakdown) */}
        <SimpleProcess />
        {/* 6. Quick Wins — role-specific benefits for 3 stakeholders */}
        <QuickWins />
        {/* 7. Founding Member Offer — exclusive benefits section with urgency */}
        <FoundingMemberOffer />
        {/* 8. Features — SC pain-relief feature grid + detailed benefits */}
        <Features />
        {/* 9. Real Impact — metrics + contractor testimonials + social proof */}
        <RealImpact />
        {/* 10. How It Works — detailed 5-step SC funding journey */}
        <HowItWorks />
        {/* 11. For Stakeholders — SC featured + EPC + NBFC cards */}
        <ForStakeholders />
        {/* 12. Testimonials — additional SC voices + role badges */}
        <Testimonials />
        {/* 13. FAQ — accordion, SC-focused objection handling */}
        <FAQ />
      </main>
      <Footer />
    </>
  );
}

