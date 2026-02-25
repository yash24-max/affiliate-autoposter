import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import DashboardPage from "./features/dashboard/DashboardPage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import SetupWizard from "./features/setup/SetupWizard";
import SchedulePage from "./features/schedule/SchedulePage";
import { ProtectedRoute, PublicRoute } from "./providers/RouteGuards";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/setup" element={<SetupWizard />} />
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="settings" element={<div className="p-8">Configuration Page Placeholder</div>} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="analytics" element={<div className="p-8">Analytics Page Placeholder</div>} />
          <Route path="help" element={<div className="p-8">Help Page Placeholder</div>} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
