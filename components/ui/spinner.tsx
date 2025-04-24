import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12"
};

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <div role="status" className="animate-spin" {...props}>
      <div className={cn(
        "border-4 border-gray-200 border-t-blue-600 rounded-full",
        sizeClasses[size],
        className
      )} />
      <span className="sr-only">Cargando...</span>
    </div>
  );
} 