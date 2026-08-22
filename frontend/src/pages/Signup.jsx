import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  User,
  Sparkles,
  Briefcase,
  Bot,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const { user, setUser, loading, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <Loader2 className="spin" size={32} />
        <span>Checking session...</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const password = form.password;

    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      const responseData = await register({
        firstName,
        lastName,
        email,
        password,
      });

      const registeredUser = responseData.user || responseData.data?.user || responseData.data || null;
      if (registeredUser) {
        setUser(registeredUser);
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        
        {/* LEFT PANEL: Marketing */}
        <section className="auth-marketing-panel" aria-label="AgentScout AI Registration Features">
          <div className="marketing-header">
            <div className="brand-logo">
              <span className="brand-mark">A</span>
              <span className="brand-name">AgentScout AI</span>
            </div>
            <span className="platform-tag">AI Career Platform</span>
          </div>

          <div className="marketing-hero">
            <h2>Start Your AI Career Journey.</h2>
            <p>
              Create your candidate profile to get real-time opportunity matches, custom skill gap recommendations, and application pipeline tracking.
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

        {/* RIGHT PANEL: Signup Form */}
        <section className="auth-form-panel">
          <div className="form-content-box">
            
            <div className="form-heading">
              <h2>Create your account 🚀</h2>
              <p>Start discovering AI-matched career opportunities</p>
            </div>

            {error && (
              <div className="auth-error-alert" role="alert">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              
              <div className="form-row-2col">
                <div className="input-group">
                  <label htmlFor="firstName">First Name *</label>
                  <div className="input-field-wrapper">
                    <User size={18} className="field-icon" />
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <div className="input-field-wrapper">
                    <User size={18} className="field-icon" />
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="input-group">
                <label htmlFor="email">Email Address *</label>
                <div className="input-field-wrapper">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="input-group">
                <label htmlFor="password">Password (min 8 chars) *</label>
                <div className="input-field-wrapper">
                  <LockKeyhole size={18} className="field-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    disabled={submitting}
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

              {/* Confirm Password Field */}
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="input-field-wrapper">
                  <LockKeyhole size={18} className="field-icon" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="auth-primary-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="spin" size={18} />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create account →</span>
                )}
              </button>
            </form>

            {/* Footer Links & Security Notice */}
            <div className="auth-footer-notice">
              <div className="security-badge">
                <ShieldCheck size={14} />
                <span>Your data is secure and encrypted</span>
              </div>

              <p className="signup-link-text">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
};

export default Signup;
