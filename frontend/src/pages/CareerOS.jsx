import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import CareerOSHeader from "../components/career-os/CareerOSHeader";
import { CareerScore, CareerMomentum } from "../components/career-os/CareerHeaderMetrics";
import { AICareerBriefing, NextBestAction } from "../components/career-os/BriefingAndAction";
import { ReadinessMatrix, CareerRisks } from "../components/career-os/MatrixAndRisks";
import OpportunityCommandCenter from "../components/career-os/OpportunityCommandCenter";
import {
  ApplicationIntelligence,
  SkillIntelligence,
  InterviewIntelligence,
  ResumeIntelligence,
  CareerMilestones,
  RecentChanges,
  CareerOSSkeleton
} from "../components/career-os/IntelligenceCards";

import { getSnapshot, refresh } from "../services/careerOS.api";

const CareerOS = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  const fetchOSData = async () => {
    setLoading(true);
    setErrorNotice(null);

    try {
      const res = await getSnapshot();
      setSnapshot(res.data || null);
    } catch (err) {
      setErrorNotice("Failed to load Career Operating System snapshot.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOSData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setErrorNotice(null);

    try {
      const res = await refresh();
      setSnapshot(res.data || null);
    } catch (err) {
      setErrorNotice("Unable to refresh Career Operating System snapshot.");
    } finally {
      setRefreshing(false);
    }
  };

  const s = snapshot || {};
  const readiness = s.readiness || {};
  const actionState = s.actionState || {};
  const nextAction = actionState.nextBestAction || { title: "Review Career Plan", deepLink: "/dashboard" };
  const risks = Array.isArray(s.riskState) ? s.riskState : [];
  const opportunities = Array.isArray(s.recommendations) ? s.recommendations : [];
  const momentum = s.momentum || { score: 50, trend: "STABLE", changePercentage: 0 };
  const milestones = Array.isArray(s.milestones) ? s.milestones : [];
  const recentChanges = Array.isArray(s.recentChanges) ? s.recentChanges : [];

  return (
    <div className="resume-page-container">
      {/* Header */}
      <CareerOSHeader onRefresh={handleRefresh} refreshing={refreshing} />

      {errorNotice && (
        <div className="inline-error-state" style={{ margin: "16px 0" }}>
          <AlertCircle size={20} />
          <span>{errorNotice}</span>
        </div>
      )}

      {loading ? (
        <CareerOSSkeleton />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* 1. Header Metrics: Career Score & Momentum */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px" }}>
            <CareerScore score={s.careerScore || 0} stage={s.careerStage || "PROFILE_BUILDING"} />
            <CareerMomentum momentum={momentum} />
          </div>

          {/* 2. Executive AI Briefing */}
          <AICareerBriefing summary={s.aiSummary} stage={s.careerStage} score={s.careerScore} />

          {/* 3. Single Highest Impact Next Action */}
          <NextBestAction action={nextAction} />

          {/* 4. Platform Readiness Matrix */}
          <ReadinessMatrix readiness={readiness} />

          {/* 5. Detected Career Risks */}
          <CareerRisks risks={risks} />

          {/* 6. Opportunity Command Center */}
          <OpportunityCommandCenter opportunities={opportunities} />

          {/* 7. Application & Skill Intelligence (2-Column) */}
          <div className="details-2col-layout">
            <div className="details-main-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <ApplicationIntelligence state={s.applicationState || {}} />
              <InterviewIntelligence state={s.interviewState || {}} />
              <CareerMilestones milestones={milestones} />
            </div>

            <div className="details-side-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <SkillIntelligence state={s.skillState || {}} />
              <ResumeIntelligence state={s.resumeState || {}} />
              <RecentChanges changes={recentChanges} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerOS;
