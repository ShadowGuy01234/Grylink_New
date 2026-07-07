import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StudentAuthProvider } from "./context/StudentAuthContext";
import { Layout } from "./components/layout/Layout";
import { HomePage } from "./pages/HomePage";
import { ProgramPage } from "./pages/ProgramPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./pages/dashboard/DashboardLayout";
import { DashboardHome } from "./pages/dashboard/DashboardHome";
import { SchedulePage } from "./pages/dashboard/SchedulePage";
import { MeetingsPage } from "./pages/dashboard/MeetingsPage";
import { AnnouncementsPage } from "./pages/dashboard/AnnouncementsPage";
import { ProjectsPage } from "./pages/dashboard/ProjectsPage";
import { ReferralsPage } from "./pages/dashboard/ReferralsPage";
import { CertificatePage } from "./pages/dashboard/CertificatePage";
import { JoiningLetterPage } from "./pages/dashboard/JoiningLetterPage";
import { VerifyCertificate } from "./pages/VerifyCertificate";
import { VerifyJoiningLetter } from "./pages/VerifyJoiningLetter";

export default function App() {
  return (
    <StudentAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public marketing pages */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/program" element={<ProgramPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/verify-certificate/:certId" element={<VerifyCertificate />} />
            <Route path="/verify-joining-letter/:letterId" element={<VerifyJoiningLetter />} />
          </Route>

          {/* Student auth */}
          <Route path="/login" element={<LoginPage />} />


          {/* Protected student dashboard */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="meetings" element={<MeetingsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="referrals" element={<ReferralsPage />} />
            <Route path="certificate" element={<CertificatePage />} />
            <Route path="joining-letter" element={<JoiningLetterPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </StudentAuthProvider>
  );
}
