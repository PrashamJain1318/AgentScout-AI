export const AnalyticsSkeleton = ({ title = "Loading Analytics..." }) => {
  return (
    <div className="analytics-section-card skeleton-card-box">
      <div className="skeleton-bar title-bar" style={{ width: "30%", height: "20px" }}></div>
      <div className="skeleton-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginTop: "16px" }}>
        <div className="skeleton-card" style={{ height: "90px" }}></div>
        <div className="skeleton-card" style={{ height: "90px" }}></div>
        <div className="skeleton-card" style={{ height: "90px" }}></div>
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;
