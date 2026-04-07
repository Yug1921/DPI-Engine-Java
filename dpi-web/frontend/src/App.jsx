import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import AnalysisPage from "./pages/AnalysisPage";
import ReportsPage from "./pages/ReportsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/analysis" element={<AnalysisPage />} />
      <Route path="/reports" element={<ReportsPage />} />
    </Routes>
  );
}