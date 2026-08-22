import {
  User,
  Sliders,
  Bell,
  Shield,
  KeyRound,
  Laptop,
  AlertTriangle,
} from "lucide-react";

const SECTIONS = [
  { id: "account", label: "Account", icon: User },
  { id: "preferences", label: "Job Preferences", icon: Sliders },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "security", label: "Security & Password", icon: KeyRound },
  { id: "sessions", label: "Sessions", icon: Laptop },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
];

const SettingsNavigation = ({ activeSection, onSelectSection }) => {
  return (
    <div className="settings-nav-sidebar">
      <nav className="settings-nav-list" aria-label="Settings Categories">
        {SECTIONS.map(({ id, label, icon: Icon, danger }) => {
          const isActive = activeSection === id;

          return (
            <button
              key={id}
              type="button"
              className={`settings-nav-item ${isActive ? "active" : ""} ${danger ? "danger-nav" : ""}`}
              onClick={() => onSelectSection(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SettingsNavigation;
