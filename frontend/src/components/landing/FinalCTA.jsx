import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const FinalCTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="final-cta-section">
      <div className="final-cta-card">
        <div className="final-cta-glow-sphere" />

        <div className="final-cta-content">
          <div className="final-cta-badge">
            <Sparkles size={14} />
            <span>START TODAY FOR FREE</span>
          </div>

          <h2 className="final-cta-heading">
            Your Career Deserves Better Than Guesswork.
          </h2>

          <p className="final-cta-subtext">
            Let AgentScout-AI help you understand where you are, where you can go, and what to do next.
          </p>

          <div className="final-cta-buttons">
            {user ? (
              <button
                type="button"
                className="final-primary-btn"
                onClick={() => navigate("/dashboard")}
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="final-primary-btn"
                  onClick={() => navigate("/signup")}
                >
                  <span>Start Your Career Journey</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  className="final-secondary-btn"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
