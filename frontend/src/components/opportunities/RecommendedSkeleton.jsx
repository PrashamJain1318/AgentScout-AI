import OpportunityCardSkeleton from "./OpportunityCardSkeleton";

const RecommendedSkeleton = () => {
  return (
    <div className="recommendations-skeleton-grid">
      <OpportunityCardSkeleton />
      <OpportunityCardSkeleton />
      <OpportunityCardSkeleton />
    </div>
  );
};

export default RecommendedSkeleton;
