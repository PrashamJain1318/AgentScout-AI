const ApplicationTableSkeleton = () => {
  return (
    <div className="skeleton-table-wrapper">
      {[1, 2, 3, 4, 5].map((idx) => (
        <div key={idx} className="skeleton-table-row">
          <div className="skeleton-circle" style={{ width: "36px", height: "36px" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <div className="skeleton-bar" style={{ width: "50%", height: "14px" }} />
            <div className="skeleton-bar" style={{ width: "30%", height: "12px" }} />
          </div>
          <div className="skeleton-bar" style={{ width: "80px", height: "24px", borderRadius: "12px" }} />
          <div className="skeleton-bar" style={{ width: "90px", height: "14px" }} />
        </div>
      ))}
    </div>
  );
};

export default ApplicationTableSkeleton;
