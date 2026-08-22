const ApplicationCardSkeleton = () => {
  return (
    <div className="application-card-item skeleton-card-box">
      <div className="card-top-row" style={{ gap: "14px" }}>
        <div className="skeleton-circle" style={{ width: "42px", height: "42px" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="skeleton-bar" style={{ width: "65%", height: "16px" }} />
          <div className="skeleton-bar" style={{ width: "40%", height: "12px" }} />
        </div>
        <div className="skeleton-bar" style={{ width: "80px", height: "26px", borderRadius: "20px" }} />
      </div>

      <div className="skeleton-bar" style={{ width: "85%", height: "14px", marginTop: "14px" }} />
      <div className="skeleton-bar" style={{ width: "100%", height: "36px", marginTop: "16px" }} />
    </div>
  );
};

export default ApplicationCardSkeleton;
