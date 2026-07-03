import { cn } from "@/lib/utils";

// Loading placeholder. Flat (radius 0) per Metro Warm; token-driven surface.
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse bg-muted", className)} {...props} />;
}

export { Skeleton };
