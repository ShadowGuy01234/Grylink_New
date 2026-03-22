import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { HomePage } from "./pages/HomePage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { ForSubcontractorsPage } from "./pages/ForSubcontractorsPage";
import { ForEpcPage } from "./pages/ForEpcPage";
import { ForNbfcPage } from "./pages/ForNbfcPage";
import { CommunityPage } from "./pages/CommunityPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { EarlyAccessPage } from "./pages/EarlyAccessPage";
import { CareersPage } from "./pages/CareersPage";
import { CareerRolePage } from "./pages/CareerRolePage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { TeamPage } from "./pages/TeamPage";
import { trackPageView } from "./lib/analytics";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    trackPageView();
  }, [location.pathname, location.search]);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/for-subcontractors" element={<ForSubcontractorsPage />} />
        <Route path="/for-epc" element={<ForEpcPage />} />
        <Route path="/for-nbfc" element={<ForNbfcPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/early-access" element={<EarlyAccessPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/careers/:slug" element={<CareerRolePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
