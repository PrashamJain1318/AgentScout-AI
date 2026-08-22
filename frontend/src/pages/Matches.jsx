import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Award,
  BarChart3,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { getMatches, generateMatches, getMatchAnalytics } from "../services/matches.api";
import MatchCard from "../components/matches/MatchCard";
import MatchCardSkeleton from "../components/matches/MatchCardSkeleton";
import MatchStatsSkeleton from "../components/matches/MatchStatsSkeleton";

const Matches = () => {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [sortOption, setSortOption] = useState("best");

  // Notification Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const fetchMatchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [matchesRes, analyticsRes] = await Promise.allSettled([
        getMatches(),
        getMatchAnalytics(),
      ]);

      if (matchesRes.status === "fulfilled") {
        const list = matchesRes.value.matches || matchesRes.value.data || [];
        setMatches(Array.isArray(list) ? list : []);
      } else {
        setError("Unable to load AI matches.");
      }

      if (analyticsRes.status === "fulfilled") {
        setAnalytics(analyticsRes.value.analytics || null);
      }
    } catch (err) {
      setError("Unable to load AI matches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchData();
  }, []);

  const handleRefreshMatches = async () => {
    setGenerating(true);
    try {
      await generateMatches({ limit: 20 });
      showToast("AI Match Engine refreshed!");
      await fetchMatchData();
    } catch (err) {
      showToast("Failed to refresh matches.");
    } finally {
      setGenerating(false);
    }
  };

  // Derive Overview Statistics
  const totalCount = analytics?.totalMatches ?? matches.length;
  const excellentCount = analytics?.excellentMatches ?? matches.filter((m) => (m.score || 0) >= 90).length;
  const strongCount = analytics?.strongMatches ?? matches.filter((m) => (m.score || 0) >= 75 && (m.score || 0) < 90).length;
  const avgScore = analytics?.averageScore ?? (matches.length > 0 ? Math.round(matches.reduce((sum, m) => sum + (m.score || 0), 0) / matches.length) : 0);

  // Filter matches list client-side
  const filteredMatches = matches.filter((m) => {
    const opp = m.opportunity || {};
    const title = (opp.title || m.jobTitle || "").toLowerCase();
    const company = (opp.company || m.company || "").toLowerCase();
    const location = (opp.location || m.location || "").toLowerCase();
    const query = searchTerm.trim().toLowerCase();

    const matchesSearch = !query || title.includes(query) || company.includes(query) || location.includes(query);
    const matchesScore = (m.score || 0) >= minScoreFilter;

    return matchesSearch && matchesScore;
  });

  // Sort matches list client-side
  filteredMatches.sort((a, b) => {
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    if (sortOption === "newest") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortOption === "lowest") {
      return scoreA - scoreB;
    }
    return scoreB - scoreA; // Best match default
  });

  return (
    <div className="matches-page">

      {/* Success Notification Banner */}
      {toastMessage && (
        <div className="notification-banner success-banner">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header Banner */}
      <div className="page-header-banner flex-between">
        <div>
          <span className="eyebrow">MATCH INTELLIGENCE ENGINE</span>
          <h2>Your AI Matches</h2>
          <p>Personalized opportunities calculated from your candidate profile and skills.</p>
        </div>

        <button
          type="button"
          className="save-profile-btn"
          onClick={handleRefreshMatches}
          disabled={generating}
        >
          <RefreshCw size={16} className={generating ? "spin" : ""} />
          <span>{generating ? "Re-evaluating..." : "Refresh Engine"}</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      {loading ? (
        <MatchStatsSkeleton />
      ) : (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrapper search-icon">
              <Sparkles size={20} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Total Matches</span>
              <strong className="kpi-value">{totalCount}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper offer-icon">
              <Award size={20} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Excellent Matches</span>
              <strong className="kpi-value">{excellentCount}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper app-icon">
              <BarChart3 size={20} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Strong Matches</span>
              <strong className="kpi-value">{strongCount}</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper match-icon">
              <UserCheck size={20} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Average Score</span>
              <strong className="kpi-value">{avgScore}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* Controls & Filter Toolbar */}
      <div className="applications-controls-bar">
        {/* Search Input */}
        <div className="search-field-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search matches by company, role, location..."
            aria-label="Search matches"
          />
        </div>

        {/* Minimum Score Filters */}
        <div className="match-level-tabs">
          {[
            { id: 0, label: "All Scores" },
            { id: 90, label: "90%+ Excellent" },
            { id: 75, label: "75%+ Strong" },
            { id: 60, label: "60%+ Moderate" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`match-tab-btn ${minScoreFilter === tab.id ? "active" : ""}`}
              onClick={() => setMinScoreFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="match-sort-box">
          <ArrowUpDown size={14} className="sort-icon" />
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} aria-label="Sort matches">
            <option value="best">Sort: Best Match</option>
            <option value="newest">Sort: Newest</option>
            <option value="lowest">Sort: Score (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Main Matches Grid */}
      {loading ? (
        <div className="opportunities-grid-catalog">
          <MatchCardSkeleton />
          <MatchCardSkeleton />
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </div>
      ) : error ? (
        <div className="inline-error-state">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button type="button" onClick={fetchMatchData} className="retry-btn">
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      ) : matches.length === 0 ? (
        <div className="empty-state-box">
          <Sparkles size={36} className="empty-icon text-indigo" />
          <h4>No AI Matches Yet</h4>
          <p>Complete your profile with skills and experience to unlock personalized AI opportunities.</p>
          <button
            type="button"
            className="primary-action-btn"
            onClick={() => navigate("/dashboard/profile")}
          >
            <span>Complete Profile</span>
            <ChevronRight size={16} />
          </button>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="empty-state-box">
          <Search size={32} className="empty-icon" />
          <h4>No Matching AI Opportunities</h4>
          <p>No matches satisfy your active search keyword or score filter.</p>
          <button
            type="button"
            className="secondary-action-btn"
            onClick={() => {
              setSearchTerm("");
              setMinScoreFilter(0);
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="opportunities-grid-catalog">
          {filteredMatches.map((m) => (
            <MatchCard key={m._id || m.id} match={m} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Matches;
