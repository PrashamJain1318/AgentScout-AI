import OpportunityRecommendationCard from "./OpportunityRecommendationCard";

const OpportunityRecommendationGrid = ({ recommendations = [], onWatch, onUnwatch, onDismiss }) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {recommendations.map((item) => (
        <OpportunityRecommendationCard
          key={item.opportunity?._id || item.opportunity?.id}
          item={item}
          onWatch={onWatch}
          onUnwatch={onUnwatch}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

export default OpportunityRecommendationGrid;
