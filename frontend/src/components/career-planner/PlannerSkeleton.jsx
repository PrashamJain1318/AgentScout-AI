const PlannerSkeleton = () => {
  return (
    <div className="skeleton-details-body" style={{ minHeight: "420px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div className="skeleton-card" style={{ height: "120px" }} />
      <div className="skeleton-card" style={{ height: "200px" }} />
      <div className="skeleton-card" style={{ height: "240px" }} />
    </div>
  );
};

export default PlannerSkeleton;
