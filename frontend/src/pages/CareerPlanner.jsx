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
import { getCachedData, setCachedData } from "../services/api";

import {
  getTodayPlan,
  getPlannerOverview,
  refreshPlan,
  updateAction
} from "../services/careerPlanner.api";

const CACHE_KEY = "career-planner-data";

const CareerPlanner = () => {
  const cached = getCachedData(CACHE_KEY);

  const [plan, setPlan] = useState(cached?.data?.plan || null);
  const [overview, setOverview] = useState(cached?.data?.overview || null);
  const [loading, setLoading] = useState(!cached?.data);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);

  const fetchPlannerData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (!cached?.data) setLoading(true);
    setErrorNotice(null);

    try {
      const results = await Promise.allSettled([
        isRefresh ? refreshPlan() : getTodayPlan(),
        getPlannerOverview()
      ]);

      const planData = results[0].status === "fulfilled" ? results[0].value?.data : plan;
      const overviewData = results[1].status === "fulfilled" ? results[1].value?.data : overview;

      setPlan(planData || null);
      setOverview(overviewData || null);

      setCachedData(CACHE_KEY, {
        plan: planData,
        overview: overviewData
      });
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
      getPlannerOverview().then(r => setOverview(r.data || null)).catch(() => {});
    } catch (err) {
      // Ignore fallback
    }
  };

  return (
    <div className="resume-page-container">
      {/* 1. Planner Shell Header Renders Immediately */}
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

      {/* 2. Main Layout Shell Renders Immediately */}
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
          {/* Left Column */}
          <div className="details-main-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {loading && !plan ? (
              <div className="skeleton-details-body" style={{ minHeight: "260px" }} />
            ) : (
              <>
                <TodayPlan
                  dailyActions={plan?.dailyActions || []}
                  onToggleAction={handleToggleActionState}
                />

                <JobSearchActions actions={plan?.jobSearchActions || []} />

                <SkillActions actions={plan?.skillActions || []} />

                <InterviewActions actions={plan?.interviewActions || []} />

                <ResumeActions actions={plan?.resumeActions || []} />

                <ApplicationActions actions={plan?.applicationActions || []} />
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="details-side-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <WeeklyPlan />

            <CareerMilestones milestones={plan?.careerMilestones || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerPlanner;
