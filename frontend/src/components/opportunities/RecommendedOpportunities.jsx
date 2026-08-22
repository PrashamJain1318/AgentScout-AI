import { Sparkles, UserCheck, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OpportunityCard from "./OpportunityCard";
import RecommendedSkeleton from "./RecommendedSkeleton";

const RecommendedOpportunities = ({ recommendations, loading, error, onRetry }) => {
  const navigate = useNavigate();

  return (
    <section className="recommended-opportunities-section">
      <div className="section-title-header">
        <div className="title-with-badge">
          <Sparkles size={20} className="sparkle-active" />
          <h3>Recommended for You</h3>
        </div>
        <p>AI-selected opportunities based on your profile skills and preferences.</p>
      </div>

      {loading ? (
        <RecommendedSkeleton />
      ) : error ? (
        <div className="inline-error-state">
          <AlertCircle size={18} />
          <span>{error}</span>
          {onRetry && (
            <button type="button" onClick={onRetry} className="retry-btn">
              <RefreshCw size={14} /> Retry
            </button>
          )}
        </div>
      ) : !recommendations || recommendations.length === 0 ? (
        <div className="empty-state-box">
          <UserCheck size={36} className="empty-icon" />
          <h4>No Recommendations Yet</h4>
          <p>Complete your profile skills to receive AI-powered recommendations tailored to your background.</p>
          <button
            type="button"
            className="primary-action-btn"
            onClick={() => navigate("/dashboard/profile")}
          >
            Complete Profile
          </button>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((item) => {
            const opp = item.opportunity || item;
            const matchInfo = item.match || null;
            return (
              <OpportunityCard
                key={opp._id || opp.id}
                opportunity={opp}
                matchInfo={matchInfo}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default RecommendedOpportunities;
