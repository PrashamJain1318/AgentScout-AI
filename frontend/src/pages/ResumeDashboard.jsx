import { useEffect, useState } from "react";
import { FileText, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import ResumeUploader from "../components/resume/ResumeUploader";
import SkillAnalysis from "../components/resume/SkillAnalysis";
import ResumeImprovements from "../components/resume/ResumeImprovements";
import ExperienceAnalysis from "../components/resume/ExperienceAnalysis";
import ProjectAnalysis from "../components/resume/ProjectAnalysis";
import PortfolioIntelligence from "../components/resume/PortfolioIntelligence";
import { getResume, reanalyzeResume } from "../services/resume.api";

const ResumeDashboard = () => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  const fetchResumeData = async () => {
    setLoading(true);
    setErrorNotice(null);

    try {
      const res = await getResume();
      setResumeData(res.resume || null);
    } catch (err) {
      setErrorNotice("Unable to load candidate resume data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeData();
  }, []);

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await reanalyzeResume();
      setResumeData(res.resume || null);
    } catch (err) {
      setErrorNotice("Failed to reanalyze resume.");
    } finally {
      setReanalyzing(false);
    }
  };

  const scores = resumeData?.scores || { overall: 0, ats: 0, completeness: 0, impact: 0, skillsCoverage: 0 };
  const extracted = resumeData?.extractedData || {};

  return (
    <div className="resume-page-container">

      {/* Header Bar */}
      <div className="resume-header-bar flex-between">
        <div>
          <div className="header-badge">
            <FileText size={14} className="text-primary" />
            <span>RESUME INTELLIGENCE</span>
          </div>
          <h2>Resume & Portfolio Intelligence</h2>
          <p className="subtitle-text">
            Understand how strong your resume is, what recruiters see, and how to improve it.
          </p>
        </div>

        {resumeData && (
          <button
            type="button"
            className="save-profile-btn"
            onClick={handleReanalyze}
            disabled={reanalyzing}
          >
            <RefreshCw size={15} />
            <span>{reanalyzing ? "Reanalyzing..." : "Reanalyze Resume"}</span>
          </button>
        )}
      </div>

      {errorNotice && (
        <div className="card-apply-notice danger">
          <AlertCircle size={16} />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* 1. Resume Uploader Card */}
      <ResumeUploader
        currentResume={resumeData}
        onUploaded={(res) => setResumeData(res)}
        onDeleted={() => setResumeData(null)}
      />

      {/* 2. Score Metrics Cards (If Resume Uploaded) */}
      {resumeData && (
        <div className="kpi-grid resume-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrapper match-icon">
              <Sparkles size={20} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Overall Score</span>
              <strong className="kpi-value text-primary">{scores.overall}%</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper offer-icon">
              <FileText size={20} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">AgentScout ATS Score</span>
              <strong className="kpi-value text-success">{scores.ats}%</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper app-icon">
              <Sparkles size={20} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Completeness Score</span>
              <strong className="kpi-value">{scores.completeness}%</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper interview-icon">
              <Sparkles size={20} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Impact Score</span>
              <strong className="kpi-value">{scores.impact}%</strong>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper search-icon">
              <Sparkles size={20} />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Skills Coverage</span>
              <strong className="kpi-value">{scores.skillsCoverage}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* 3. Detailed Resume Analysis Components */}
      {resumeData && (
        <div className="resume-analysis-grid">
          {/* Skill Analysis */}
          <SkillAnalysis extractedData={extracted} scores={scores} />

          {/* AI Audit Recommendations */}
          <ResumeImprovements suggestions={resumeData.suggestions} gaps={resumeData.gaps} />

          {/* Experience Evidence */}
          <ExperienceAnalysis experience={extracted.experience} />

          {/* Project Evidence */}
          <ProjectAnalysis projects={extracted.projects} />

          {/* Portfolio & Code Links */}
          <PortfolioIntelligence
            initialPortfolio={resumeData.portfolio}
            onUpdated={(p) => setResumeData((prev) => ({ ...prev, portfolio: p }))}
          />
        </div>
      )}

    </div>
  );
};

export default ResumeDashboard;
