import { CheckSquare, Clock, Trophy, Sparkles } from "lucide-react";

const PlannerProgress = ({ overview = {} }) => {
  const {
    completionPercentage = 0,
    actionsCompleted = 0,
    actionsPending = 0,
    totalActions = 0
  } = overview;

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-icon-wrapper app-icon">
          <CheckSquare size={20} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">Actions Completed</span>
          <strong className="kpi-value text-success">{actionsCompleted}</strong>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon-wrapper search-icon">
          <Clock size={20} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">Actions Pending</span>
          <strong className="kpi-value">{actionsPending}</strong>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon-wrapper match-icon">
          <Sparkles size={20} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">Plan Execution Rate</span>
          <strong className="kpi-value text-primary">{completionPercentage}%</strong>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon-wrapper offer-icon">
          <Trophy size={20} />
        </div>
        <div className="kpi-content">
          <span className="kpi-label">Total Daily Items</span>
          <strong className="kpi-value">{totalActions}</strong>
        </div>
      </div>
    </div>
  );
};

export default PlannerProgress;
