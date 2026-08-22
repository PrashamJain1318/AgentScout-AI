import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import PlannerHeader from "../components/career-planner/PlannerHeader";
import PlannerProgress from "../components/career-planner/PlannerProgress";
import NextBestAction from "../components/career-planner/NextBestAction";
import TodayPlan from "../components/career-planner/TodayPlan";
import WeeklyPlan from "../components/career-planner/WeeklyPlan";
import JobSearchActions from "../components/career-planner/JobSearchActions";
import SkillActions from "../components/career-planner/SkillActions";
import InterviewActions from "../components/career-planner/InterviewActions";
import ResumeActions from "../components/career-planner/ResumeActions";
import ApplicationActions from "../components/career-planner/ApplicationActions";
import CareerMilestones from "../components/career-planner/CareerMilestones";
import PlannerSkeleton from "../components/career-planner/PlannerSkeleton";

import {
  getTodayPlan,
  getPlannerOverview,
  refreshPlan,
  updateAction
} from "../services/careerPlanner.api";

const CareerPlanner = () => {
  const [plan, setPlan] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  const fetchPlannerData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorNotice(null);

    try {
      const [planRes, overviewRes] = await Promise.all([
        isRefresh ? refreshPlan() : getTodayPlan(),
        getPlannerOverview()
      ]);

      setPlan(planRes.data || null);
      setOverview(overviewRes.data || null);
    } catch (err) {
      setErrorNotice("Failed to load career action plan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const handleToggleActionState = async (actionId, newStatus = "completed") => {
    try {
      const res = await updateAction(actionId, newStatus);
      setPlan(res.data || null);
      // Refresh overview stats
      getPlannerOverview().then(r => setOverview(r.data || null)).catch(() => {});
    } catch (err) {
      // Ignore fallback
    }
  };

  return (
    <div className="resume-page-container">
      <PlannerHeader
        summary={plan?.aiSummary || ""}
        completionPercentage={plan?.completionPercentage || 0}
        onRefresh={() => fetchPlannerData(true)}
        refreshing={refreshing}
      />

      {errorNotice && (
        <div className="inline-error-state" style={{ margin: "16px 0" }}>
          <AlertCircle size={20} />
          <span>{errorNotice}</span>
        </div>
      )}

      {loading ? (
        <PlannerSkeleton />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Progress KPI Row */}
          <PlannerProgress overview={overview || {}} />

          {/* Hero Next Best Action */}
          <NextBestAction
            nextBestAction={plan?.nextBestAction}
            aiReasoning={plan?.aiReasoning}
            onComplete={(id) => handleToggleActionState(id, "completed")}
          />

          {/* 2-Column Main Workspace */}
          <div className="details-2col-layout">
            {/* Left Column: Today's Actions & Categorised Actions */}
            <div className="details-main-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <TodayPlan
                dailyActions={plan?.dailyActions || []}
                onToggleAction={handleToggleActionState}
              />

              <JobSearchActions actions={plan?.jobSearchActions || []} />

              <SkillActions actions={plan?.skillActions || []} />

              <InterviewActions actions={plan?.interviewActions || []} />

              <ResumeActions actions={plan?.resumeActions || []} />

              <ApplicationActions actions={plan?.applicationActions || []} />
            </div>

            {/* Right Column: Weekly Roadmap & Milestones */}
            <div className="details-side-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <WeeklyPlan />

              <CareerMilestones milestones={plan?.careerMilestones || []} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPlanner;
