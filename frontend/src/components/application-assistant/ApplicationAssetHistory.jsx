import { useState, useEffect } from "react";
import { History, FileText, Copy, Check } from "lucide-react";
import { getAssetHistory } from "../../services/applicationAssistant.api";

const ApplicationAssetHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await getAssetHistory();
        setHistory(res.history || []);
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading || history.length === 0) return null;

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">ASSET HISTORY</span>
          <h3>Previously Generated Application Assets</h3>
        </div>
      </div>

      <div className="suggestions-list-box">
        {history.slice(0, 5).map((item) => {
          const oppTitle = item.opportunity?.title || "Opportunity";
          const company = item.opportunity?.company || "Company";
          const coverLetterText = item.coverLetter?.content;

          if (!coverLetterText) return null;

          return (
            <div key={item._id} className="suggestion-item-card flex-between">
              <div>
                <strong>Cover Letter — {oppTitle}</strong>
                <p className="notif-subtext">{company} • Prepared {new Date(item.updatedAt).toLocaleDateString()}</p>
              </div>

              <button
                type="button"
                className="secondary-action-btn"
                onClick={() => handleCopy(coverLetterText, item._id)}
              >
                {copiedId === item._id ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                <span>{copiedId === item._id ? "Copied" : "Copy"}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationAssetHistory;
