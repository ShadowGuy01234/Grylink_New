import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingFeedbackWidget } from "../FloatingFeedbackWidget";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingFeedbackWidget />
    </div>
  );
}
