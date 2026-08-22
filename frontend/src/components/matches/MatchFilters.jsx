import { ArrowUpDown } from "lucide-react";

const MatchFilters = ({ activeLevel, onLevelChange, sortOption, onSortChange }) => {
  const levels = [
    { id: "all", label: "All Matches" },
    { id: "excellent", label: "Excellent (90%+)" },
    { id: "strong", label: "Strong (75%+)" },
    { id: "good", label: "Good (60%+)" },
    { id: "potential", label: "Potential (<60%)" },
  ];

  return (
    <div className="match-filters-container">
      {/* Level Filter Tabs */}
      <div className="match-level-tabs">
        {levels.map((lvl) => (
          <button
            key={lvl.id}
            type="button"
            className={`match-tab-btn ${activeLevel === lvl.id ? "active" : ""}`}
            onClick={() => onLevelChange(lvl.id)}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {/* Sort Select */}
      <div className="match-sort-box">
        <ArrowUpDown size={14} className="sort-icon" />
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort matches"
        >
          <option value="best">Sort: Best Match</option>
          <option value="newest">Sort: Newest</option>
        </select>
      </div>
    </div>
  );
};

export default MatchFilters;
