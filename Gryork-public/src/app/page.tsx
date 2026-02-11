import { Header, Footer } from "@/components/layout";
import {
  Hero,
  Features,
  HowItWorks,
  ForStakeholders,
  Testimonials,
  CTA,
} from "@/components/sections";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <ForStakeholders />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
