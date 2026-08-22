import { useState } from "react";
import { Sparkles, Search, Loader2, X, Filter } from "lucide-react";

const OpportunitySearch = ({ onSearch, isSearching, searchResultInfo, onClearAiSearch }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    if (onClearAiSearch) onClearAiSearch();
  };

  return (
    <div className="ai-search-hero-box">
      <div className="ai-search-header-row">
        <div className="ai-badge-chip">
          <Sparkles size={14} />
          <span>GEMINI AI SEARCH</span>
        </div>
        <p className="ai-search-subtext">
          Describe what you're looking for in plain language (e.g. "Find remote React internships in Bangalore")
        </p>
      </div>

      <form onSubmit={handleSubmit} className="ai-search-input-form">
        <div className="ai-input-wrapper">
          <Search size={18} className="ai-search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI to find your ideal opportunity..."
            disabled={isSearching}
          />
          {query && (
            <button type="button" onClick={handleClear} className="clear-ai-input-btn" aria-label="Clear input">
              <X size={16} />
            </button>
          )}
        </div>

        <button type="submit" className="ai-search-submit-btn" disabled={!query.trim() || isSearching}>
          {isSearching ? (
            <>
              <Loader2 size={16} className="spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>AI Search</span>
            </>
          )}
        </button>
      </form>

      {/* Searching State Banner */}
      {isSearching && (
        <div className="ai-analyzing-status">
          <Loader2 size={16} className="spin" />
          <span>AI is analyzing opportunities against your query...</span>
        </div>
      )}

      {/* AI Interpreted Query Results Banner */}
      {searchResultInfo && (
        <div className="ai-results-interpreted-card">
          <div className="interpreted-top-row">
            <div className="interpreted-title">
              <Sparkles size={16} className="sparkle-active" />
              <strong>AI Search Results</strong>
            </div>

            <button type="button" onClick={handleClear} className="close-ai-results-btn">
              Clear AI Search
            </button>
          </div>

          <p className="interpreted-query-quote">
            AI interpreted query: <em>"{searchResultInfo.query}"</em>
          </p>

          {searchResultInfo.interpretedFilters && (
            <div className="interpreted-filters-row">
              <span className="filter-meta-label">
                <Filter size={12} /> Detected Filters:
              </span>

              {searchResultInfo.interpretedFilters.type && (
                <span className="interpreted-tag-chip">
                  Role: {searchResultInfo.interpretedFilters.type}
                </span>
              )}

              {searchResultInfo.interpretedFilters.remote !== null && (
                <span className="interpreted-tag-chip">
                  {searchResultInfo.interpretedFilters.remote ? "Remote Only" : "On-site"}
                </span>
              )}

              {searchResultInfo.interpretedFilters.location && (
                <span className="interpreted-tag-chip">
                  Location: {searchResultInfo.interpretedFilters.location}
                </span>
              )}

              {Array.isArray(searchResultInfo.interpretedFilters.skills) &&
                searchResultInfo.interpretedFilters.skills.map((s, idx) => (
                  <span key={idx} className="interpreted-tag-chip skill-tag">
                    Skill: {s}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OpportunitySearch;
