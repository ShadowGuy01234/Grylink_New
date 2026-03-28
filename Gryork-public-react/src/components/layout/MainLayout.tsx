import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingFeedbackWidget } from "../FloatingFeedbackWidget";

const GrybotWidget = lazy(() =>
  import("../GrybotWidget").then((module) => ({ default: module.GrybotWidget })),
);

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingFeedbackWidget showFloatingButton={false} />
      <Suspense fallback={null}>
        <GrybotWidget portal="public-react" usePublicEndpoint />
      </Suspense>
    </div>
  );
}
