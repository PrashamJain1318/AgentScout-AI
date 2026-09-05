import React from "react";
import PersonalizedGreeting from "./PersonalizedGreeting";
import SmartPriorityCard from "./SmartPriorityCard";
import CareerJourney from "./CareerJourney";
import MomentumScore from "./MomentumScore";
import AIInsightCard from "./AIInsightCard";

const AdaptiveDashboard = ({
  user,
  personalization,
  onRefresh,
  refreshing,
  onNavigate,
  children
}) => {
  const topPriority = personalization?.smartPriorities?.[0] || null;
  const journeyPhases = personalization?.journeyPhases || [];
  const momentum = personalization?.momentum || null;
  const dailyInsight = personalization?.dailyInsight || null;

  return (
    <div className="adaptive-dashboard-wrapper">
      {/* 1. DYNAMIC WELCOME HEADER */}
      <PersonalizedGreeting
        user={user}
        personalization={personalization}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      {/* 2. SMART DOMINANT PRIORITY BANNER */}
      {topPriority && (
        <SmartPriorityCard
          topPriority={topPriority}
          onNavigate={onNavigate}
        />
      )}

      {/* 3. ADAPTIVE CAREER JOURNEY PIPELINE */}
      <CareerJourney
        phases={journeyPhases}
        onNavigate={onNavigate}
      />

      {/* 4. SIDE-BY-SIDE INSIGHT & MOMENTUM GRID */}
      <div className="db-split-grid personalization-split-row">
        <MomentumScore
          momentum={momentum}
          onNavigate={onNavigate}
        />
        <AIInsightCard
          insight={dailyInsight}
          onNavigate={onNavigate}
        />
      </div>

      {/* 5. REST OF DASHBOARD COMPONENT CHILDREN */}
      {children}
    </div>
  );
};

export default AdaptiveDashboard;
