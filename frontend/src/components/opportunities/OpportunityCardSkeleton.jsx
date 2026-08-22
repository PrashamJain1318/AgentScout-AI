const OpportunityCardSkeleton = () => {
  return (
    <div className="opportunity-card-reusable skeleton-card-box">
      <div className="card-top-row" style={{ gap: "14px" }}>
        <div className="skeleton-circle" style={{ width: "42px", height: "42px" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="skeleton-bar" style={{ width: "60%", height: "16px" }} />
          <div className="skeleton-bar" style={{ width: "35%", height: "12px" }} />
        </div>
      </div>
      <div className="skeleton-bar" style={{ width: "80%", height: "14px", marginTop: "12px" }} />
      <div className="skeleton-bar" style={{ width: "50%", height: "14px", marginTop: "8px" }} />
    </div>
  );
};

export default OpportunityCardSkeleton;
