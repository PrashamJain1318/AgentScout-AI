import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ compact = false }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (mode) => {
    setTheme(mode);
    setIsOpen(false);
  };

  const getIcon = () => {
    if (theme === "system") return <Monitor size={17} />;
    return resolvedTheme === "dark" ? <Moon size={17} /> : <Sun size={17} />;
  };

  const getLabel = () => {
    if (theme === "system") return "System";
    return theme === "dark" ? "Dark" : "Light";
  };

  return (
    <div className="theme-toggle-container" ref={dropdownRef}>
      <button
        type="button"
        className={`theme-toggle-btn ${compact ? "compact" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Select color theme"
        title={`Current theme: ${getLabel()}`}
      >
        <span className="theme-toggle-icon">{getIcon()}</span>
        {!compact && <span className="theme-toggle-label">{getLabel()}</span>}
        <ChevronDown size={13} className={`theme-chevron ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="theme-dropdown-menu" role="menu">
          <button
            type="button"
            className={`theme-dropdown-item ${theme === "light" ? "active" : ""}`}
            onClick={() => handleSelect("light")}
            role="menuitem"
          >
            <Sun size={15} />
            <span>Light</span>
            {theme === "light" && <span className="active-dot" />}
          </button>

          <button
            type="button"
            className={`theme-dropdown-item ${theme === "dark" ? "active" : ""}`}
            onClick={() => handleSelect("dark")}
            role="menuitem"
          >
            <Moon size={15} />
            <span>Dark</span>
            {theme === "dark" && <span className="active-dot" />}
          </button>

          <button
            type="button"
            className={`theme-dropdown-item ${theme === "system" ? "active" : ""}`}
            onClick={() => handleSelect("system")}
            role="menuitem"
          >
            <Monitor size={15} />
            <span>System</span>
            {theme === "system" && <span className="active-dot" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
