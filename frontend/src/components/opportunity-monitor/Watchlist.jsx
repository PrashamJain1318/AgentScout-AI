import { Bookmark, MapPin, ExternalLink, Trash2 } from "lucide-react";

const Watchlist = ({ items = [], onUnwatch }) => {
  const savedItems = items.filter(i => i.observation?.saved);

  if (savedItems.length === 0) {
    return (
      <div className="resume-section-card">
        <div className="section-header-flex">
          <div>
            <span className="eyebrow">SAVED WATCHLIST</span>
            <h3>Opportunity Watchlist</h3>
          </div>
        </div>
        <p className="no-data-text">No opportunities added to your watchlist yet. Click "Save" on any opportunity card to watch it here.</p>
      </div>
    );
  }

  return (
    <div className="resume-section-card">
      <div className="section-header-flex">
        <div>
          <span className="eyebrow">SAVED WATCHLIST</span>
          <h3>Opportunity Watchlist ({savedItems.length})</h3>
        </div>
      </div>

      <div className="suggestions-list-box" style={{ marginTop: "16px" }}>
        {savedItems.map((item) => {
          const opp = item.opportunity || {};
          return (
            <div key={opp._id || opp.id} className="suggestion-item-card flex-between">
              <div>
                <strong style={{ fontSize: "15px" }}>{opp.title}</strong>
                <p className="notif-subtext" style={{ margin: "2px 0 0 0" }}>
                  {opp.company} • <MapPin size={12} className="inline-icon" /> {opp.location || "Remote"}
                </p>
              </div>

              <div className="flex-between" style={{ gap: "10px" }}>
                <span className="text-primary font-bold" style={{ fontSize: "14px" }}>
                  {item.fit?.score || 80}% Match
                </span>

                <button
                  type="button"
                  className="icon-button logout-icon-button"
                  onClick={() => onUnwatch(opp._id || opp.id)}
                  title="Remove from watchlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Watchlist;
