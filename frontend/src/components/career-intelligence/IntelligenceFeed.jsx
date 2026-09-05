import React from 'react';
import IntelligenceFeedItem from './IntelligenceFeedItem';
import CareerIntelligenceEmptyState from './CareerIntelligenceEmptyState';

const IntelligenceFeed = ({ feed = [] }) => {
  if (!feed || feed.length === 0) {
    return (
      <CareerIntelligenceEmptyState
        title="No Insights Found"
        description="No active intelligence items match your current filter parameters."
      />
    );
  }

  return (
    <div className="space-y-4">
      {feed.map((item, idx) => (
        <IntelligenceFeedItem key={item.id || idx} item={item} />
      ))}
    </div>
  );
};

export default IntelligenceFeed;
