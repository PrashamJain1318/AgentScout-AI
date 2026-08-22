const DetailsSkeleton = () => {
  return (
    <div className="details-skeleton-container">
      <div className="details-main-skeleton">
        <div className="skeleton-bar" style={{ width: "45%", height: "28px", marginBottom: "12px" }} />
        <div className="skeleton-bar" style={{ width: "30%", height: "16px", marginBottom: "24px" }} />
        <div className="skeleton-bar" style={{ width: "100%", height: "120px", marginBottom: "16px" }} />
        <div className="skeleton-bar" style={{ width: "100%", height: "180px" }} />
      </div>
      <div className="details-side-skeleton">
        <div className="skeleton-bar" style={{ width: "100%", height: "200px", marginBottom: "16px" }} />
        <div className="skeleton-bar" style={{ width: "100%", height: "160px" }} />
      </div>
    </div>
  );
};

export default DetailsSkeleton;
