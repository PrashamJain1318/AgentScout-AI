const ApplicationDetailsSkeleton = () => {
  return (
    <div className="details-skeleton-container" style={{ gridTemplateColumns: "1fr 360px", gap: "24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="skeleton-bar" style={{ width: "100%", height: "120px", borderRadius: "16px" }} />
        <div className="skeleton-bar" style={{ width: "100%", height: "240px", borderRadius: "16px" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="skeleton-bar" style={{ width: "100%", height: "180px", borderRadius: "16px" }} />
        <div className="skeleton-bar" style={{ width: "100%", height: "200px", borderRadius: "16px" }} />
      </div>
    </div>
  );
};

export default ApplicationDetailsSkeleton;
