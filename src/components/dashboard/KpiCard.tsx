import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { getIdentityColor, getCurrentThemeMode } from "@/lib/theme";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  icon?: ReactNode;
  /** Identity key (e.g. a nav path or category name) the icon chip's
   *  accent is hashed from — same key always yields the same color, kept
   *  in sync with the sidebar/tag color for that module. Falls back to
   *  `title` when omitted. */
  iconColor?: string;
  loading?: boolean;
  to?: string;
  onClick?: () => void;
}

export function KpiCard({
  title,
  value,
  subtitle,
  change,
  icon,
  iconColor,
  loading = false,
  to,
  onClick,
}: KpiCardProps) {
  const navigate = useNavigate();
  const isInteractive = Boolean(to || onClick);
  const accent = getIdentityColor(iconColor ?? title, getCurrentThemeMode());

  const handleClick = () => {
    onClick?.();
    if (to) {
      navigate(to);
    }
  };

  if (loading) {
    return (
      <div className="bg-paper rounded-xl border border-line p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-slate-200 rounded"></div>
            <div className="h-10 w-10 bg-slate-200 rounded-xl"></div>
          </div>
          <div className="h-10 w-24 bg-slate-200 rounded"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-paper rounded-xl border border-line p-6 shadow-sm transition-all duration-200",
        isInteractive &&
          "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
      )}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={
        isInteractive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-ink-muted">{title}</h3>
        {icon && (
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${accent}1f`, color: accent }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mb-3">
        <p className="text-3xl font-bold text-ink">{value}</p>
      </div>

      {subtitle && (
        <p className="text-sm text-ink-muted mb-2">{subtitle}</p>
      )}

      {change && (
        <p className="text-sm font-medium text-success-600">{change}</p>
      )}
    </div>
  );
}
