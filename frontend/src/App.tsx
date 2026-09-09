import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import Login from "./pages/Login";
import CitizenSubmit from "./pages/CitizenSubmit";
import CitizenTickets from "./pages/CitizenTickets";
import CitizenTrack from "./pages/CitizenTrack";
import DepthDashboard from "./pages/DepthDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import OfficerTicket from "./pages/OfficerTicket";
import OfficialIssueOrder from "./pages/OfficialIssueOrder";
import OfficialTickets from "./pages/OfficialTickets";
import OfficialTrack from "./pages/OfficialTrack";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/citizen/submit"
          element={
            <ProtectedRoute>
              <CitizenSubmit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/tickets"
          element={
            <ProtectedRoute>
              <CitizenTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/track/:ticketId"
          element={
            <ProtectedRoute>
              <CitizenTrack />
            </ProtectedRoute>
          }
        />
        <Route
          path="/depthead/dashboard"
          element={
            <ProtectedRoute>
              <DepthDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/dashboard"
          element={
            <ProtectedRoute>
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/ticket/:issueId"
          element={
            <ProtectedRoute>
              <OfficerTicket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/official/issue-order"
          element={
            <ProtectedRoute>
              <OfficialIssueOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/official/tickets"
          element={
            <ProtectedRoute>
              <OfficialTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/official/track/:ticketId"
          element={
            <ProtectedRoute>
              <OfficialTrack />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/citizen/tickets" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
