import { Suspense, lazy } from "react";
import { Routes, Route, useNavigate } from "react-router";

import { DataProvider } from "@/services/DataProvider";
import { DeveloperModeProvider } from "@/services/developerMode";

// Code-split the top-level routes so the initial bundle only ships what the
// landing page needs; the rest is fetched on demand.
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const AppShell = lazy(() => import("@/app/AppShell"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        加载中…
      </div>
    </div>
  );
}

// ─── App Entry ────────────────────────────────────────────────────────────────

export default function App() {
  const navigate = useNavigate();

  return (
    <DeveloperModeProvider>
      <DataProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage onStart={() => navigate("/app")} />} />
            <Route path="/app" element={<AppShell />} />
          </Routes>
        </Suspense>
      </DataProvider>
    </DeveloperModeProvider>
  );
}
