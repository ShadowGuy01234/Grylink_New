import { Header, Footer } from "@/components/layout";
import { Hero, SocialProof } from "@/components/sections";
import dynamic from "next/dynamic";

// Lazy load below-the-fold components for better initial page load
const TrustStrip = dynamic(() => 
  import("@/components/sections").then(mod => ({ default: mod.TrustStrip })),
  { loading: () => null }
);

const PainPoints = dynamic(() => 
  import("@/components/sections").then(mod => ({ default: mod.PainPoints })),
  { loading: () => null }
);

const SimpleProcess = dynamic(() => 
  import("@/components/sections").then(mod => ({ default: mod.SimpleProcess })),
  { loading: () => null }
);

const QuickWins = dynamic(() => 
  import("@/components/sections").then(mod => ({ default: mod.QuickWins })),
  { loading: () => null }
);

const FoundingMemberOffer = dynamic(() => 
  import("@/components/sections").then(mod => ({ default: mod.FoundingMemberOffer })),
  { loading: () => null }
);

const Features = dynamic(() => 
  import("@/components/sections").then(mod => ({ default: mod.Features })),
  { loading: () => null }
);

const RealImpact = dynamic(() => 
  import("@/components/sections").then(mod => ({ default: mod.RealImpact })),
  { loading: () => null }
);

const HowItWorks = dynamic(() => 
  import("@/components/sections").then(mod => ({ default: mod.HowItWorks })),
  { loading: () => null }
);

const ForStakeholders = dynamic(() => 
  import("@/components/sections").then(mod => ({ default: mod.ForStakeholders })),
  { loading: () => null }
);

const Testimonials = dynamic(() => 
  import("@/components/sections").then(mod => ({ default: mod.Testimonials })),
  { loading: () => null }
);

const FAQ = dynamic(() => 
  import("@/components/sections").then(mod => ({ default: mod.FAQ })),
  { loading: () => null }
);

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
        {/* 7. Exclusive Member Offer — exclusive benefits section with urgency */}
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

