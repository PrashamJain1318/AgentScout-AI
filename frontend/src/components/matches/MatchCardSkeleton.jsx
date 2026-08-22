const MatchCardSkeleton = () => {
  return (
    <div className="match-card-container skeleton-card-box">
      <div className="card-top-row">
        <div className="skeleton-circle" style={{ width: "42px", height: "42px" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="skeleton-bar" style={{ width: "60%", height: "16px" }} />
          <div className="skeleton-bar" style={{ width: "40%", height: "12px" }} />
        </div>
        <div className="skeleton-bar" style={{ width: "90px", height: "30px", borderRadius: "20px" }} />
      </div>

      <div className="skeleton-bar" style={{ width: "80%", height: "14px", marginTop: "14px" }} />
      <div className="skeleton-bar" style={{ width: "100%", height: "48px", marginTop: "14px", borderRadius: "8px" }} />
      <div className="skeleton-bar" style={{ width: "100%", height: "36px", marginTop: "16px" }} />
    </div>
  );
};

export default MatchCardSkeleton;
