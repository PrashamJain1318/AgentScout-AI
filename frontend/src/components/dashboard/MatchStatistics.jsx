import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Trophy,
  Target,
  Award,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { getMatches } from "../../services/matches.api";
import { getRecommendedOpportunities } from "../../services/opportunities.api";

const MatchStatistics = () => {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatchesData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Primary fetch via matches.api module
      const resData = await getMatches();
      let list = resData.matches || resData.data || resData || [];

      // Fallback if empty
      if (!Array.isArray(list) || list.length === 0) {
        const recData = await getRecommendedOpportunities();
        list = recData.opportunities || recData.data || recData || [];
      }

      setMatches(Array.isArray(list) ? list : []);
    } catch (err) {
      setError("Unable to load match statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchesData();
  }, []);

  if (loading) {
    return (
      <div className="match-statistics-card skeleton-card" style={{ minHeight: "220px" }}>
        <div className="skeleton-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="match-statistics-card error-card">
        <div className="inline-error-state">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={fetchMatchesData} className="retry-btn">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Exact Numeric Calculations on MongoDB-backed Data
  const scores = matches.map((m) => m.matchScore || m.score || m.overallScore || 0).filter((s) => s > 0);
  const totalMatches = matches.length;

  const excellentMatches = scores.filter((s) => s >= 85).length;
  const goodMatches = scores.filter((s) => s >= 70 && s < 85).length;

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((acc, curr) => acc + curr, 0) / scores.length)
      : 0;

  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

  // Find Top Matching Opportunity
  const topOpportunity = matches.length > 0
    ? [...matches].sort((a, b) => (b.matchScore || b.score || 0) - (a.matchScore || a.score || 0))[0]
    : null;

  return (
    <section className="match-statistics-card" role="region" aria-label="AI Match Statistics">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">AI INTELLIGENCE</span>
          <h3>Match Statistics & Performance</h3>
        </div>

        <button
          type="button"
          className="section-link-btn"
          onClick={() => navigate("/ai-search")}
        >
          <span>View All Matches</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {totalMatches === 0 ? (
        <div className="empty-state-box">
          <Target size={32} className="empty-icon" />
          <h4>No AI Match Statistics Available</h4>
          <p>Complete your profile skills to generate personalized match scores across available opportunities.</p>
          <button
            type="button"
            className="primary-action-btn"
            onClick={() => navigate("/dashboard/profile")}
          >
            Update Profile Skills
          </button>
        </div>
      ) : (
        <div className="match-stats-body">
          <div className="match-kpi-subgrid">
            <div className="match-stat-box">
              <div className="stat-box-icon avg-icon">
                <Sparkles size={16} />
              </div>
              <div className="stat-box-data">
                <span>Avg Match Score</span>
                <strong>{averageScore > 0 ? `${averageScore}%` : "—"}</strong>
              </div>
            </div>

            <div className="match-stat-box">
              <div className="stat-box-icon top-icon">
                <Trophy size={16} />
              </div>
              <div className="stat-box-data">
                <span>Top Match Score</span>
                <strong>{highestScore > 0 ? `${highestScore}%` : "—"}</strong>
              </div>
            </div>

            <div className="match-stat-box">
              <div className="stat-box-icon total-icon">
                <Target size={16} />
              </div>
              <div className="stat-box-data">
                <span>Total Matches</span>
                <strong>{totalMatches}</strong>
              </div>
            </div>

            <div className="match-stat-box">
              <div className="stat-box-icon excel-icon">
                <Award size={16} />
              </div>
              <div className="stat-box-data">
                <span>Excellent (≥85%)</span>
                <strong>{excellentMatches}</strong>
              </div>
            </div>

            <div className="match-stat-box">
              <div className="stat-box-icon good-icon">
                <CheckCircle2 size={16} />
              </div>
              <div className="stat-box-data">
                <span>Good (70-84%)</span>
                <strong>{goodMatches}</strong>
              </div>
            </div>
          </div>

          {topOpportunity && (
            <div className="top-match-highlight">
              <div className="highlight-badge">
                <Trophy size={13} />
                <span>TOP MATCH OPPORTUNITY</span>
              </div>

              <div className="highlight-content">
                <div>
                  <h4>{topOpportunity.title || topOpportunity.opportunityId?.title || "Role"}</h4>
                  <span className="company-name">{topOpportunity.company || topOpportunity.opportunityId?.company || "Company"}</span>
                </div>

                <span className="highlight-score-badge">
                  <Sparkles size={13} />
                  {topOpportunity.matchScore || topOpportunity.score}% Match
                </span>
              </div>

              <div className="highlight-meta">
                {(topOpportunity.location || topOpportunity.opportunityId?.location) && (
                  <span>
                    <MapPin size={12} /> {topOpportunity.location || topOpportunity.opportunityId?.location}
                  </span>
                )}
                {(topOpportunity.type || topOpportunity.opportunityId?.type) && (
                  <span className="meta-pill">{topOpportunity.type || topOpportunity.opportunityId?.type}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default MatchStatistics;
