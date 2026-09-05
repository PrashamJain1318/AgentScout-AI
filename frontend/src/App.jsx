import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";
import AppPageLoader from "./components/common/AppPageLoader";
import OfflineBanner from "./components/common/OfflineBanner";
import { ToastProvider } from "./components/motion/ToastProvider";

// Direct Core Imports for Immediate Shell Boot
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Lazy Loaded Route Chunks
const Profile = lazy(() => import("./pages/Profile"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const OpportunityDetails = lazy(() => import("./pages/OpportunityDetails"));
const Matches = lazy(() => import("./pages/Matches"));
const MatchDetails = lazy(() => import("./pages/MatchDetails"));
const Applications = lazy(() => import("./pages/Applications"));
const ApplicationDetails = lazy(() => import("./pages/ApplicationDetails"));
const CareerCopilotPage = lazy(() => import("./pages/CareerCopilotPage"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const ResumeDashboard = lazy(() => import("./pages/ResumeDashboard"));
const ApplicationAssistant = lazy(() => import("./pages/ApplicationAssistant"));
const InterviewCoach = lazy(() => import("./pages/InterviewCoach"));
const CareerPlanner = lazy(() => import("./pages/CareerPlanner"));
const OpportunityMonitor = lazy(() => import("./pages/OpportunityMonitor"));
const CareerOS = lazy(() => import("./pages/CareerOS"));
const CareerAgent = lazy(() => import("./pages/CareerAgent"));
const ApplicationAgent = lazy(() => import("./pages/ApplicationAgent"));
const CareerIntelligence = lazy(() => import("./pages/CareerIntelligence"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <OfflineBanner />
              <Suspense fallback={<AppPageLoader />}>
                <Routes>
                  {/* Public Authentication & Landing Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/register" element={<Signup />} />
                  <Route path="/" element={<LandingPage />} />

                  {/* Authenticated Workspace Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/dashboard/agent" element={<CareerAgent />} />
                      <Route path="/agent" element={<CareerAgent />} />
                      <Route path="/dashboard/career-os" element={<CareerOS />} />
                      <Route path="/career-os" element={<CareerOS />} />
                      <Route path="/dashboard/application-agent" element={<ApplicationAgent />} />
                      <Route path="/application-agent" element={<ApplicationAgent />} />
                      <Route path="/dashboard/profile" element={<Profile />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/dashboard/opportunities" element={<Opportunities />} />
                      <Route path="/opportunities" element={<Opportunities />} />
                      <Route path="/dashboard/opportunities/:id" element={<OpportunityDetails />} />
                      <Route path="/opportunities/:id" element={<OpportunityDetails />} />
                      <Route path="/dashboard/matches" element={<Matches />} />
                      <Route path="/matches" element={<Matches />} />
                      <Route path="/dashboard/matches/:id" element={<MatchDetails />} />
                      <Route path="/matches/:id" element={<MatchDetails />} />
                      <Route path="/ai-search" element={<Matches />} />
                      <Route path="/dashboard/applications" element={<Applications />} />
                      <Route path="/applications" element={<Applications />} />
                      <Route path="/dashboard/applications/:id" element={<ApplicationDetails />} />
                      <Route path="/applications/:id" element={<ApplicationDetails />} />
                      <Route path="/dashboard/career-copilot" element={<CareerCopilotPage />} />
                      <Route path="/career-copilot" element={<CareerCopilotPage />} />
                      <Route path="/dashboard/notifications" element={<Notifications />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/dashboard/analytics" element={<Analytics />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/dashboard/settings" element={<Settings />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/dashboard/resume" element={<ResumeDashboard />} />
                      <Route path="/resume" element={<ResumeDashboard />} />
                      <Route path="/dashboard/application-assistant" element={<ApplicationAssistant />} />
                      <Route path="/application-assistant" element={<ApplicationAssistant />} />
                      <Route path="/dashboard/interview-coach" element={<InterviewCoach />} />
                      <Route path="/interview-coach" element={<InterviewCoach />} />
                      <Route path="/dashboard/career-planner" element={<CareerPlanner />} />
                      <Route path="/career-planner" element={<CareerPlanner />} />
                      <Route path="/dashboard/opportunity-monitor" element={<OpportunityMonitor />} />
                      <Route path="/opportunity-monitor" element={<OpportunityMonitor />} />
                      <Route path="/dashboard/career-intelligence" element={<CareerIntelligence />} />
                      <Route path="/career-intelligence" element={<CareerIntelligence />} />
                    </Route>
                  </Route>

                  {/* Wildcard 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
