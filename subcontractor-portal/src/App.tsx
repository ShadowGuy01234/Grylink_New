import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RegisterPage from "./pages/RegisterPage";
import ProfileCompletionPage from "./pages/ProfileCompletionPage";
import OnboardingPage from "./pages/OnboardingPage";
import CwcrfSubmissionPage from "./pages/CwcrfSubmissionPage";
import CwcrfDetailPage from "./pages/CwcrfDetailPage";
import SellerDeclarationPage from "./pages/SellerDeclarationPage";
import KycUploadPage from "./pages/KycUploadPage";
import MyCwcrfsPage from "./pages/MyCwcrfsPage";
import api from "./api";

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (user) {
        try {
          const res = await api.get("/subcontractor/profile");
          setProfileStatus(
            res.data.subContractor?.status || "PROFILE_INCOMPLETE",
          );
        } catch {
          setProfileStatus("PROFILE_INCOMPLETE");
        }
      }
      setCheckingProfile(false);
    };

    if (user) {
      checkProfileStatus();
    } else {
      setCheckingProfile(false);
    }
  }, [user]);

  if (isLoading || (user && checkingProfile)) {
    return <div className="page-loading">Loading...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding/:token" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Profile incomplete - force completion
  if (
    profileStatus === "PROFILE_INCOMPLETE" ||
    profileStatus === "LEAD_CREATED"
  ) {
    return (
      <Routes>
        <Route path="/complete-profile" element={<ProfileCompletionPage />} />
        <Route path="*" element={<Navigate to="/complete-profile" replace />} />
      </Routes>
    );
  }

  // KYC not yet completed — force fullscreen KYC page (no Layout)
  if (
    profileStatus === "PROFILE_COMPLETED" ||
    profileStatus === "KYC_PENDING" ||
    profileStatus === "KYC_IN_PROGRESS" ||
    profileStatus === "UNDER_REVIEW"
  ) {
    return (
      <Routes>
        <Route path="/kyc" element={<KycUploadPage />} />
        <Route path="*" element={<Navigate to="/kyc" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="declaration" element={<SellerDeclarationPage />} />
        <Route path="cwcrf" element={<CwcrfSubmissionPage />} />
        <Route path="cwcrf/:id" element={<CwcrfDetailPage />} />
        <Route path="my-cwcrfs" element={<MyCwcrfsPage />} />
        <Route path="complete-profile" element={<Navigate to="/" replace />} />
        <Route path="kyc" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a2e",
              color: "#e0e0e0",
              borderRadius: "8px",
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
