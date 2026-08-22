import { useEffect, useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  Target,
  Award,
  Zap,
  BookOpen,
  Briefcase,
  Layers,
  BarChart2,
  RefreshCw,
} from "lucide-react";
import CareerCopilotChat from "../components/copilot/CareerCopilotChat";
import CopilotInsightCard from "../components/copilot/CopilotInsightCard";
import CareerPlanCard from "../components/copilot/CareerPlanCard";
import SkillGapCard from "../components/copilot/SkillGapCard";
import InterviewPrepCard from "../components/copilot/InterviewPrepCard";
import {
  getSkillGaps,
  generateCareerRoadmap,
  generateInterviewPrep,
  getProfileImprovement,
} from "../services/copilot.api";
import { getUserProfile } from "../services/user.api";
import { getMatchAnalytics } from "../services/matches.api";
import { getApplications } from "../services/applications.api";

const CareerCopilotPage = () => {
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [appsCount, setAppsCount] = useState(0);

  const [skillGaps, setSkillGaps] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [interviewPrep, setInterviewPrep] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingAction, setLoadingAction] = useState(false);

  const fetchDashboardIntelligence = async () => {
    try {
      const [profileRes, analyticsRes, appsRes, gapsRes] = await Promise.allSettled([
        getUserProfile(),
        getMatchAnalytics(),
        getApplications(),
        getSkillGaps(),
      ]);

      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value.profile || profileRes.value.user?.profile || profileRes.value.data || null);
      }
      if (analyticsRes.status === "fulfilled") {
        setAnalytics(analyticsRes.value.analytics || null);
      }
      if (appsRes.status === "fulfilled") {
        const apps = appsRes.value.applications || appsRes.value.data || [];
        setAppsCount(apps.length);
      }
      if (gapsRes.status === "fulfilled") {
        setSkillGaps(gapsRes.value.skillGaps || []);
      }
    } catch (err) {
      console.warn("Failed to load initial Copilot intelligence:", err);
    }
  };

  useEffect(() => {
    fetchDashboardIntelligence();
  }, []);

  // Calculate dynamic Profile Strength Score
  const calculateProfileStrength = () => {
    if (!profile) return 60;
    let score = 30; // Baseline profile score
    if (profile.headline) score += 15;
    if (profile.bio || profile.biography) score += 15;
    if (Array.isArray(profile.skills) && profile.skills.length > 0) {
      score += Math.min(25, profile.skills.length * 5);
    }
    if (Array.isArray(profile.experience) && profile.experience.length > 0) score += 15;
    return Math.min(100, score);
  };

  const profileStrengthScore = calculateProfileStrength();

  // Action handlers
  const handleSkillGapAnalysis = async () => {
    setLoadingAction(true);
    try {
      const data = await getSkillGaps();
      setSkillGaps(data.skillGaps || []);
      setActiveTab("skillgaps");
    } catch (err) {
      // Fallback
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCareerRoadmap = async () => {
    setLoadingAction(true);
    try {
      const data = await generateCareerRoadmap(30);
      setRoadmap(data.roadmap || null);
      setActiveTab("roadmap");
    } catch (err) {
      // Fallback
    } finally {
      setLoadingAction(false);
    }
  };

  const handleInterviewPrep = async () => {
    setLoadingAction(true);
    try {
      const data = await generateInterviewPrep();
      setInterviewPrep(data.interviewPrep || null);
      setActiveTab("interview");
    } catch (err) {
      // Fallback
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="career-copilot-page">
      
      {/* Header Section */}
      <div className="copilot-header-bar">
        <div className="header-badge">
          <Sparkles size={14} className="text-primary" />
          <span>AI CAREER COPILOT</span>
        </div>

        <h2>Your Personal Career Copilot</h2>
        <p className="subtitle-text">
          AI-powered guidance based on your profile, skills, opportunities, matches, and application pipeline.
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="copilot-2col-layout">

        {/* Left / Main Column: AI Chat Interface */}
        <div className="copilot-chat-column">
          <CareerCopilotChat />
        </div>

        {/* Right Column: Career Intelligence Panel */}
        <div className="copilot-intelligence-column">

          {/* Quick Actions Card */}
          <div className="copilot-side-card">
            <div className="card-title-row">
              <Zap size={18} className="text-primary" />
              <h4>Career Intelligence Actions</h4>
            </div>

            <div className="quick-actions-grid">
              <button
                type="button"
                className="action-pill-btn"
                onClick={handleSkillGapAnalysis}
                disabled={loadingAction}
              >
                <Layers size={14} />
                <span>Skill Gap Analysis</span>
              </button>

              <button
                type="button"
                className="action-pill-btn"
                onClick={handleCareerRoadmap}
                disabled={loadingAction}
              >
                <BarChart2 size={14} />
                <span>30-Day Roadmap</span>
              </button>

              <button
                type="button"
                className="action-pill-btn"
                onClick={handleInterviewPrep}
                disabled={loadingAction}
              >
                <BookOpen size={14} />
                <span>Interview Prep</span>
              </button>
            </div>
          </div>

          {/* Profile Strength Indicator */}
          <CopilotInsightCard
            title="Profile Strength"
            value={`${profileStrengthScore}%`}
            subtitle="Calculated from headline, skills matrix, bio, and experience completion."
            icon={ShieldCheck}
            badgeText={profileStrengthScore >= 80 ? "Strong" : "Good"}
            badgeColor={profileStrengthScore >= 80 ? "success" : "primary"}
          />

          {/* AI Match Overview Card */}
          <CopilotInsightCard
            title="AI Matches"
            value={`${analytics?.totalMatches || 0} Matches`}
            subtitle={`Average Match Score: ${analytics?.averageScore || 70}% across target roles.`}
            icon={Target}
            badgeText={`${analytics?.excellentMatches || 0} Excellent`}
            badgeColor="indigo"
          />

          {/* Active Applications Tracker */}
          <CopilotInsightCard
            title="Application Pipeline"
            value={`${appsCount} Active`}
            subtitle="Monitor applications and interview progress in real-time."
            icon={Briefcase}
            badgeText="Pipeline"
            badgeColor="warning"
          />

          {/* Context Tab Viewers */}
          {activeTab === "skillgaps" && (
            <SkillGapCard skillGaps={skillGaps} />
          )}

          {activeTab === "roadmap" && roadmap && (
            <CareerPlanCard roadmap={roadmap} />
          )}

          {activeTab === "interview" && interviewPrep && (
            <InterviewPrepCard prep={interviewPrep} />
          )}

        </div>

      </div>

    </div>
  );
};

export default CareerCopilotPage;
