import { useState } from "react";
import { Calendar, CheckCircle2, Target } from "lucide-react";

const InterviewPreparationPlan = () => {
  const [activeTab, setActiveTab] = useState("3day");

  const planData = {
    "1day": [
      { day: "Day 1 (Crash Course)", focus: "High-Impact Audit & Core Elevator Pitch", tasks: ["Review top resume accomplishments & project trade-offs", "Practice 3 STAR behavioral scenario responses", "Audit target role required keywords"] }
    ],
    "3day": [
      { day: "Day 1", focus: "Technical Core & Skill Gap Bridge", tasks: ["Review primary tech stack concepts (React/Node/MongoDB)", "Study target role missing requirements & architectural patterns"] },
      { day: "Day 2", focus: "Behavioral & STAR Method Stories", tasks: ["Structure 5 STAR scenario stories (Leadership, Conflict, Technical Challenge)", "Prepare project deep-dive explanations"] },
      { day: "Day 3", focus: "Full AI Mock Interview Simulation", tasks: ["Complete full AI Mock Interview session on AgentScout", "Review AI evaluation feedback and refine high-priority tips"] }
    ],
    "7day": [
      { day: "Day 1", focus: "Core Technical Refresh", tasks: ["Master core language & framework concepts", "Practice algorithmic problem solving"] },
      { day: "Day 2", focus: "Target Skill Gap Resolution", tasks: ["Study target market missing requirements (System Design, Cloud)"] },
      { day: "Day 3", focus: "Project Architecture Deep Dive", tasks: ["Write out architectural decisions & trade-offs for key projects"] },
      { day: "Day 4", focus: "System Design & API Patterns", tasks: ["Practice designing scalable REST APIs, database indexes, and microservices"] },
      { day: "Day 5", focus: "Behavioral Mastery", tasks: ["Practice 10 STAR behavioral questions with quantifiable results"] },
      { day: "Day 6", focus: "AI Mock Interview Practice", tasks: ["Run 2 full AI Mock Interviews under simulated timer constraints"] },
      { day: "Day 7", focus: "Final Confidence Audit", tasks: ["Review AI recommendations, rest, and prepare interview setup"] }
    ]
  };

  const currentPlan = planData[activeTab] || planData["3day"];

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">PREPARATION ROADMAP</span>
          <h3>Personalized Interview Preparation Plan</h3>
        </div>

        <div className="assistant-workflow-steps">
          <button
            type="button"
            className={`step-pill ${activeTab === "1day" ? "active" : ""}`}
            onClick={() => setActiveTab("1day")}
          >
            1-Day Plan
          </button>
          <button
            type="button"
            className={`step-pill ${activeTab === "3day" ? "active" : ""}`}
            onClick={() => setActiveTab("3day")}
          >
            3-Day Plan
          </button>
          <button
            type="button"
            className={`step-pill ${activeTab === "7day" ? "active" : ""}`}
            onClick={() => setActiveTab("7day")}
          >
            7-Day Plan
          </button>
        </div>
      </div>

      <div className="suggestions-list-box" style={{ marginTop: "16px" }}>
        {currentPlan.map((item, idx) => (
          <div key={idx} className="suggestion-item-card">
            <div className="suggestion-header flex-between">
              <strong>{item.day}: {item.focus}</strong>
              <Calendar size={14} className="text-primary" />
            </div>

            <ul className="entry-achievements-list" style={{ marginTop: "8px" }}>
              {item.tasks.map((task, tIdx) => (
                <li key={tIdx}>{task}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewPreparationPlan;
