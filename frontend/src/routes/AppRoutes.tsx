import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";

import { Landing } from "../pages/Landing";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { CandidateDashboard } from "../pages/CandidateDashboard";
import { RecruiterDashboard } from "../pages/RecruiterDashboard";
import { Reports } from "../pages/Reports";
import { ResumeUpload } from "../pages/ResumeUpload";
import { Settings } from "../pages/Settings";
import { Profile } from "../pages/Profile";
import { NotFound } from "../pages/NotFound";
import { RagChat } from "../pages/RagChat";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* TEMP DEBUG: Keep RAG route outside role guard */}
        <Route path="/rag-chat" element={<RagChat />} />
        <Route path="/ragchat" element={<Navigate to="/rag-chat" replace />} />

        {/* Protected Routes - All Logged-in Users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Candidate Routes */}
        <Route element={<ProtectedRoute allowedRoles={["candidate"]} />}>
          <Route path="/dashboard" element={<CandidateDashboard />} />
          <Route path="/resumes" element={<ResumeUpload />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* Recruiter Routes */}
        <Route element={<ProtectedRoute allowedRoles={["recruiter", "admin"]} />}>
          <Route path="/recruiter" element={<RecruiterDashboard />} />
          <Route path="/recruiter/candidates" element={<RecruiterDashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}