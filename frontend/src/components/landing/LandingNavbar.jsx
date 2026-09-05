import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../layout/ThemeToggle";

const LandingNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className={`landing-navbar ${scrolled ? "is-scrolled" : ""}`}>
      <div className="landing-navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="landing-brand">
          <img
            src="/logo.jpg"
            alt="AgentScout-AI Logo"
            className="landing-brand-logo"
          />
          <div className="landing-brand-text">
            <span className="landing-brand-title">AgentScout-AI</span>
            <span className="landing-brand-tag">CAREER OS</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="landing-nav-links">
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => scrollToSection("features")}
          >
            Product
          </button>
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => scrollToSection("how-it-works")}
          >
            How It Works
          </button>
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => scrollToSection("agent-spotlight")}
          >
            AI Agent
          </button>
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => scrollToSection("capabilities")}
          >
            Capabilities
          </button>
        </nav>

        {/* Right Actions */}
        <div className="landing-nav-actions">
          <ThemeToggle />

          {user ? (
            <button
              type="button"
              className="landing-primary-cta"
              onClick={() => navigate("/dashboard")}
            >
              <LayoutDashboard size={16} />
              <span>Go to Dashboard</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button
                type="button"
                className="landing-login-btn"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>

              <button
                type="button"
                className="landing-primary-cta"
                onClick={() => navigate("/signup")}
              >
                <span>Get Started Free</span>
                <ArrowRight size={14} />
              </button>
            </>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="landing-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="landing-mobile-menu">
          <nav className="landing-mobile-nav">
            <button
              type="button"
              className="mobile-nav-link"
              onClick={() => scrollToSection("features")}
            >
              Product
            </button>
            <button
              type="button"
              className="mobile-nav-link"
              onClick={() => scrollToSection("how-it-works")}
            >
              How It Works
            </button>
            <button
              type="button"
              className="mobile-nav-link"
              onClick={() => scrollToSection("agent-spotlight")}
            >
              AI Agent
            </button>
            <button
              type="button"
              className="mobile-nav-link"
              onClick={() => scrollToSection("capabilities")}
            >
              Capabilities
            </button>

            <div className="mobile-nav-auth">
              {user ? (
                <button
                  type="button"
                  className="landing-primary-cta w-full"
                  onClick={() => navigate("/dashboard")}
                >
                  <LayoutDashboard size={16} />
                  <span>Go to Dashboard</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="landing-login-btn w-full"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className="landing-primary-cta w-full"
                    onClick={() => navigate("/signup")}
                  >
                    <span>Get Started Free</span>
                    <ArrowRight size={14} />
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
