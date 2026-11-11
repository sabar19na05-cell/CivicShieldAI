import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { Landing } from "./pages/public/Landing";
import { Login } from "./pages/public/Login";
import { Register } from "./pages/public/Register";
import { NotFound } from "./pages/public/NotFound";

import { CitizenDashboard } from "./pages/citizen/CitizenDashboard";
import { ReportIssue } from "./pages/citizen/ReportIssue";
import { MyReports } from "./pages/citizen/MyReports";
import { IssueDetails } from "./pages/citizen/IssueDetails";
import { NearbyIssues } from "./pages/citizen/NearbyIssues";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { InfrastructureMap } from "./pages/admin/InfrastructureMap";
import { IncidentManagement } from "./pages/admin/IncidentManagement";
import { AIDetectionCenter } from "./pages/admin/AIDetectionCenter";
import { PredictiveMaintenance } from "./pages/admin/PredictiveMaintenance";
import { IoTMonitoring } from "./pages/admin/IoTMonitoring";
import { Analytics } from "./pages/admin/Analytics";

import { WorkerDashboard } from "./pages/worker/WorkerDashboard";
import { AssignedTasks } from "./pages/worker/AssignedTasks";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/citizen"
        element={
          <ProtectedRoute roles={["citizen"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CitizenDashboard />} />
        <Route path="report" element={<ReportIssue />} />
        <Route path="my-reports" element={<MyReports />} />
        <Route path="reports/:id" element={<IssueDetails />} />
        <Route path="map" element={<NearbyIssues />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="incidents" element={<IncidentManagement />} />
        <Route path="incidents/:id" element={<IssueDetails />} />
        <Route path="map" element={<InfrastructureMap />} />
        <Route path="ai-center" element={<AIDetectionCenter />} />
        <Route path="predictive" element={<PredictiveMaintenance />} />
        <Route path="iot" element={<IoTMonitoring />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      <Route
        path="/worker"
        element={
          <ProtectedRoute roles={["worker"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WorkerDashboard />} />
        <Route path="tasks" element={<AssignedTasks />} />
        <Route path="tasks/:id" element={<IssueDetails />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
