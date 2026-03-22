import { Header, Footer } from "@/components/layout";
import { HeroDynamicRole, MetricsBanner, ProblemSolutionBento, ProcessStickyScroll, EligibilityChecklist, SocialProof } from "@/components/sections";
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
        {/* 1. Dynamic Role Hero */}
        <HeroDynamicRole />
        {/* 2. Metrics Banner */}
        <MetricsBanner />
        {/* 3. Social Proof */}
        <SocialProof />
        {/* 4. Trust Strip */}
        <TrustStrip />
        {/* 5. Problem/Solution Bento */}
        <ProblemSolutionBento />
        {/* 6. Pain Points */}
        <PainPoints />
        {/* 7. Sticky Process Scroll */}
        <ProcessStickyScroll />
        {/* 8. Simple Process */}
        <SimpleProcess />
        {/* 9. Quick Wins */}
        <QuickWins />
        {/* 10. Eligibility Checklist */}
        <EligibilityChecklist />
        {/* 11. Exclusive Member Offer */}
        <FoundingMemberOffer />
        {/* 12. Features */}
        <Features />
        {/* 13. Real Impact */}
        <RealImpact />
        {/* 14. How It Works */}
        <HowItWorks />
        {/* 15. For Stakeholders */}
        <ForStakeholders />
        {/* 16. Testimonials */}
        <Testimonials />
        {/* 17. FAQ */}
        <FAQ />
      </main>
      <Footer />
    </>
  );
}

