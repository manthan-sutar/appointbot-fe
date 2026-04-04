import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Features from "./pages/Features";
import Signup from "./pages/Signup";
import DemoRequest from "./pages/DemoRequest";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import LeadAnalytics from "./pages/LeadAnalytics";
import Appointments from "./pages/Appointments";
import Customers from "./pages/Customers";
import Services from "./pages/operate/Services";
import Staff from "./pages/operate/Staff";
import WorkingHours from "./pages/operate/WorkingHours";
import CreateCampaign from "./pages/campaigns/Create";
import CampaignHistory from "./pages/campaigns/History";
import CampaignPerformance from "./pages/campaigns/Performance";
import CampaignTemplates from "./pages/campaigns/Templates";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
          {/* Public marketing */}
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/demo" element={<DemoRequest />} />
          <Route path="/pricing" element={<Navigate to="/demo" replace />} />

          {/* Auth */}
          <Route path="/dashboard/signup" element={<Signup />} />
          <Route path="/dashboard/login" element={<Login />} />

          {/* Onboarding */}
          <Route
            path="/dashboard/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* Protected dashboard */}
          <Route
            path="/dashboard/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/leads"
            element={
              <ProtectedRoute>
                <Layout>
                  <LeadAnalytics />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/appointments"
            element={
              <ProtectedRoute>
                <Layout>
                  <Appointments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/customers"
            element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/campaigns/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateCampaign />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/campaigns/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <CampaignHistory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/campaigns/performance"
            element={
              <ProtectedRoute>
                <Layout>
                  <CampaignPerformance />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/campaigns/templates"
            element={
              <ProtectedRoute>
                <Layout>
                  <CampaignTemplates />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/operate/services"
            element={
              <ProtectedRoute>
                <Layout>
                  <Services />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/operate/staff"
            element={
              <ProtectedRoute>
                <Layout>
                  <Staff />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/operate/working-hours"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorkingHours />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  );
}
