import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileBottomNav from "./MobileBottomNav";
import MobileHeader from "../mobile/MobileHeader";
import OfflineDetector from "../mobile/OfflineDetector";

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Prevent background scrolling while the mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const handleToggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const handleCloseMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="app-shell">
      {/* Offline Status Toast */}
      <OfflineDetector />

      {/* Mobile Top Header (<768px) */}
      <MobileHeader />

      {/* Desktop Sidebar (>=768px) */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={handleCloseMobile}
      />

      <div className="main-shell">
        {/* Desktop Topbar (>=768px) */}
        <Topbar
          onToggleMobile={handleToggleMobile}
          isMobileOpen={isMobileOpen}
        />

        <main className="page-content" id="main-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation (<768px) */}
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
