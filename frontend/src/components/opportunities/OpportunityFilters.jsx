import { Search, Filter, RotateCcw, ArrowUpDown } from "lucide-react";

const OpportunityFilters = ({ filters, onFilterChange, onResetFilters }) => {
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const isFiltered =
    filters.search ||
    filters.type !== "all" ||
    filters.remote !== "all" ||
    filters.location ||
    filters.minScore > 0 ||
    filters.sort !== "newest";

  return (
    <div className="opportunity-filters-bar">
      <div className="filters-main-row">
        {/* Search Keyword */}
        <div className="filter-input-box">
          <Search size={16} className="filter-icon" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            placeholder="Filter by keyword or title..."
          />
        </div>

        {/* Location Filter */}
        <div className="filter-input-box">
          <input
            type="text"
            value={filters.location || ""}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Location (e.g. Bangalore)..."
          />
        </div>

        {/* Opportunity Type Select */}
        <div className="filter-select-box">
          <select
            value={filters.type || "all"}
            onChange={(e) => handleChange("type", e.target.value)}
          >
            <option value="all">All Role Types</option>
            <option value="internship">Internship</option>
            <option value="job">Full-time Job</option>
            <option value="research">Research</option>
          </select>
        </div>

        {/* Work Mode Select */}
        <div className="filter-select-box">
          <select
            value={filters.remote || "all"}
            onChange={(e) => handleChange("remote", e.target.value)}
          >
            <option value="all">All Work Modes</option>
            <option value="true">Remote Only</option>
            <option value="false">On-site / Hybrid</option>
          </select>
        </div>

        {/* Minimum Match Score Select */}
        <div className="filter-select-box">
          <select
            value={filters.minScore || 0}
            onChange={(e) => handleChange("minScore", Number(e.target.value))}
          >
            <option value={0}>All Match Scores</option>
            <option value={60}>60%+ Good Match</option>
            <option value={75}>75%+ Strong Match</option>
            <option value={90}>90%+ Excellent Match</option>
          </select>
        </div>

        {/* Sort Select */}
        <div className="filter-select-box sort-select-box">
          <ArrowUpDown size={14} />
          <select
            value={filters.sort || "newest"}
            onChange={(e) => handleChange("sort", e.target.value)}
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="company">Sort: Company A-Z</option>
            <option value="highest_match">Sort: Highest Match</option>
          </select>
        </div>

        {/* Reset Filters */}
        {isFiltered && (
          <button type="button" onClick={onResetFilters} className="clear-filters-btn">
            <RotateCcw size={14} /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default OpportunityFilters;
