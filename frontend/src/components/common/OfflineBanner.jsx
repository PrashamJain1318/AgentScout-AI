import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !showRestored) return null;

  return (
    <div
      className={`offline-banner-sticky ${isOffline ? "banner-offline" : "banner-restored"}`}
      role="status"
      aria-live="assertive"
    >
      <div className="offline-banner-content">
        {isOffline ? (
          <>
            <WifiOff size={15} className="offline-icon" />
            <span>You are offline. AgentScout-AI will sync automatically once reconnected.</span>
          </>
        ) : (
          <>
            <Wifi size={15} className="restored-icon" />
            <span>Connection restored! Syncing career workspace...</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
