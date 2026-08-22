import { useState, useEffect } from "react";
import { Globe, Code, Save, Check, AlertCircle } from "lucide-react";
import { updatePortfolio } from "../../services/resume.api";

const PortfolioIntelligence = ({ initialPortfolio = {}, onUpdated }) => {
  const [portfolioUrl, setPortfolioUrl] = useState(initialPortfolio.portfolioUrl || "");
  const [githubUrl, setGithubUrl] = useState(initialPortfolio.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialPortfolio.linkedinUrl || "");

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  useEffect(() => {
    if (initialPortfolio.portfolioUrl !== undefined) setPortfolioUrl(initialPortfolio.portfolioUrl);
    if (initialPortfolio.githubUrl !== undefined) setGithubUrl(initialPortfolio.githubUrl);
    if (initialPortfolio.linkedinUrl !== undefined) setLinkedinUrl(initialPortfolio.linkedinUrl);
  }, [initialPortfolio]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    setErrorNotice(null);

    try {
      const res = await updatePortfolio({
        portfolioUrl,
        githubUrl,
        linkedinUrl,
      });

      setNotice("Portfolio links updated successfully.");
      if (onUpdated) onUpdated(res.portfolio);
    } catch (err) {
      setErrorNotice("Failed to update portfolio links.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">PORTFOLIO INTELLIGENCE</span>
          <h3>Online Portfolio & Code Links</h3>
        </div>
      </div>

      {notice && (
        <div className="card-apply-notice success" style={{ margin: 0 }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="card-apply-notice danger" style={{ margin: 0 }}>
          <AlertCircle size={16} />
          <span>{errorNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="pUrl flex-between" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Globe size={14} className="text-primary" />
            <span>Personal Portfolio / Website URL</span>
          </label>
          <input
            type="url"
            id="pUrl"
            className="form-input"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://yourname.dev"
          />
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label htmlFor="ghUrl flex-between" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Code size={14} />
              <span>GitHub Profile URL</span>
            </label>
            <input
              type="url"
              id="ghUrl"
              className="form-input"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="liUrl flex-between" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Globe size={14} className="text-primary" />
              <span>LinkedIn Profile URL</span>
            </label>
            <input
              type="url"
              id="liUrl"
              className="form-input"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="save-profile-btn" disabled={saving}>
            <Save size={16} />
            <span>{saving ? "Saving Portfolio Links..." : "Save Portfolio Links"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioIntelligence;
