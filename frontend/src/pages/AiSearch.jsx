import { useEffect, useState } from "react";
import {
  Sparkles,
  Trophy,
  Target,
  Award,
  CheckCircle2,
  MapPin,
  Building,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { getMatches } from "../services/matches.api";
import { getRecommendedOpportunities } from "../services/opportunities.api";

const AiSearch = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Score threshold filter: "all", "excellent" (>=85), "good" (70-84)
  const [scoreFilter, setScoreFilter] = useState("all");

  const fetchMatchesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await getMatches();
      let list = resData.matches || resData.data || resData || [];

      if (!Array.isArray(list) || list.length === 0) {
        const recData = await getRecommendedOpportunities();
        list = recData.opportunities || recData.data || recData || [];
      }

      setMatches(Array.isArray(list) ? list : []);
    } catch (err) {
      setError("Unable to load AI match intelligence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchesData();
  }, []);

  // Filtered match records
  const filteredMatches = matches.filter((m) => {
    const score = m.matchScore || m.score || 0;
    if (scoreFilter === "excellent") return score >= 85;
    if (scoreFilter === "good") return score >= 70 && score < 85;
    return true;
  });

  // Numeric Stats
  const scores = matches.map((m) => m.matchScore || m.score || 0).filter((s) => s > 0);
  const totalCount = matches.length;
  const excellentCount = scores.filter((s) => s >= 85).length;
  const goodCount = scores.filter((s) => s >= 70 && s < 85).length;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const topScore = scores.length > 0 ? Math.max(...scores) : 0;

  return (
    <div className="ai-search-page">
      
      {/* Header Banner */}
      <div className="page-header-banner">
        <div>
          <span className="eyebrow">MATCHING ENGINE</span>
          <h2>AI Candidate Match Explorer</h2>
          <p>Real-time candidate compatibility scores calculated from your profile skills and experience.</p>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="ai-metrics-row">
        <div className="ai-metric-card">
          <div className="metric-icon avg-icon">
            <Sparkles size={18} />
          </div>
          <div>
            <span>Average Match Score</span>
            <strong>{avgScore > 0 ? `${avgScore}%` : "—"}</strong>
          </div>
        </div>

        <div className="ai-metric-card">
          <div className="metric-icon top-icon">
            <Trophy size={18} />
          </div>
          <div>
            <span>Top Match Score</span>
            <strong>{topScore > 0 ? `${topScore}%` : "—"}</strong>
          </div>
        </div>

        <div className="ai-metric-card">
          <div className="metric-icon total-icon">
            <Target size={18} />
          </div>
          <div>
            <span>Total Matches</span>
            <strong>{totalCount}</strong>
          </div>
        </div>

        <div className="ai-metric-card">
          <div className="metric-icon excel-icon">
            <Award size={18} />
          </div>
          <div>
            <span>Excellent (≥85%)</span>
            <strong>{excellentCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="match-filter-tabs">
        <button
          type="button"
          className={`filter-tab ${scoreFilter === "all" ? "active" : ""}`}
          onClick={() => setScoreFilter("all")}
        >
          All Matches ({totalCount})
        </button>

        <button
          type="button"
          className={`filter-tab ${scoreFilter === "excellent" ? "active" : ""}`}
          onClick={() => setScoreFilter("excellent")}
        >
          <Award size={14} /> Excellent (≥85%) ({excellentCount})
        </button>

        <button
          type="button"
          className={`filter-tab ${scoreFilter === "good" ? "active" : ""}`}
          onClick={() => setScoreFilter("good")}
        >
          <CheckCircle2 size={14} /> Good (70-84%) ({goodCount})
        </button>
      </div>

      {/* Main Matches Grid */}
      {loading ? (
        <div className="matches-grid-layout">
          <div className="skeleton-card" style={{ height: "200px" }} />
          <div className="skeleton-card" style={{ height: "200px" }} />
        </div>
      ) : error ? (
        <div className="inline-error-state page-error-state">
          <AlertCircle size={22} />
          <span>{error}</span>
          <button type="button" onClick={fetchMatchesData} className="retry-btn">
            <RefreshCw size={14} /> Retry Loading
          </button>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="empty-state-box">
          <Target size={36} className="empty-icon" />
          <h4>No Matches Found in Selected Category</h4>
          <p>Try switching to "All Matches" or update your profile skills to generate fresh match records.</p>
        </div>
      ) : (
        <div className="matches-grid-layout">
          {filteredMatches.map((m) => {
            const title = m.title || m.opportunityId?.title || "Role";
            const company = m.company || m.opportunityId?.company || "Company";
            const location = m.location || m.opportunityId?.location || "Remote";
            const score = m.matchScore || m.score || 0;
            const matchedSkills = Array.isArray(m.matchedSkills) ? m.matchedSkills : [];
            const link = m.link || m.url || m.opportunityId?.link || "#";

            return (
              <div key={m._id || m.id} className="match-detail-card">
                <div className="match-card-header">
                  <div>
                    <h3>{title}</h3>
                    <span className="match-company-name">
                      <Building size={14} /> {company}
                    </span>
                  </div>

                  <span className="match-score-pill">
                    <Sparkles size={13} /> {score}% Match
                  </span>
                </div>

                <div className="match-location-row">
                  <MapPin size={13} />
                  <span>{location}</span>
                </div>

                {matchedSkills.length > 0 && (
                  <div className="match-skills-section">
                    <span className="skills-heading">Matched Skills:</span>
                    <div className="matched-chips-wrap">
                      {matchedSkills.map((s, idx) => (
                        <span key={idx} className="matched-skill-chip">
                          <CheckCircle2 size={11} /> {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="match-card-footer">
                  {link !== "#" && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-match-link"
                    >
                      <span>Apply Position</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AiSearch;
