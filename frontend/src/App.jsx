import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Opportunities from "./pages/Opportunities";
import OpportunityDetails from "./pages/OpportunityDetails";
import Matches from "./pages/Matches";
import MatchDetails from "./pages/MatchDetails";
import Applications from "./pages/Applications";
import ApplicationDetails from "./pages/ApplicationDetails";
import CareerCopilotPage from "./pages/CareerCopilotPage";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import ResumeDashboard from "./pages/ResumeDashboard";
import ApplicationAssistant from "./pages/ApplicationAssistant";
import InterviewCoach from "./pages/InterviewCoach";
import CareerPlanner from "./pages/CareerPlanner";
import OpportunityMonitor from "./pages/OpportunityMonitor";
import CareerOS from "./pages/CareerOS";
import CareerAgent from "./pages/CareerAgent";

import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";

function App() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>

          {/* Public */}
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/signup"
            element={<Signup />}
          />
          <Route
            path="/register"
            element={<Signup />}
          />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/dashboard/agent"
                element={<CareerAgent />}
              />

              <Route
                path="/agent"
                element={<CareerAgent />}
              />

              <Route
                path="/dashboard/career-os"
                element={<CareerOS />}
              />

              <Route
                path="/career-os"
                element={<CareerOS />}
              />

              <Route
                path="/dashboard/profile"
                element={<Profile />}
              />

              <Route
                path="/profile"
                element={<Profile />}
              />

              <Route
                path="/dashboard/opportunities"
                element={<Opportunities />}
              />

              <Route
                path="/opportunities"
                element={<Opportunities />}
              />

              <Route
                path="/dashboard/opportunities/:id"
                element={<OpportunityDetails />}
              />

              <Route
                path="/opportunities/:id"
                element={<OpportunityDetails />}
              />

              <Route
                path="/dashboard/matches"
                element={<Matches />}
              />

              <Route
                path="/matches"
                element={<Matches />}
              />

              <Route
                path="/dashboard/matches/:id"
                element={<MatchDetails />}
              />

              <Route
                path="/matches/:id"
                element={<MatchDetails />}
              />

              <Route
                path="/ai-search"
                element={<Matches />}
              />

              <Route
                path="/dashboard/applications"
                element={<Applications />}
              />

              <Route
                path="/applications"
                element={<Applications />}
              />

              <Route
                path="/dashboard/applications/:id"
                element={<ApplicationDetails />}
              />

              <Route
                path="/applications/:id"
                element={<ApplicationDetails />}
              />

              <Route
                path="/dashboard/career-copilot"
                element={<CareerCopilotPage />}
              />

              <Route
                path="/career-copilot"
                element={<CareerCopilotPage />}
              />

              <Route
                path="/dashboard/notifications"
                element={<Notifications />}
              />

              <Route
                path="/notifications"
                element={<Notifications />}
              />

              <Route
                path="/dashboard/analytics"
                element={<Analytics />}
              />

              <Route
                path="/analytics"
                element={<Analytics />}
              />

              <Route
                path="/dashboard/settings"
                element={<Settings />}
              />

              <Route
                path="/settings"
                element={<Settings />}
              />

              <Route
                path="/dashboard/resume"
                element={<ResumeDashboard />}
              />

              <Route
                path="/resume"
                element={<ResumeDashboard />}
              />

              <Route
                path="/dashboard/application-assistant"
                element={<ApplicationAssistant />}
              />

              <Route
                path="/application-assistant"
                element={<ApplicationAssistant />}
              />

              <Route
                path="/dashboard/interview-coach"
                element={<InterviewCoach />}
              />

              <Route
                path="/interview-coach"
                element={<InterviewCoach />}
              />

              <Route
                path="/dashboard/career-planner"
                element={<CareerPlanner />}
              />

              <Route
                path="/career-planner"
                element={<CareerPlanner />}
              />

              <Route
                path="/dashboard/opportunity-monitor"
                element={<OpportunityMonitor />}
              />

              <Route
                path="/opportunity-monitor"
                element={<OpportunityMonitor />}
              />

              <Route
                path="*"
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />

            </Route>
          </Route>

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </GlobalErrorBoundary>
  );
}

export default App;
