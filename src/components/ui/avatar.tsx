import * as React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { getIdentityColor, getCurrentThemeMode } from "@/lib/theme";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = "md", ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    if (src && !imageError) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative flex shrink-0 overflow-hidden rounded-full",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="aspect-square h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    const accent = getIdentityColor(name || "?", getCurrentThemeMode());

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium",
          sizeClasses[size],
          className
        )}
        style={{ backgroundColor: `${accent}1f`, color: accent }}
        {...props}
      >
        {name ? getInitials(name) : "?"}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
