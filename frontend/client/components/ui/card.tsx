import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Base cyberpunk card styling - matches cyber-card-enhanced exactly
      "relative overflow-hidden rounded-lg",
      "bg-[radial-gradient(ellipse_at_top,rgba(0,255,255,0.1)_0%,transparent_70%),linear-gradient(135deg,rgba(0,255,255,0.05)_0%,rgba(0,0,0,0.95)_100%)]",
      "border border-cyber-cyan/30 backdrop-blur-[25px]",
      "transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1)",
      // Grid pattern overlay
      "before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,transparent,transparent_15px,rgba(0,255,255,0.02)_15px,rgba(0,255,255,0.02)_16px),repeating-linear-gradient(-45deg,transparent,transparent_30px,rgba(0,255,255,0.01)_30px,rgba(0,255,255,0.01)_31px)]",
      "before:pointer-events-none before:z-[1] before:animate-[cyber-grid-pulse_4s_ease-in-out_infinite]",
      // Hover effects
      "hover:transform hover:translate-y-[-8px] hover:scale-[1.03]",
      "hover:border-cyber-cyan/60",
      "hover:shadow-[0_20px_80px_rgba(0,255,255,0.2),0_0_60px_rgba(0,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]",
      // Border glow effect
      "after:absolute after:top-[-2px] after:left-[-2px] after:right-[-2px] after:bottom-[-2px]",
      "after:bg-[linear-gradient(45deg,rgba(0,255,255,0.1),transparent_30%,transparent_70%,rgba(0,255,255,0.1))]",
      "after:rounded-[calc(var(--radius)+2px)] after:z-[-1] after:opacity-0 after:transition-opacity after:duration-[400ms]",
      "hover:after:opacity-100",
      // Scanning line effect on hover
      "group",
      className,
    )}
    {...props}
  >
    {/* Scanning line effect */}
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-cyber-cyan/15 to-transparent group-hover:animate-[cyber-scan_0.8s_cubic-bezier(0.4,0,0.2,1)]" />
    </div>
    {children}
  </div>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 relative z-10", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      "cyber-glow group-hover:[&>svg]:animate-cyber-pulse transition-all duration-300",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0 relative z-10", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 relative z-10", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
