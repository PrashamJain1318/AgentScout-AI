import { useEffect, useState } from "react";
import { Search, RefreshCw, AlertCircle, Sparkles, Layers } from "lucide-react";
import OpportunitySearch from "../components/opportunities/OpportunitySearch";
import OpportunityFilters from "../components/opportunities/OpportunityFilters";
import RecommendedOpportunities from "../components/opportunities/RecommendedOpportunities";
import OpportunityCard from "../components/opportunities/OpportunityCard";
import OpportunityCardSkeleton from "../components/opportunities/OpportunityCardSkeleton";
import {
  getOpportunities,
  getRecommendedOpportunities,
  aiSearchOpportunities,
} from "../services/opportunities.api";

const Opportunities = () => {
  // State for Recommended Opportunities
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recError, setRecError] = useState(null);

  // State for All Opportunities
  const [opportunities, setOpportunities] = useState([]);
  const [oppLoading, setOppLoading] = useState(true);
  const [oppError, setOppError] = useState(null);

  // State for AI Search Results
  const [aiSearchResults, setAiSearchResults] = useState(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchInfo, setAiSearchInfo] = useState(null);

  // Filter & Sort State
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    remote: "all",
    location: "",
    minScore: 0,
    sort: "newest",
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Recommended Opportunities
  const fetchRecommendations = async () => {
    setRecLoading(true);
    setRecError(null);
    try {
      const resData = await getRecommendedOpportunities({ limit: 6 });
      const list = resData.recommendations || resData.opportunities || resData.data || [];
      setRecommendations(Array.isArray(list) ? list : []);
    } catch (err) {
      setRecError("Unable to load recommended opportunities.");
    } finally {
      setRecLoading(false);
    }
  };

  // Fetch All Opportunities from Backend API
  const fetchAllOpportunities = async () => {
    setOppLoading(true);
    setOppError(null);
    try {
      const params = {
        page,
        limit: 12,
        search: filters.search.trim() || undefined,
        type: filters.type !== "all" ? filters.type : undefined,
        remote: filters.remote !== "all" ? filters.remote : undefined,
        location: filters.location.trim() || undefined,
        minScore: filters.minScore > 0 ? filters.minScore : undefined,
        sort: filters.sort || "newest",
      };

      const resData = await getOpportunities(params);
      const list = resData.opportunities || resData.data || [];
      setOpportunities(Array.isArray(list) ? list : []);
      if (resData.pagination) {
        setTotalPages(resData.pagination.pages || 1);
      }
    } catch (err) {
      setOppError("Unable to load opportunities list.");
    } finally {
      setOppLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  useEffect(() => {
    if (!aiSearchResults) {
      fetchAllOpportunities();
    }
  }, [filters, page, aiSearchResults]);

  // Handle AI Search Submission
  const handleAiSearch = async (queryText) => {
    setIsAiSearching(true);
    setOppError(null);
    try {
      const resData = await aiSearchOpportunities(queryText, 20);
      const results = resData.opportunities || [];
      setAiSearchResults(results);
      setAiSearchInfo({
        query: resData.query || queryText,
        interpretedFilters: resData.interpretedFilters || null,
        count: resData.count || results.length,
      });
    } catch (err) {
      setOppError("AI search encountered an error. Please try refining your query.");
    } finally {
      setIsAiSearching(false);
    }
  };

  // Clear AI Search Results
  const handleClearAiSearch = () => {
    setAiSearchResults(null);
    setAiSearchInfo(null);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      search: "",
      type: "all",
      remote: "all",
      location: "",
      minScore: 0,
      sort: "newest",
    });
    setPage(1);
    handleClearAiSearch();
  };

  // Determine active displayed opportunity list (AI Search Results vs Regular Catalog)
  const baseList = aiSearchResults !== null ? aiSearchResults : opportunities;

  // Filter client-side if minScore or client sort is specified
  const filteredList = baseList.filter((opp) => {
    const score = opp.matchScore || opp.score || 0;
    if (filters.minScore > 0 && score < filters.minScore) return false;
    return true;
  });

  // Apply client-side sorting if "highest_match" requested
  if (filters.sort === "highest_match") {
    filteredList.sort((a, b) => (b.matchScore || b.score || 0) - (a.matchScore || a.score || 0));
  }

  return (
    <div className="opportunities-page">

      {/* Page Header Banner */}
      <div className="page-header-banner">
        <span className="eyebrow">DISCOVERY & AI MATCHING</span>
        <h2>OPPORTUNITIES</h2>
        <p>Discover AI-matched software engineering roles, internships, and research opportunities.</p>
      </div>

      {/* 1. Large AI Search Component */}
      <OpportunitySearch
        onSearch={handleAiSearch}
        isSearching={isAiSearching}
        searchResultInfo={aiSearchInfo}
        onClearAiSearch={handleClearAiSearch}
      />

      {/* 2. Recommended Opportunities Section */}
      {!aiSearchResults && (
        <RecommendedOpportunities
          recommendations={recommendations}
          loading={recLoading}
          error={recError}
          onRetry={fetchRecommendations}
        />
      )}

      {/* 3. Filter & Search Controls Bar */}
      <section className="explore-opportunities-section">
        <div className="section-header-flex">
          <div className="title-with-badge">
            <Layers size={20} />
            <h3>{aiSearchResults ? "AI Match Results" : "Explore Opportunities"}</h3>
            <span className="count-pill">{filteredList.length}</span>
          </div>

          {aiSearchResults && (
            <button type="button" onClick={handleClearAiSearch} className="section-link-btn">
              ← Back to Catalog
            </button>
          )}
        </div>

        <OpportunityFilters
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
        />

        {/* Catalog Grid State */}
        {oppLoading ? (
          <div className="opportunities-grid">
            <OpportunityCardSkeleton />
            <OpportunityCardSkeleton />
            <OpportunityCardSkeleton />
            <OpportunityCardSkeleton />
            <OpportunityCardSkeleton />
            <OpportunityCardSkeleton />
          </div>
        ) : oppError ? (
          <div className="inline-error-state">
            <AlertCircle size={18} />
            <span>{oppError}</span>
            <button type="button" onClick={fetchAllOpportunities} className="retry-btn">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="empty-state-box">
            <Search size={36} className="empty-icon" />
            <h4>No Opportunities Found</h4>
            <p>Try changing your filters, clearing search parameters, or describing a different role.</p>
            <button type="button" onClick={handleResetFilters} className="primary-action-btn">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="opportunities-grid">
            {filteredList.map((opp) => (
              <OpportunityCard key={opp._id || opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Opportunities;
