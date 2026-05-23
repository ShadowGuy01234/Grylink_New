import { useEffect } from "react";
import { Hero } from "../components/Hero";
import About from "../components/About";
import { TrackCards } from "../components/TrackCards";
import { HomePricingBanner } from "../components/HomePricingBanner";

export function HomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <About />
      <TrackCards />
      <HomePricingBanner />
    </div>
  );
}
