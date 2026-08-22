import { useState, useEffect } from "react";
import { History, Calendar, Trash2, Eye, RefreshCw, Award } from "lucide-react";
import { getInterviewHistory, deleteInterview } from "../../services/interview.api";

const InterviewHistory = ({ onSelectSession, onRetry }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getInterviewHistory();
      setHistory(res.history || []);
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (sessionId, e) => {
    e.stopPropagation();
    if (!sessionId || deletingId) return;
    setDeletingId(sessionId);

    try {
      await deleteInterview(sessionId);
      setHistory((prev) => prev.filter((item) => (item._id || item.id) !== sessionId));
    } catch (err) {
      // Ignore
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="skeleton-card" style={{ height: "180px", margin: "20px 0" }} />;
  }

  if (history.length === 0) {
    return (
      <div className="resume-section-card">
        <div className="section-header-flex">
          <div>
            <span className="eyebrow">SESSION HISTORY</span>
            <h3>Past Mock Interviews</h3>
          </div>
        </div>
        <p className="no-data-text">No past mock interview sessions recorded yet. Start a session to build your history.</p>
      </div>
    );
  }

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">SESSION HISTORY</span>
          <h3>Past Mock Interview Sessions ({history.length})</h3>
        </div>
      </div>

      <div className="suggestions-list-box" style={{ marginTop: "12px" }}>
        {history.map((item) => {
          const oppTitle = item.opportunity?.title || "General Engineering";
          const company = item.opportunity?.company || "Target Role";
          const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent";
          const score = item.overallScore || item.readinessScore || 0;
          const status = item.status || "completed";

          return (
            <div
              key={item._id || item.id}
              className="suggestion-item-card flex-between"
              style={{ cursor: "pointer" }}
              onClick={() => onSelectSession(item._id || item.id)}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <strong>{item.interviewType || "Mock Interview"}</strong>
                  <span className={`impact-badge ${item.difficulty?.toLowerCase() || "intermediate"}`}>
                    {(item.difficulty || "Intermediate").toUpperCase()}
                  </span>
                </div>
                <p className="notif-subtext" style={{ margin: "2px 0 0 0" }}>
                  {oppTitle} • {company} • <Calendar size={12} className="inline-icon" /> {dateStr}
                </p>
              </div>

              <div className="flex-between" style={{ gap: "16px" }}>
                <div style={{ textAlign: "right" }}>
                  <span className="kpi-label">Score</span>
                  <strong className={score >= 75 ? "text-success" : "text-primary"} style={{ fontSize: "16px", display: "block" }}>
                    {score}%
                  </strong>
                </div>

                <div className="flex-between" style={{ gap: "6px" }}>
                  <button
                    type="button"
                    className="secondary-action-btn"
                    style={{ padding: "6px" }}
                    title="View Session"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSession(item._id || item.id);
                    }}
                  >
                    <Eye size={14} />
                  </button>

                  <button
                    type="button"
                    className="icon-button logout-icon-button"
                    style={{ padding: "6px" }}
                    title="Delete Session"
                    onClick={(e) => handleDelete(item._id || item.id, e)}
                    disabled={deletingId === (item._id || item.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewHistory;
