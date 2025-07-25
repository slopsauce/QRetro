import { cn } from "@/lib/utils";

interface RetroFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function RetroFrame({ children, className }: RetroFrameProps) {
  return (
    <div className={cn("border-2 border-muted border-opacity-40 p-6 mb-6", className)}>
      {children}
    </div>
  );
}