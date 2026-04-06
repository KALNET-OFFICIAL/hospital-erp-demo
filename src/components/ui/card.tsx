import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl bg-white transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border border-gray-100 shadow-sm hover:shadow-md",
        elevated: "shadow-sm hover:shadow-md",
        flat: "border border-gray-50",
        interactive:
          "border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
      },
      accent: {
        none: "",
        primary: "border-l-4 border-l-primary-500 hover:shadow-blue-200/80",
        success: "border-l-4 border-l-success-500 hover:shadow-green-200/80",
        warning: "border-l-4 border-l-warning-500 hover:shadow-amber-200/80",
        danger: "border-l-4 border-l-danger-500 hover:shadow-red-200/80",
        teal: "border-l-4 border-l-teal-500 hover:shadow-teal-200/80",
        violet: "border-l-4 border-l-violet-500 hover:shadow-violet-200/80",
      },
    },
    defaultVariants: {
      variant: "default",
      accent: "none",
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, accent, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, accent }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-5 pb-4", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-h3 text-slate-900 tracking-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-small text-slate-500", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-3 p-5 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
export type { CardProps };
