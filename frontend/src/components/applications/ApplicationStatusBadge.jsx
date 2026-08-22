import {
  Bookmark,
  Send,
  Search,
  Users,
  Award,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export const getStatusMeta = (status = "saved") => {
  const normalized = String(status).toLowerCase();

  switch (normalized) {
    case "saved":
      return { label: "Saved", icon: Bookmark, badgeClass: "status-saved" };
    case "applied":
      return { label: "Applied", icon: Send, badgeClass: "status-applied" };
    case "screening":
      return { label: "Screening", icon: Search, badgeClass: "status-screening" };
    case "interview":
      return { label: "Interview", icon: Users, badgeClass: "status-interview" };
    case "offer":
      return { label: "Offer", icon: Award, badgeClass: "status-offer" };
    case "accepted":
      return { label: "Accepted", icon: CheckCircle, badgeClass: "status-accepted" };
    case "rejected":
      return { label: "Rejected", icon: XCircle, badgeClass: "status-rejected" };
    case "withdrawn":
      return { label: "Withdrawn", icon: Clock, badgeClass: "status-withdrawn" };
    default:
      return { label: status, icon: Bookmark, badgeClass: "status-saved" };
  }
};

const ApplicationStatusBadge = ({ status = "saved", size = "normal" }) => {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;

  return (
    <span className={`application-status-badge ${meta.badgeClass} ${size}`}>
      <Icon size={size === "large" ? 15 : 13} />
      <span>{meta.label}</span>
    </span>
  );
};

export default ApplicationStatusBadge;
