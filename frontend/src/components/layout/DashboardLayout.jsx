import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

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
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={handleCloseMobile}
      />

      <div className="main-shell">
        <Topbar
          onToggleMobile={handleToggleMobile}
          isMobileOpen={isMobileOpen}
        />

        <main className="page-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
