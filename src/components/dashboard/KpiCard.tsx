import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  icon?: ReactNode;
  iconColor?: "blue" | "teal" | "purple" | "amber";
  loading?: boolean;
  to?: string;
  onClick?: () => void;
}

const iconColorConfig = {
  blue: "bg-blue-50 text-blue-500",
  teal: "bg-teal-50 text-teal-500",
  purple: "bg-purple-50 text-purple-500",
  amber: "bg-amber-50 text-amber-500",
};

const interactiveColorConfig = {
  blue: "hover:shadow-xl hover:shadow-blue-200/80 focus-visible:ring-blue-400",
  teal: "hover:shadow-xl hover:shadow-teal-200/80 focus-visible:ring-teal-400",
  purple: "hover:shadow-xl hover:shadow-purple-200/80 focus-visible:ring-purple-400",
  amber: "hover:shadow-xl hover:shadow-amber-200/80 focus-visible:ring-amber-400",
};

export function KpiCard({
  title,
  value,
  subtitle,
  change,
  icon,
  iconColor = "blue",
  loading = false,
  to,
  onClick,
}: KpiCardProps) {
  const navigate = useNavigate();
  const isInteractive = Boolean(to || onClick);

  const handleClick = () => {
    onClick?.();
    if (to) {
      navigate(to);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-gray-200 rounded"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-200",
        isInteractive && [
          "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2",
          interactiveColorConfig[iconColor],
        ]
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
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && (
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", iconColorConfig[iconColor])}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      
      {subtitle && (
        <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
      )}
      
      {change && (
        <p className="text-sm font-medium text-teal-600">{change}</p>
      )}
    </div>
  );
}
