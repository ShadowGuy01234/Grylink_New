import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingFeedbackWidget } from "../FloatingFeedbackWidget";
import { Zap } from "lucide-react";

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

      {/* Floating Action Button for Industrial Training */}
      <a
        href="https://training.gryork.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
      >
        <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
        <span className="font-semibold text-sm">Industrial Training '26</span>
      </a>
    </div>
  );
}
