import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import HomePage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SalesOverview from "./pages/sales/SalesOverview";
import CompaniesListPage from "./pages/sales/CompaniesListPage";
import CompanyDetailPage from "./pages/sales/CompanyDetailPage";
import SubContractorsListPage from "./pages/sales/SubContractorsListPage";
import SubContractorDetailPage from "./pages/sales/SubContractorDetailPage";
import GryLinksPage from "./pages/sales/GryLinksPage";
import OpsDashboard from "./pages/OpsDashboardNew";
import CasesPage from "./pages/CasesPage";
import AdminDashboard from "./pages/AdminDashboard";
import RmtDashboard from "./pages/RmtDashboard";
import RmtCasesPage from "./pages/RmtCasesPage";
import FounderDashboard from "./pages/FounderDashboard";
import AuditLogPage from "./pages/AuditLogPage";
// Ops dedicated pages
import EpcVerificationPage from "./pages/ops/EpcVerificationPage";
import BillVerificationPage from "./pages/ops/BillVerificationPage";
import KycVerificationPage from "./pages/ops/KycVerificationPage";
import SlaTrackerPage from "./pages/ops/SlaTrackerPage";

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  // Wait for auth to resolve before rendering any routes
  if (isLoading) {
    return <div className="page-loading">Loading...</div>;
  }

  // Not logged in — show home page and login options
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Logged in — role-based dashboard routes
  const homeRoute =
    user.role === "founder"
      ? "/founder"
      : user.role === "admin"
        ? "/admin"
        : user.role === "sales"
          ? "/sales"
          : user.role === "ops"
            ? "/ops"
            : user.role === "rmt"
              ? "/rmt"
              : "/cases";

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={homeRoute} replace />} />
        <Route
          path="sales"
          element={
            ["sales", "admin", "founder"].includes(user.role) ? (
              <SalesOverview />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="sales/companies"
          element={
            ["sales", "admin", "founder"].includes(user.role) ? (
              <CompaniesListPage />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="sales/companies/:id"
          element={
            ["sales", "admin", "founder"].includes(user.role) ? (
              <CompanyDetailPage />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="sales/subcontractors"
          element={
            ["sales", "admin", "founder"].includes(user.role) ? (
              <SubContractorsListPage />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="sales/subcontractors/:id"
          element={
            ["sales", "admin", "founder"].includes(user.role) ? (
              <SubContractorDetailPage />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="sales/grylinks"
          element={
            ["sales", "admin", "founder"].includes(user.role) ? (
              <GryLinksPage />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="ops"
          element={
            ["ops", "admin", "founder"].includes(user.role) ? (
              <OpsDashboard />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="ops/epc"
          element={
            ["ops", "admin", "founder"].includes(user.role) ? (
              <EpcVerificationPage />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="ops/bills"
          element={
            ["ops", "admin", "founder"].includes(user.role) ? (
              <BillVerificationPage />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="ops/kyc"
          element={
            ["ops", "admin", "founder"].includes(user.role) ? (
              <KycVerificationPage />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="ops/sla"
          element={
            ["ops", "admin", "founder"].includes(user.role) ? (
              <SlaTrackerPage />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="ops/cwcrf"
          element={
            ["ops", "admin", "founder"].includes(user.role) ? (
              <OpsDashboard defaultTab="cwcrf" />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="rmt"
          element={
            ["rmt", "admin", "founder"].includes(user.role) ? (
              <RmtDashboard />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="rmt/cases"
          element={
            ["rmt", "admin", "founder"].includes(user.role) ? (
              <RmtCasesPage />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="admin"
          element={
            ["admin", "founder"].includes(user.role) ? (
              <AdminDashboard />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="audit"
          element={
            ["admin", "founder", "ops"].includes(user.role) ? (
              <AuditLogPage />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route
          path="founder"
          element={
            user.role === "founder" ? (
              <FounderDashboard />
            ) : (
              <Navigate to={homeRoute} replace />
            )
          }
        />
        <Route path="cases" element={<CasesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
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
              background: "#1e293b",
              color: "#f1f5f9",
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
