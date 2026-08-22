const MatchStatsSkeleton = () => {
  return (
    <div className="kpi-grid">
      {[1, 2, 3, 4].map((idx) => (
        <div key={idx} className="kpi-card skeleton-card-box">
          <div className="skeleton-circle" style={{ width: "38px", height: "38px" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <div className="skeleton-bar" style={{ width: "50%", height: "12px" }} />
            <div className="skeleton-bar" style={{ width: "30%", height: "20px" }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchStatsSkeleton;
