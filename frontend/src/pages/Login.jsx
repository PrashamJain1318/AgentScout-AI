import { useState, useEffect, lazy, Suspense } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Sparkles,
  Briefcase,
  Bot,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthVerification from "../components/auth/AuthVerification";
import ThemeToggle from "../components/layout/ThemeToggle";

const Auth3DCanvas = lazy(() => import("../components/auth/Auth3DCanvas"));

const Login = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlError = params.get("error");
    if (urlError) {
      setError(urlError);
    }
  }, [location.search]);

  if (loading) {
    return <AuthVerification state="CHECKING" fullScreen={true} />;
  }

  if (user) {
    const destination = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);
      await login({
        email: form.email.trim(),
        password: form.password,
      });

      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      console.error("LOGIN PAGE ERROR:", err);
      setError(err.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (submitting || socialLoading) return;
    setError("");
    setSocialLoading(provider);

    const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
    window.location.href = `${apiBase}/auth/${provider}`;
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        
        {/* LEFT PANEL: Marketing & Features */}
        <section className="auth-marketing-panel" aria-label="AgentScout AI Platform Features" style={{ position: "relative" }}>
          <Suspense fallback={null}>
            <Auth3DCanvas />
          </Suspense>
          <div className="marketing-header">
            <div className="brand-logo">
              <span className="brand-mark">A</span>
              <span className="brand-name">AgentScout AI</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ThemeToggle compact={true} />
              <span className="platform-tag">AI Career Platform</span>
            </div>
          </div>

          <div className="marketing-hero">
            <h2>Find Opportunities.<br />Build Your Future.</h2>
            <p>
              AgentScout AI helps candidates discover the right opportunities, track active applications, and accelerate their careers with intelligent AI guidance.
            </p>
          </div>

          <div className="marketing-feature-cards">
            <div className="feature-card">
              <div className="feature-icon icon-indigo">
                <Sparkles size={20} />
              </div>
              <div className="feature-text">
                <h4>Smart Matching</h4>
                <p>AI matches you with the best opportunities for your skill set.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon icon-violet">
                <Briefcase size={20} />
              </div>
              <div className="feature-text">
                <h4>Track Applications</h4>
                <p>Stay organized and never miss an interview update or status change.</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon icon-emerald">
                <Bot size={20} />
              </div>
              <div className="feature-text">
                <h4>AI Career Copilot</h4>
                <p>Get personalized skill gap analysis and portfolio project ideas.</p>
              </div>
            </div>
          </div>

          <div className="marketing-footer">
            <ShieldCheck size={16} />
            <span>Trusted by candidates finding top tech and research positions</span>
          </div>
        </section>

        {/* RIGHT PANEL: Login Form */}
        <section className="auth-form-panel">
          <div className="form-content-box">
            
            <div className="form-heading">
              <h2>Welcome back 👋</h2>
              <p>Sign in to continue your journey with AgentScout AI</p>
            </div>

            {error && (
              <div className="auth-error-alert" role="alert">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              
              {/* Email Field */}
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <div className="input-field-wrapper">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={submitting || Boolean(socialLoading)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-field-wrapper">
                  <LockKeyhole size={18} className="field-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={submitting || Boolean(socialLoading)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="form-options-row">
                <label className="remember-checkbox">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        rememberMe: e.target.checked,
                      })
                    }
                    disabled={submitting || Boolean(socialLoading)}
                  />
                  <span>Remember me</span>
                </label>

                <a href="#forgot" onClick={(e) => { e.preventDefault(); setError("Please contact administrator or reset password."); }} className="forgot-link">
                  Forgot password?
                </a>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="auth-primary-btn"
                disabled={submitting || Boolean(socialLoading)}
              >
                {submitting ? (
                  <>
                    <Loader2 className="spin" size={18} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in →</span>
                )}
              </button>
            </form>

            {/* Social Divider */}
            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            {/* Social Login Buttons (Google + GitHub) */}
            <div className="social-buttons-grid">
              <button
                type="button"
                className="social-btn"
                onClick={() => handleSocialLogin("google")}
                disabled={submitting || Boolean(socialLoading)}
                aria-label="Continue with Google"
              >
                {socialLoading === "google" ? (
                  <>
                    <Loader2 className="spin" size={16} />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Google</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="social-btn"
                onClick={() => handleSocialLogin("github")}
                disabled={submitting || Boolean(socialLoading)}
                aria-label="Continue with GitHub"
              >
                {socialLoading === "github" ? (
                  <>
                    <Loader2 className="spin" size={16} />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer Links & Security Notice */}
            <div className="auth-footer-notice">
              <div className="security-badge">
                <ShieldCheck size={14} />
                <span>Your data is secure and encrypted</span>
              </div>

              <p className="signup-link-text">
                Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
};

export default Login;
