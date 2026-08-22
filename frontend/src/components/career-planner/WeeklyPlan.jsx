import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Target } from "lucide-react";
import { getWeeklyPlan } from "../../services/careerPlanner.api";

const WeeklyPlan = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeek = async () => {
      setLoading(true);
      try {
        const res = await getWeeklyPlan();
        setWeeklyData(res.data || null);
      } catch (err) {
        // Ignore
      } finally {
        setLoading(false);
      }
    };

    fetchWeek();
  }, []);

  if (loading) {
    return <div className="skeleton-card" style={{ height: "200px" }} />;
  }

  const schedule = weeklyData?.weeklySchedule || [
    { day: "Monday", focus: "Resume & ATS Optimization", action: { title: "Audit ATS score" } },
    { day: "Tuesday", focus: "High-Match Job Applications", action: { title: "Submit 2 applications" } },
    { day: "Wednesday", focus: "Market Skill Gap Development", action: { title: "Study Docker" } },
    { day: "Thursday", focus: "Technical & Behavioral Mock Interview", action: { title: "Run Mock Interview" } },
    { day: "Friday", focus: "Application Follow-ups & Strategy", action: { title: "Check application status" } },
    { day: "Saturday", focus: "Portfolio & Project Enhancement", action: { title: "Update GitHub repo" } },
    { day: "Sunday", focus: "Weekly Execution Audit & Goal Review", action: { title: "Review weekly progress" } }
  ];

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">7-DAY ROADMAP</span>
          <h3>Weekly Career Execution Schedule</h3>
        </div>

        <div className="overall-readiness-pill">
          <Calendar size={14} />
          <span>7-Day Adaptive Strategy</span>
        </div>
      </div>

      <div className="suggestions-list-box" style={{ marginTop: "16px" }}>
        {schedule.map((item, idx) => (
          <div key={idx} className="suggestion-item-card flex-between">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <strong className="text-primary">{item.day}</strong>
                <span className="bullet-dot">•</span>
                <strong>{item.focus}</strong>
              </div>
              <p className="notif-subtext" style={{ margin: "4px 0 0 0" }}>
                Target Task: {item.action?.title || item.focus}
              </p>
            </div>

            <CheckCircle2 size={16} className="text-success" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyPlan;
