import { Header, Footer } from "@/components/layout";
import {
  Hero,
  TrustStrip,
  PainPoints,
  Features,
  HowItWorks,
  ForStakeholders,
  Testimonials,
  FAQ,
  CTA,
} from "@/components/sections";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* 1. Hero — SC-focused headline + pipeline visual */}
        <Hero />
        {/* 2. Trust Strip — live stats + NBFC logos slider */}
        <TrustStrip />
        {/* 3. Pain Points — before/after comparison + eligibility */}
        <PainPoints />
        {/* 4. Features — SC pain-relief feature grid */}
        <Features />
        {/* 5. How It Works — 5-step SC funding journey */}
        <HowItWorks />
        {/* 6. For Stakeholders — SC featured + EPC + NBFC cards */}
        <ForStakeholders />
        {/* 7. Testimonials — SC voices first, role badges */}
        <Testimonials />
        {/* 8. FAQ — accordion, SC-focused questions */}
        <FAQ />
        {/* 9. CTA — dual card SC/Partner split */}
        <CTA />
      </main>
      <Footer />
    </>
  );
}
