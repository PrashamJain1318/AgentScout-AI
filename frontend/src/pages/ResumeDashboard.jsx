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

      {/* 2. Premium Score Hero (If Resume Uploaded) */}
      {resumeData && (
        <div className="resume-score-hero">
          <div className="resume-score-hero-row">
            <div className="score-display-block">
              <div className="score-circle-large">
                {scores.overall}
              </div>
              <div className="score-text-content">
                <h3>{scores.overall >= 80 ? "Excellent" : scores.overall >= 60 ? "Strong" : "Needs Improvement"} Resume Score</h3>
                <p>
                  Your resume has been analyzed across multiple ATS dimensions. 
                  {resumeData.suggestions && resumeData.suggestions.length > 0 
                    ? ` Here are ${resumeData.suggestions.length} recommendations to improve your match rate.` 
                    : " Great job! Your resume is highly optimized."}
                </p>
              </div>
            </div>
            {/* Optional AI Summary Badge or Quick Action here */}
            <button 
              className="primary-action-btn"
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            >
              <Sparkles size={16} />
              <span>View All Insights</span>
            </button>
          </div>

          <div className="resume-kpi-row">
            <div className="resume-kpi-item">
              <span className="resume-kpi-label">ATS Match</span>
              <strong className="resume-kpi-value text-success">{scores.ats}%</strong>
            </div>
            <div className="resume-kpi-item">
              <span className="resume-kpi-label">Completeness</span>
              <strong className="resume-kpi-value">{scores.completeness}%</strong>
            </div>
            <div className="resume-kpi-item">
              <span className="resume-kpi-label">Impact</span>
              <strong className="resume-kpi-value">{scores.impact}%</strong>
            </div>
            <div className="resume-kpi-item">
              <span className="resume-kpi-label">Skills Coverage</span>
              <strong className="resume-kpi-value">{scores.skillsCoverage}%</strong>
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
